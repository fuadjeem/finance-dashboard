"use client";
import { useState, useEffect } from "react";
import { CURRENCIES } from "@/lib/currency";

interface Category {
    id: string;
    name: string;
    type: string;
}

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<"COST" | "INCOME">("COST");
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [currency, setCurrency] = useState("USD");
    const [currencyLoading, setCurrencyLoading] = useState(true);
    const [currencySaving, setCurrencySaving] = useState(false);

    useEffect(() => {
        fetch("/api/user/currency")
            .then((r) => r.json())
            .then((data) => setCurrency(data.currency || "USD"))
            .catch(() => { })
            .finally(() => setCurrencyLoading(false));
    }, []);

    const handleCurrencyChange = async (code: string) => {
        setCurrencySaving(true);
        const prev = currency;
        setCurrency(code);
        try {
            const res = await fetch("/api/user/currency", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currency: code }),
            });
            if (!res.ok) {
                setCurrency(prev);
            } else {
                setSuccess("Currency updated!");
                setTimeout(() => setSuccess(""), 2000);
            }
        } catch {
            setCurrency(prev);
        }
        setCurrencySaving(false);
    };

    const fetchCategories = async () => {
        setLoading(true);
        const res = await fetch(`/api/categories?type=${activeTab}`);
        const data = await res.json();
        setCategories(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchCategories();
    }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        if (!newName.trim()) return;

        const res = await fetch("/api/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newName.trim(), type: activeTab }),
        });

        if (!res.ok) {
            const data = await res.json();
            setError(data.error || "Failed to add");
            return;
        }

        setNewName("");
        setSuccess("Category added!");
        setTimeout(() => setSuccess(""), 2000);
        fetchCategories();
    };

    const handleRename = async (id: string) => {
        if (!editingName.trim()) return;
        setError("");

        const res = await fetch(`/api/categories/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: editingName.trim() }),
        });

        if (!res.ok) {
            const data = await res.json();
            setError(data.error || "Failed to rename");
            return;
        }

        setEditingId(null);
        setEditingName("");
        fetchCategories();
    };

    const handleDelete = async (cat: Category) => {
        if (cat.name === "Uncategorized") return;
        if (!confirm(`Delete "${cat.name}"? Its transactions will move to Uncategorized.`)) return;
        setError("");

        const res = await fetch(`/api/categories/${cat.id}`, { method: "DELETE" });
        if (!res.ok) {
            const data = await res.json();
            setError(data.error || "Failed to delete");
            return;
        }

        setSuccess("Category deleted!");
        setTimeout(() => setSuccess(""), 2000);
        fetchCategories();
    };

    return (
        <>
            <div className="page-header">
                <h1>Settings</h1>
            </div>

            {/* Currency Picker Card */}
            <div className="card" style={{ marginBottom: 24 }}>
                <div className="card-header">
                    <h2 className="card-title">💱 Currency</h2>
                </div>
                {currencyLoading ? (
                    <div className="skeleton" style={{ height: 48 }} />
                ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                        <select
                            className="form-input"
                            style={{ width: "auto", minWidth: 280 }}
                            value={currency}
                            onChange={(e) => handleCurrencyChange(e.target.value)}
                            disabled={currencySaving}
                        >
                            {CURRENCIES.map((c) => (
                                <option key={c.code} value={c.code}>
                                    {c.symbol} — {c.name} ({c.code})
                                </option>
                            ))}
                        </select>
                        {currencySaving && <span className="loading-spinner" style={{ width: 18, height: 18 }} />}
                    </div>
                )}
            </div>

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Manage Categories</h2>
                </div>

                <div className="tabs">
                    <button
                        className={`tab ${activeTab === "COST" ? "active" : ""}`}
                        onClick={() => setActiveTab("COST")}
                    >
                        💸 Cost Categories
                    </button>
                    <button
                        className={`tab ${activeTab === "INCOME" ? "active" : ""}`}
                        onClick={() => setActiveTab("INCOME")}
                    >
                        💵 Income Categories
                    </button>
                </div>

                {error && <div className="error-msg">{error}</div>}
                {success && <div className="success-msg">{success}</div>}

                <form className="add-category-form" onSubmit={handleAdd}>
                    <input
                        type="text"
                        className="form-input"
                        placeholder={`New ${activeTab.toLowerCase()} category...`}
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary">
                        Add
                    </button>
                </form>

                {loading ? (
                    <div className="skeleton" style={{ height: 200 }} />
                ) : categories.length > 0 ? (
                    <div className="category-list">
                        {categories.map((cat) => (
                            <div key={cat.id} className="category-item">
                                {editingId === cat.id ? (
                                    <div className="inline-edit">
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={editingName}
                                            onChange={(e) => setEditingName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") handleRename(cat.id);
                                                if (e.key === "Escape") setEditingId(null);
                                            }}
                                            autoFocus
                                        />
                                        <button className="btn btn-success" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => handleRename(cat.id)}>
                                            ✓
                                        </button>
                                        <button className="btn btn-ghost" style={{ padding: "6px 12px" }} onClick={() => setEditingId(null)}>
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <span className="cat-name">{cat.name}</span>
                                )}

                                {editingId !== cat.id && (
                                    <div className="cat-actions">
                                        {cat.name !== "Uncategorized" && (
                                            <button
                                                className="btn btn-ghost"
                                                style={{ padding: "6px 12px", fontSize: 12 }}
                                                onClick={() => { setEditingId(cat.id); setEditingName(cat.name); }}
                                            >
                                                ✏️ Rename
                                            </button>
                                        )}
                                        {cat.name !== "Uncategorized" && (
                                            <button
                                                className="btn btn-danger"
                                                style={{ padding: "6px 12px", fontSize: 12 }}
                                                onClick={() => handleDelete(cat)}
                                            >
                                                🗑️ Delete
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="icon">📂</div>
                        <h3>No categories</h3>
                        <p>Add your first {activeTab.toLowerCase()} category above</p>
                    </div>
                )}
            </div>
        </>
    );
}
