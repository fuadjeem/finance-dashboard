"use client";
import { useState, useEffect } from "react";

interface Category {
    id: string;
    name: string;
    type: string;
    active: boolean;
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

    const fetchCategories = async () => {
        setLoading(true);
        const res = await fetch(`/api/categories?type=${activeTab}&active=false`);
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

    const handleToggleActive = async (id: string, currentActive: boolean) => {
        await fetch(`/api/categories/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ active: !currentActive }),
        });
        fetchCategories();
    };

    return (
        <>
            <div className="page-header">
                <h1>Settings</h1>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Manage Categories</h2>
                </div>

                {/* Tabs */}
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

                {/* Add form */}
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

                {/* Category list */}
                {loading ? (
                    <div className="skeleton" style={{ height: 200 }} />
                ) : categories.length > 0 ? (
                    <div className="category-list">
                        {categories.map((cat) => (
                            <div key={cat.id} className={`category-item ${!cat.active ? "inactive" : ""}`}>
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
                                    <span className="cat-name">
                                        {cat.name}
                                        {!cat.active && <span style={{ color: "var(--text-muted)", fontSize: 12, marginLeft: 8 }}>(inactive)</span>}
                                    </span>
                                )}

                                {editingId !== cat.id && (
                                    <div className="cat-actions">
                                        <button
                                            className="btn btn-ghost"
                                            onClick={() => { setEditingId(cat.id); setEditingName(cat.name); }}
                                        >
                                            ✏️ Rename
                                        </button>
                                        <button
                                            className={`btn ${cat.active ? "btn-danger" : "btn-success"}`}
                                            style={{ padding: "6px 12px", fontSize: 12, border: cat.active ? undefined : "none" }}
                                            onClick={() => handleToggleActive(cat.id, cat.active)}
                                        >
                                            {cat.active ? "Deactivate" : "Activate"}
                                        </button>
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
