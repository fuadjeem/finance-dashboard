"use client";
import { useState, useEffect, useCallback } from "react";
import TransactionModal from "@/components/TransactionModal";

interface Transaction {
    id: string;
    type: string;
    amountCents: number;
    categoryId: string;
    date: string;
    note: string;
    category: { name: string };
}

function formatCurrency(cents: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(cents / 100);
}

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editTx, setEditTx] = useState<Transaction | null>(null);
    const [filterType, setFilterType] = useState("");
    const [search, setSearch] = useState("");
    const [offset, setOffset] = useState(0);
    const limit = 20;

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (filterType) params.set("type", filterType);
        if (search) params.set("search", search);
        params.set("limit", String(limit));
        params.set("offset", String(offset));

        const res = await fetch(`/api/transactions?${params}`);
        const data = await res.json();
        setTransactions(data.transactions || []);
        setTotal(data.total || 0);
        setLoading(false);
    }, [filterType, search, offset]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this transaction?")) return;
        await fetch(`/api/transactions/${id}`, { method: "DELETE" });
        fetchTransactions();
    };

    return (
        <>
            <div className="page-header">
                <h1>Transactions</h1>
                <button className="btn btn-primary" onClick={() => { setEditTx(null); setShowModal(true); }}>
                    + Add Transaction
                </button>
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: 24, padding: 16 }}>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                    <select
                        className="form-input"
                        style={{ width: "auto", minWidth: 140 }}
                        value={filterType}
                        onChange={(e) => { setFilterType(e.target.value); setOffset(0); }}
                    >
                        <option value="">All Types</option>
                        <option value="COST">Costs</option>
                        <option value="INCOME">Income</option>
                    </select>
                    <input
                        type="text"
                        className="form-input"
                        style={{ flex: 1, minWidth: 200 }}
                        placeholder="🔍 Search notes..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setOffset(0); }}
                    />
                    <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
                        {total} total transactions
                    </span>
                </div>
            </div>

            {/* Table */}
            <div className="card">
                {loading ? (
                    <div className="skeleton" style={{ height: 300 }} />
                ) : transactions.length > 0 ? (
                    <>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Type</th>
                                        <th>Category</th>
                                        <th>Amount</th>
                                        <th>Note</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((tx) => (
                                        <tr key={tx.id}>
                                            <td>{tx.date}</td>
                                            <td>
                                                <span style={{
                                                    color: tx.type === "INCOME" ? "var(--accent-green)" : "var(--accent-red)",
                                                    fontWeight: 600,
                                                    fontSize: 12,
                                                    textTransform: "uppercase"
                                                }}>
                                                    {tx.type}
                                                </span>
                                            </td>
                                            <td><span className="category-badge">{tx.category.name}</span></td>
                                            <td className={tx.type === "INCOME" ? "amount-income" : "amount-cost"}>
                                                {tx.type === "INCOME" ? "+" : "−"}{formatCurrency(tx.amountCents)}
                                            </td>
                                            <td style={{ color: "var(--text-muted)" }}>{tx.note || "—"}</td>
                                            <td>
                                                <div className="table-actions">
                                                    <button
                                                        className="btn btn-ghost btn-icon"
                                                        title="Edit"
                                                        onClick={() => { setEditTx(tx); setShowModal(true); }}
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        className="btn btn-ghost btn-icon"
                                                        title="Delete"
                                                        onClick={() => handleDelete(tx.id)}
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {total > limit && (
                            <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border-subtle)" }}>
                                <button
                                    className="btn btn-secondary"
                                    disabled={offset === 0}
                                    onClick={() => setOffset(Math.max(0, offset - limit))}
                                >
                                    ← Previous
                                </button>
                                <span style={{ color: "var(--text-muted)", fontSize: 13, display: "flex", alignItems: "center" }}>
                                    Page {Math.floor(offset / limit) + 1} of {Math.ceil(total / limit)}
                                </span>
                                <button
                                    className="btn btn-secondary"
                                    disabled={offset + limit >= total}
                                    onClick={() => setOffset(offset + limit)}
                                >
                                    Next →
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="empty-state">
                        <div className="icon">💳</div>
                        <h3>No transactions found</h3>
                        <p>{search ? "Try a different search term" : "Add your first transaction to get started"}</p>
                    </div>
                )}
            </div>

            {showModal && (
                <TransactionModal
                    editData={editTx ? {
                        id: editTx.id,
                        type: editTx.type,
                        amountCents: editTx.amountCents,
                        categoryId: editTx.categoryId,
                        date: editTx.date,
                        note: editTx.note,
                    } : undefined}
                    onClose={() => { setShowModal(false); setEditTx(null); }}
                    onSaved={() => {
                        setShowModal(false);
                        setEditTx(null);
                        fetchTransactions();
                    }}
                />
            )}
        </>
    );
}
