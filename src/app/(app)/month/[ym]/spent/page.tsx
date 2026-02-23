"use client";
import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface CategorySpend {
    id: string;
    name: string;
    type: string;
    totalCents: number;
}

function formatCurrency(cents: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(cents / 100);
}

export default function SpentDetailPage({ params }: { params: Promise<{ ym: string }> }) {
    const { ym } = use(params);
    const router = useRouter();
    const [month, setMonth] = useState(ym);
    const [categories, setCategories] = useState<CategorySpend[]>([]);
    const [loading, setLoading] = useState(true);

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

    const navigateMonth = (delta: number) => {
        const [y, m] = month.split("-").map(Number);
        const d = new Date(y, m - 1 + delta, 1);
        const newMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        setMonth(newMonth);
        router.replace(`/month/${newMonth}/spent`);
    };

    const monthLabel = (() => {
        const [y, m] = month.split("-");
        const d = new Date(parseInt(y), parseInt(m) - 1);
        return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    })();

    const totalSpent = categories.reduce((sum, c) => sum + c.totalCents, 0);

    return (
        <div className="detail-page">
            <div className="detail-header">
                <button className="back-btn" onClick={() => router.back()}>← Back</button>
                <h1>Spending Overview</h1>
                <div className="detail-total">{formatCurrency(totalSpent)}</div>
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
                        <Link
                            key={cat.id}
                            href={`/category/${cat.id}?month=${month}`}
                            className="spending-category-row"
                        >
                            <span className="spending-cat-name">{cat.name}</span>
                            <div className="spending-cat-right">
                                <span className="spending-cat-amount">{formatCurrency(cat.totalCents)}</span>
                                <span className="spending-cat-percent">
                                    {totalSpent > 0 ? `${Math.round((cat.totalCents / totalSpent) * 100)}%` : "—"}
                                </span>
                            </div>
                        </Link>
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
