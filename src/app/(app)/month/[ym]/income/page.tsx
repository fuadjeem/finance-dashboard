"use client";
import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/currency";

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

export default function IncomeDetailPage({ params }: { params: Promise<{ ym: string }> }) {
    const { ym } = use(params);
    const router = useRouter();
    const [month, setMonth] = useState(ym);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [allCategories, setAllCategories] = useState<CategoryInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [currency, setCurrency] = useState("USD");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [reassignCatId, setReassignCatId] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetch("/api/user/currency")
            .then((r) => r.json())
            .then((data) => setCurrency(data.currency || "USD"))
            .catch(() => { });
        fetch("/api/categories")
            .then((r) => r.json())
            .then((data) => setAllCategories(data || []))
            .catch(() => { });
    }, []);

    const fmt = useCallback((cents: number) => formatCurrency(cents, currency), [currency]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [y, m] = month.split("-").map(Number);
            const startDate = `${month}-01`;
            const endDate = `${y}-${String(m).padStart(2, "0")}-${new Date(y, m, 0).getDate()}`;

            const res = await fetch(
                `/api/transactions?type=INCOME&startDate=${startDate}&endDate=${endDate}&limit=200`
            );
            const data = await res.json();
            setTransactions(data.transactions || []);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
        setSelectedIds(new Set());
    }, [month]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const navigateMonth = (delta: number) => {
        const [y, m] = month.split("-").map(Number);
        const d = new Date(y, m - 1 + delta, 1);
        const newMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        setMonth(newMonth);
        router.replace(`/month/${newMonth}/income`);
    };

    const monthLabel = (() => {
        const [y, m] = month.split("-");
        const d = new Date(parseInt(y), parseInt(m) - 1);
        return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    })();

    const totalIncome = transactions.filter((t) => !t.excluded).reduce((sum, tx) => sum + tx.amountCents, 0);
    const incomeCategories = allCategories.filter((c) => c.type === "INCOME");

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

    return (
        <div className="detail-page">
            <div className="detail-header">
                <button className="back-btn" onClick={() => router.back()}>← Back</button>
                <h1>Income Overview</h1>
                <div className="detail-total positive">{fmt(totalIncome)}</div>
            </div>

            <div className="month-selector" style={{ marginBottom: 20, justifyContent: "center" }}>
                <button onClick={() => navigateMonth(-1)}>‹</button>
                <span className="current-month">{monthLabel}</span>
                <button onClick={() => navigateMonth(1)}>›</button>
            </div>

            {/* Bulk actions */}
            {selectedIds.size > 0 && (
                <div className="card" style={{ marginBottom: 16, padding: 12 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{selectedIds.size} selected</span>
                        <select
                            className="form-input"
                            style={{ width: "auto", minWidth: 160, padding: "6px 10px", fontSize: 13 }}
                            value={reassignCatId}
                            onChange={(e) => setReassignCatId(e.target.value)}
                        >
                            <option value="">Move to category...</option>
                            {incomeCategories.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        <button className="btn btn-primary" style={{ padding: "6px 14px", fontSize: 13 }} disabled={!reassignCatId || actionLoading} onClick={handleRecategorize}>
                            {actionLoading ? "..." : "Move"}
                        </button>
                        <button className="btn btn-secondary" style={{ padding: "6px 14px", fontSize: 13 }} disabled={actionLoading} onClick={() => handleToggleExclude(true)}>Exclude</button>
                        <button className="btn btn-secondary" style={{ padding: "6px 14px", fontSize: 13 }} disabled={actionLoading} onClick={() => handleToggleExclude(false)}>Include</button>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="skeleton" style={{ height: 200 }} />
            ) : transactions.length > 0 ? (
                <div className="card">
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: 36 }}>
                                        <input type="checkbox" checked={selectedIds.size === transactions.length && transactions.length > 0} onChange={toggleSelectAll} />
                                    </th>
                                    <th>Date</th>
                                    <th>Category</th>
                                    <th>Amount</th>
                                    <th>Note</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((tx) => (
                                    <tr key={tx.id} style={{ opacity: tx.excluded ? 0.5 : 1, textDecoration: tx.excluded ? "line-through" : "none" }}>
                                        <td><input type="checkbox" checked={selectedIds.has(tx.id)} onChange={() => toggleSelect(tx.id)} /></td>
                                        <td>{tx.date}</td>
                                        <td><span className="category-badge">{tx.category.name}</span></td>
                                        <td className="amount-income">
                                            {fmt(tx.amountCents)}
                                            {tx.excluded && <span style={{ marginLeft: 4, fontSize: 10, color: "var(--text-muted)" }}>excluded</span>}
                                        </td>
                                        <td style={{ color: "var(--text-muted)" }}>{tx.note || "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="empty-state">
                    <div className="icon">💵</div>
                    <h3>No income</h3>
                    <p>No income recorded for {monthLabel}</p>
                </div>
            )}
        </div>
    );
}
