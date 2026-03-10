"use client";
import { useState, useEffect, useCallback, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { useCurrency } from "@/components/CurrencyProvider";

interface Transaction {
    id: string;
    type: string;
    amountCents: number;
    date: string;
    note: string;
    excluded: boolean;
    categoryId: string;
    category: { name: string };
}

interface CategoryInfo {
    id: string;
    name: string;
    type: string;
}

export default function CategoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const searchParams = useSearchParams();

    const [month, setMonth] = useState(() => {
        const m = searchParams.get("month");
        if (m) return m;
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    });

    const [category, setCategory] = useState<CategoryInfo | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [allCategories, setAllCategories] = useState<CategoryInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [reassignCatId, setReassignCatId] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const { fmt, symbol } = useCurrency();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [y, m] = month.split("-").map(Number);
            const startDate = `${month}-01`;
            const endDate = `${y}-${String(m).padStart(2, "0")}-${new Date(y, m, 0).getDate()}`;

            const [txRes, catRes] = await Promise.all([
                fetch(`/api/transactions?categoryId=${id}&startDate=${startDate}&endDate=${endDate}&limit=200`),
                fetch(`/api/categories`),
            ]);
            const txData = await txRes.json();
            const catData = await catRes.json();

            setTransactions(txData.transactions || []);
            setAllCategories(catData || []);

            if (txData.transactions?.length > 0) {
                setCategory({
                    id,
                    name: txData.transactions[0].category?.name || "Category",
                    type: txData.transactions[0].type || "COST",
                });
            } else {
                const found = catData.find((c: CategoryInfo) => c.id === id);
                if (found) setCategory(found);
            }
        } catch (err) {
            console.error("Failed to fetch:", err);
        }
        setLoading(false);
        setSelectedIds(new Set());
    }, [id, month]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const navigateMonth = (delta: number) => {
        const [y, m] = month.split("-").map(Number);
        const d = new Date(y, m - 1 + delta, 1);
        setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    };

    const monthLabel = (() => {
        const [y, m] = month.split("-");
        const d = new Date(parseInt(y), parseInt(m) - 1);
        return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    })();

    const toggleSelect = (txId: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(txId)) next.delete(txId);
            else next.add(txId);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === transactions.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(transactions.map((t) => t.id)));
        }
    };

    const handleRecategorize = async () => {
        if (!reassignCatId || selectedIds.size === 0) return;
        setActionLoading(true);
        try {
            await Promise.all(
                Array.from(selectedIds).map((txId) =>
                    fetch(`/api/transactions/${txId}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ categoryId: reassignCatId }),
                    })
                )
            );
            await fetchData();
        } catch (err) {
            console.error(err);
        }
        setActionLoading(false);
    };

    const handleToggleExclude = async (exclude: boolean) => {
        if (selectedIds.size === 0) return;
        setActionLoading(true);
        try {
            await Promise.all(
                Array.from(selectedIds).map((txId) =>
                    fetch(`/api/transactions/${txId}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ excluded: exclude }),
                    })
                )
            );
            await fetchData();
        } catch (err) {
            console.error(err);
        }
        setActionLoading(false);
    };

    // Build daily chart data (only non-excluded)
    const dailyData = (() => {
        const [y, m] = month.split("-").map(Number);
        const daysInMonth = new Date(y, m, 0).getDate();
        const dayMap: Record<string, number> = {};
        for (let d = 1; d <= daysInMonth; d++) {
            const key = `${month}-${String(d).padStart(2, "0")}`;
            dayMap[key] = 0;
        }
        for (const tx of transactions) {
            if (!tx.excluded && dayMap[tx.date] !== undefined) {
                dayMap[tx.date] += tx.amountCents;
            }
        }
        return Object.entries(dayMap).map(([date, cents]) => ({
            day: parseInt(date.split("-")[2]),
            amount: cents / 100,
        }));
    })();

    const totalCents = transactions.filter((t) => !t.excluded).reduce((sum, tx) => sum + tx.amountCents, 0);
    const sameTypeCategories = allCategories.filter((c) => c.type === (category?.type || "COST"));

    return (
        <div className="detail-page">
            <div className="detail-header">
                <button className="back-btn" onClick={() => router.back()} aria-label="Go back">
                    ← Back
                </button>
                <h1>{category?.name || "Category"}</h1>
                <div className="detail-total">{fmt(totalCents)}</div>
            </div>

            <div className="month-selector" style={{ marginBottom: 20, justifyContent: "center" }}>
                <button onClick={() => navigateMonth(-1)}>‹</button>
                <span className="current-month">{monthLabel}</span>
                <button onClick={() => navigateMonth(1)}>›</button>
            </div>

            {/* Daily spending line chart */}
            <div className="card chart-container">
                <div className="card-header">
                    <h2 className="card-title">Daily Spending</h2>
                </div>
                {loading ? (
                    <div className="skeleton" style={{ height: 200 }} />
                ) : (
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={dailyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                            <XAxis dataKey="day" stroke="#6b7280" fontSize={11} />
                            <YAxis stroke="#6b7280" fontSize={11} tickFormatter={(v) => `${symbol}${v}`} />
                            <Tooltip
                                contentStyle={{
                                    background: "#1a1a2e",
                                    border: "1px solid rgba(99,102,241,0.3)",
                                    borderRadius: 8,
                                    color: "#e8eaf6",
                                }}
                                formatter={(value: number | undefined) => [`${symbol}${(value ?? 0).toFixed(2)}`, "Spent"]}
                            />
                            <Line type="monotone" dataKey="amount" stroke="#f43f5e" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Bulk actions bar */}
            {selectedIds.size > 0 && (
                <div className="card" style={{ marginBottom: 16, padding: 12 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                            {selectedIds.size} selected
                        </span>
                        <select
                            className="form-input"
                            style={{ width: "auto", minWidth: 160, padding: "6px 10px", fontSize: 13 }}
                            value={reassignCatId}
                            onChange={(e) => setReassignCatId(e.target.value)}
                        >
                            <option value="">Move to category...</option>
                            {sameTypeCategories.filter((c) => c.id !== id).map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        <button
                            className="btn btn-primary"
                            style={{ padding: "6px 14px", fontSize: 13 }}
                            disabled={!reassignCatId || actionLoading}
                            onClick={handleRecategorize}
                        >
                            {actionLoading ? "..." : "Move"}
                        </button>
                        <button
                            className="btn btn-secondary"
                            style={{ padding: "6px 14px", fontSize: 13 }}
                            disabled={actionLoading}
                            onClick={() => handleToggleExclude(true)}
                        >
                            Exclude
                        </button>
                        <button
                            className="btn btn-secondary"
                            style={{ padding: "6px 14px", fontSize: 13 }}
                            disabled={actionLoading}
                            onClick={() => handleToggleExclude(false)}
                        >
                            Include
                        </button>
                    </div>
                </div>
            )}

            {/* Transaction table */}
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Transactions ({transactions.length})</h2>
                </div>
                {transactions.length > 0 ? (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: 36 }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.size === transactions.length && transactions.length > 0}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Note</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((tx) => (
                                    <tr
                                        key={tx.id}
                                        style={{
                                            opacity: tx.excluded ? 0.5 : 1,
                                            textDecoration: tx.excluded ? "line-through" : "none",
                                        }}
                                    >
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(tx.id)}
                                                onChange={() => toggleSelect(tx.id)}
                                            />
                                        </td>
                                        <td>{tx.date}</td>
                                        <td className="amount-cost">
                                            {fmt(tx.amountCents)}
                                            {tx.excluded && <span style={{ marginLeft: 6, fontSize: 10, color: "var(--text-muted)" }}>excluded</span>}
                                        </td>
                                        <td style={{ color: "var(--text-muted)" }}>{tx.note || "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="icon">🧾</div>
                        <h3>No transactions</h3>
                        <p>No transactions in this category for {monthLabel}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
