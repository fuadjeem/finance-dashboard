"use client";
import { useState, useEffect } from "react";
import { useCurrency } from "@/components/CurrencyProvider";

interface Category {
    id: string;
    name: string;
    type: string;
    active: boolean;
}

interface TransactionModalProps {
    onClose: () => void;
    onSaved: () => void;
    editData?: {
        id: string;
        type: string;
        amountCents: number;
        categoryId: string;
        date: string;
        note: string;
    };
}

export default function TransactionModal({ onClose, onSaved, editData }: TransactionModalProps) {
    const { symbol: currencySymbol } = useCurrency();
    const [type, setType] = useState(editData?.type || "COST");
    const [amount, setAmount] = useState(editData ? (editData.amountCents / 100).toString() : "");
    const [categoryId, setCategoryId] = useState(editData?.categoryId || "");
    const [date, setDate] = useState(editData?.date || new Date().toISOString().slice(0, 10));
    const [note, setNote] = useState(editData?.note || "");
    const [categories, setCategories] = useState<Category[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch(`/api/categories?type=${type}`)
            .then((r) => r.json())
            .then((data) => {
                setCategories(data);
                if (!editData && data.length > 0 && !categoryId) {
                    setCategoryId(data[0].id);
                }
            });
    }, [type]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            setError("Amount must be greater than 0");
            return;
        }

        setLoading(true);

        const body = {
            type,
            amountCents: Math.round(amountNum * 100),
            categoryId,
            date,
            note,
        };

        try {
            const url = editData
                ? `/api/transactions/${editData.id}`
                : "/api/transactions";
            const method = editData ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || "Failed to save");
                setLoading(false);
                return;
            }

            onSaved();
        } catch {
            setError("Something went wrong");
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h2>{editData ? "Edit Transaction" : "Add Transaction"}</h2>

                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Type</label>
                        <div className="type-toggle">
                            <button
                                type="button"
                                className={type === "COST" ? "active-cost" : ""}
                                onClick={() => setType("COST")}
                            >
                                💸 Cost
                            </button>
                            <button
                                type="button"
                                className={type === "INCOME" ? "active-income" : ""}
                                onClick={() => setType("INCOME")}
                            >
                                💵 Income
                            </button>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Amount ({currencySymbol})</label>
                            <input
                                id="tx-amount"
                                type="number"
                                className="form-input"
                                placeholder="0.00"
                                step="0.01"
                                min="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Date</label>
                            <input
                                id="tx-date"
                                type="date"
                                className="form-input"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Category</label>
                        <select
                            id="tx-category"
                            className="form-input"
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            required
                        >
                            {categories.length === 0 && (
                                <option value="">No categories</option>
                            )}
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Note / Merchant (optional)</label>
                        <input
                            id="tx-note"
                            type="text"
                            className="form-input"
                            placeholder="e.g. Starbucks, Grocery run"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`btn ${type === "COST" ? "btn-danger" : "btn-success"}`}
                            disabled={loading}
                            style={{ padding: "12px 24px", fontSize: "14px", border: "none" }}
                        >
                            {loading ? <span className="loading-spinner" /> : editData ? "Update" : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
