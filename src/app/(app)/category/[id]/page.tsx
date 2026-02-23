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

interface Transaction {
    id: string;
    type: string;
    amountCents: number;
    date: string;
    note: string;
    category: { name: string };
}

interface CategoryInfo {
    id: string;
    name: string;
    type: string;
}

function formatCurrency(cents: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(cents / 100);
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
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [y, m] = month.split("-").map(Number);
            const startDate = `${month}-01`;
            const endDate = `${y}-${String(m).padStart(2, "0")}-${new Date(y, m, 0).getDate()}`;

            const res = await fetch(
                `/api/transactions?categoryId=${id}&startDate=${startDate}&endDate=${endDate}&limit=200`
            );
            const data = await res.json();
            setTransactions(data.transactions || []);

            // Get category info from first transaction or from category API
            if (data.transactions?.length > 0) {
                setCategory({
                    id,
                    name: data.transactions[0].category?.name || "Category",
                    type: data.transactions[0].type || "COST",
                });
            } else {
                const catRes = await fetch(`/api/categories`);
                const cats = await catRes.json();
                const found = cats.find((c: CategoryInfo) => c.id === id);
                if (found) setCategory(found);
            }
        } catch (err) {
            console.error("Failed to fetch:", err);
        }
        setLoading(false);
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

    // Build daily chart data
    const dailyData = (() => {
        const [y, m] = month.split("-").map(Number);
        const daysInMonth = new Date(y, m, 0).getDate();
        const dayMap: Record<string, number> = {};
        for (let d = 1; d <= daysInMonth; d++) {
            const key = `${month}-${String(d).padStart(2, "0")}`;
            dayMap[key] = 0;
        }
        for (const tx of transactions) {
            if (dayMap[tx.date] !== undefined) {
                dayMap[tx.date] += tx.amountCents;
            }
        }
        return Object.entries(dayMap).map(([date, cents]) => ({
            day: parseInt(date.split("-")[2]),
            amount: cents / 100,
        }));
    })();

    const totalCents = transactions.reduce((sum, tx) => sum + tx.amountCents, 0);

    return (
        <div className="detail-page">
            <div className="detail-header">
                <button className="back-btn" onClick={() => router.back()} aria-label="Go back">
                    ← Back
                </button>
                <h1>{category?.name || "Category"}</h1>
                <div className="detail-total">{formatCurrency(totalCents)}</div>
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
                            <YAxis stroke="#6b7280" fontSize={11} tickFormatter={(v) => `$${v}`} />
                            <Tooltip
                                contentStyle={{
                                    background: "#1a1a2e",
                                    border: "1px solid rgba(99,102,241,0.3)",
                                    borderRadius: 8,
                                    color: "#e8eaf6",
                                }}
                                formatter={(value: number | undefined) => [`$${(value ?? 0).toFixed(2)}`, "Spent"]}
                            />
                            <Line
                                type="monotone"
                                dataKey="amount"
                                stroke="#f43f5e"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>

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
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Note</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((tx) => (
                                    <tr key={tx.id}>
                                        <td>{tx.date}</td>
                                        <td className="amount-cost">{formatCurrency(tx.amountCents)}</td>
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
