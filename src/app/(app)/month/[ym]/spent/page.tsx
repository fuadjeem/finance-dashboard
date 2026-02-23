"use client";
import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/currency";

interface CategorySpend {
    id: string;
    name: string;
    type: string;
    totalCents: number;
}

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

export default function SpentDetailPage({ params }: { params: Promise<{ ym: string }> }) {
    const { ym } = use(params);
    const router = useRouter();
    const [month, setMonth] = useState(ym);
    const [categories, setCategories] = useState<CategorySpend[]>([]);
    const [loading, setLoading] = useState(true);
    const [currency, setCurrency] = useState("USD");

    // Drill-down state
    const [drillCategory, setDrillCategory] = useState<string | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [allCategories, setAllCategories] = useState<CategoryInfo[]>([]);
    const [txLoading, setTxLoading] = useState(false);
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
            const res = await fetch(`/api/categories/spending?month=${month}`);
            const data = await res.json();
            setCategories((data || []).filter((c: CategorySpend) => c.type === "COST"));
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }, [month]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const fetchTransactions = useCallback(async (catId: string) => {
        setTxLoading(true);
        try {
            const [y, m] = month.split("-").map(Number);
            const startDate = `${month}-01`;
            const endDate = `${y}-${String(m).padStart(2, "0")}-${new Date(y, m, 0).getDate()}`;
            const res = await fetch(`/api/transactions?categoryId=${catId}&startDate=${startDate}&endDate=${endDate}&limit=200`);
            const data = await res.json();
            setTransactions(data.transactions || []);
        } catch (err) {
            console.error(err);
        }
        setTxLoading(false);
        setSelectedIds(new Set());
    }, [month]);

    const navigateMonth = (delta: number) => {
        const [y, m] = month.split("-").map(Number);
        const d = new Date(y, m - 1 + delta, 1);
        const newMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        setMonth(newMonth);
        setDrillCategory(null);
        router.replace(`/month/${newMonth}/spent`);
    };

    const monthLabel = (() => {
        const [y, m] = month.split("-");
        const d = new Date(parseInt(y), parseInt(m) - 1);
        return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    })();

    const totalSpent = categories.reduce((sum, c) => sum + c.totalCents, 0);

    const handleDrill = (catId: string) => {
        if (drillCategory === catId) {
            setDrillCategory(null);
            return;
        }
        setDrillCategory(catId);
        fetchTransactions(catId);
    };

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
            fetchData();
            if (drillCategory) fetchTransactions(drillCategory);
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
            fetchData();
            if (drillCategory) fetchTransactions(drillCategory);
        } catch (err) {
            console.error(err);
        }
        setActionLoading(false);
    };

    const costCategories = allCategories.filter((c) => c.type === "COST");

    return (
        <div className="detail-page">
            <div className="detail-header">
                <button className="back-btn" onClick={() => router.back()}>← Back</button>
                <h1>Spending Overview</h1>
                <div className="detail-total">{fmt(totalSpent)}</div>
            </div>

            <div className="month-selector" style={{ marginBottom: 20, justifyContent: "center" }}>
                <button onClick={() => navigateMonth(-1)}>‹</button>
                <span className="current-month">{monthLabel}</span>
                <button onClick={() => navigateMonth(1)}>›</button>
            </div>

            {loading ? (
                <div className="skeleton" style={{ height: 200 }} />
            ) : categories.length > 0 ? (
                <div className="spending-categories">
                    {categories.map((cat) => (
                        <div key={cat.id}>
                            <div
                                className="spending-category-row"
                                style={{ cursor: "pointer" }}
                                onClick={() => handleDrill(cat.id)}
                            >
                                <span className="spending-cat-name">{cat.name}</span>
                                <div className="spending-cat-right">
                                    <span className="spending-cat-amount">{fmt(cat.totalCents)}</span>
                                    <span className="spending-cat-percent">
                                        {totalSpent > 0 ? `${Math.round((cat.totalCents / totalSpent) * 100)}%` : "—"}
                                    </span>
                                    <span style={{ fontSize: 12, marginLeft: 4 }}>{drillCategory === cat.id ? "▲" : "▼"}</span>
                                </div>
                            </div>
                            {drillCategory === cat.id && (
                                <div style={{ padding: "0 0 12px 0" }}>
                                    {/* Bulk actions */}
                                    {selectedIds.size > 0 && (
                                        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", padding: "8px 12px", background: "var(--bg-card)", borderRadius: 8, margin: "8px 0" }}>
                                            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{selectedIds.size} selected</span>
                                            <select
                                                className="form-input"
                                                style={{ width: "auto", minWidth: 140, padding: "4px 8px", fontSize: 12 }}
                                                value={reassignCatId}
                                                onChange={(e) => setReassignCatId(e.target.value)}
                                            >
                                                <option value="">Move to...</option>
                                                {costCategories.filter((c) => c.id !== cat.id).map((c) => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </select>
                                            <button className="btn btn-primary" style={{ padding: "4px 10px", fontSize: 12 }} disabled={!reassignCatId || actionLoading} onClick={handleRecategorize}>Move</button>
                                            <button className="btn btn-secondary" style={{ padding: "4px 10px", fontSize: 12 }} disabled={actionLoading} onClick={() => handleToggleExclude(true)}>Exclude</button>
                                            <button className="btn btn-secondary" style={{ padding: "4px 10px", fontSize: 12 }} disabled={actionLoading} onClick={() => handleToggleExclude(false)}>Include</button>
                                        </div>
                                    )}
                                    {txLoading ? (
                                        <div className="skeleton" style={{ height: 80, margin: "8px 0" }} />
                                    ) : transactions.length > 0 ? (
                                        <div className="table-container" style={{ marginTop: 4 }}>
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th style={{ width: 32 }}>
                                                            <input type="checkbox" checked={selectedIds.size === transactions.length && transactions.length > 0} onChange={toggleSelectAll} />
                                                        </th>
                                                        <th>Date</th>
                                                        <th>Amount</th>
                                                        <th>Note</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {transactions.map((tx) => (
                                                        <tr key={tx.id} style={{ opacity: tx.excluded ? 0.5 : 1, textDecoration: tx.excluded ? "line-through" : "none" }}>
                                                            <td><input type="checkbox" checked={selectedIds.has(tx.id)} onChange={() => toggleSelect(tx.id)} /></td>
                                                            <td>{tx.date}</td>
                                                            <td className="amount-cost">
                                                                {fmt(tx.amountCents)}
                                                                {tx.excluded && <span style={{ marginLeft: 4, fontSize: 10, color: "var(--text-muted)" }}>excluded</span>}
                                                            </td>
                                                            <td style={{ color: "var(--text-muted)" }}>{tx.note || "—"}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div style={{ padding: 12, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No transactions</div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <div className="icon">🛒</div>
                    <h3>No spending</h3>
                    <p>No expenses recorded for {monthLabel}</p>
                </div>
            )}
        </div>
    );
}
