"use client";
import { useState, useEffect, useCallback } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import TransactionModal from "@/components/TransactionModal";

interface SummaryItem {
    month: string;
    income: number;
    costs: number;
}

interface Analytics {
    netIncome: number;
    totalIncome: number;
    totalCosts: number;
    avgDailySpend: number;
    currentMonth: string;
}

interface Transaction {
    id: string;
    type: string;
    amountCents: number;
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

function formatMonth(ym: string) {
    const [y, m] = ym.split("-");
    const d = new Date(parseInt(y), parseInt(m) - 1);
    return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

export default function DashboardPage() {
    const [summary, setSummary] = useState<SummaryItem[]>([]);
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [recentCosts, setRecentCosts] = useState<Transaction[]>([]);
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    });
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [summaryRes, costsRes] = await Promise.all([
                fetch(`/api/transactions/summary?month=${selectedMonth}&months=6`),
                fetch("/api/transactions?type=COST&limit=10"),
            ]);

            const summaryData = await summaryRes.json();
            const costsData = await costsRes.json();

            setSummary(summaryData.summary || []);
            setAnalytics(summaryData.analytics || null);
            setRecentCosts(costsData.transactions || []);
        } catch (err) {
            console.error("Failed to fetch data:", err);
        }
        setLoading(false);
    }, [selectedMonth]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const navigateMonth = (delta: number) => {
        const [y, m] = selectedMonth.split("-").map(Number);
        const d = new Date(y, m - 1 + delta, 1);
        setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    };

    const monthLabel = (() => {
        const [y, m] = selectedMonth.split("-");
        const d = new Date(parseInt(y), parseInt(m) - 1);
        return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    })();

    const chartData = summary.map((s) => ({
        name: formatMonth(s.month),
        Income: s.income / 100,
        Costs: s.costs / 100,
    }));

    return (
        <>
            <div className="page-header">
                <h1>Dashboard</h1>
                <div className="page-header-actions">
                    <div className="month-selector">
                        <button onClick={() => navigateMonth(-1)} aria-label="Previous month">‹</button>
                        <span className="current-month">{monthLabel}</span>
                        <button onClick={() => navigateMonth(1)} aria-label="Next month">›</button>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        + Add Transaction
                    </button>
                </div>
            </div>

            {/* Analytics Cards */}
            <div className="analytics-grid">
                <div className="analytics-card green">
                    <div className="card-icon">💵</div>
                    <div className="card-label">Total Income</div>
                    <div className="card-value positive">
                        {loading ? "—" : formatCurrency(analytics?.totalIncome || 0)}
                    </div>
                </div>
                <div className="analytics-card red">
                    <div className="card-icon">🛒</div>
                    <div className="card-label">Total Costs</div>
                    <div className="card-value negative">
                        {loading ? "—" : formatCurrency(analytics?.totalCosts || 0)}
                    </div>
                </div>
                <div className="analytics-card blue">
                    <div className="card-icon">📈</div>
                    <div className="card-label">Net Income</div>
                    <div className={`card-value ${(analytics?.netIncome || 0) >= 0 ? "positive" : "negative"}`}>
                        {loading ? "—" : formatCurrency(analytics?.netIncome || 0)}
                    </div>
                </div>
                <div className="analytics-card amber">
                    <div className="card-icon">📅</div>
                    <div className="card-label">Avg Daily Spend</div>
                    <div className="card-value negative">
                        {loading ? "—" : formatCurrency(analytics?.avgDailySpend || 0)}
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="card chart-container">
                <div className="card-header">
                    <h2 className="card-title">Income vs Costs</h2>
                </div>
                {loading ? (
                    <div className="skeleton" style={{ height: 300 }} />
                ) : chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData} barGap={8}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                            <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                            <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(v) => `$${v}`} />
                            <Tooltip
                                contentStyle={{
                                    background: "#1a1a2e",
                                    border: "1px solid rgba(99,102,241,0.3)",
                                    borderRadius: 8,
                                    boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                                    color: "#e8eaf6",
                                }}
                                formatter={(value: number | undefined) => [`$${(value ?? 0).toFixed(2)}`, undefined]}
                            />
                            <Legend />
                            <Bar dataKey="Income" fill="#10b981" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="Costs" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="empty-state">
                        <div className="icon">📊</div>
                        <h3>No data yet</h3>
                        <p>Add your first transaction to see the chart</p>
                    </div>
                )}
            </div>

            {/* Recent Costs Table */}
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Latest 10 Costs</h2>
                </div>
                {recentCosts.length > 0 ? (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Category</th>
                                    <th>Amount</th>
                                    <th>Note</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentCosts.map((tx) => (
                                    <tr key={tx.id}>
                                        <td>{tx.date}</td>
                                        <td><span className="category-badge">{tx.category.name}</span></td>
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
                        <h3>No costs recorded</h3>
                        <p>Your latest costs will appear here</p>
                    </div>
                )}
            </div>

            {showModal && (
                <TransactionModal
                    onClose={() => setShowModal(false)}
                    onSaved={() => {
                        setShowModal(false);
                        fetchData();
                    }}
                />
            )}
        </>
    );
}
