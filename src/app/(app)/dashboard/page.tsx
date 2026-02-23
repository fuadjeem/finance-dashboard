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
import Link from "next/link";
import TransactionModal from "@/components/TransactionModal";
import { formatCurrency, getCurrencySymbol } from "@/lib/currency";

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

interface CategorySpend {
    id: string;
    name: string;
    type: string;
    totalCents: number;
}

function formatMonth(ym: string) {
    const [y, m] = ym.split("-");
    const d = new Date(parseInt(y), parseInt(m) - 1);
    return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

export default function DashboardPage() {
    const [summary, setSummary] = useState<SummaryItem[]>([]);
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [categorySpending, setCategorySpending] = useState<CategorySpend[]>([]);
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    });
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currency, setCurrency] = useState("USD");

    // Fetch currency preference
    useEffect(() => {
        fetch("/api/user/currency")
            .then((r) => r.json())
            .then((data) => setCurrency(data.currency || "USD"))
            .catch(() => { });
    }, []);

    const fmt = useCallback((cents: number) => formatCurrency(cents, currency), [currency]);
    const symbol = getCurrencySymbol(currency);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [summaryRes, categoryRes] = await Promise.all([
                fetch(`/api/transactions/summary?month=${selectedMonth}&months=4`),
                fetch(`/api/categories/spending?month=${selectedMonth}`),
            ]);

            const summaryData = await summaryRes.json();
            const categoryData = await categoryRes.json();

            setSummary(summaryData.summary || []);
            setAnalytics(summaryData.analytics || null);
            setCategorySpending(categoryData || []);
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

    const costCategories = categorySpending.filter((c) => c.type === "COST" && c.totalCents > 0);

    return (
        <>
            {/* Header: Title + Month + Add Transaction */}
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

            {/* Swipeable Category Tiles */}
            {costCategories.length > 0 && (
                <div className="category-tiles-container">
                    <div className="category-tiles-scroll">
                        {costCategories.map((cat) => (
                            <Link
                                key={cat.id}
                                href={`/category/${cat.id}?month=${selectedMonth}`}
                                className="category-tile"
                            >
                                <div className="category-tile-name">{cat.name}</div>
                                <div className="category-tile-amount">{fmt(cat.totalCents)}</div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Summary Tiles 2x2 */}
            <div className="summary-grid">
                <Link href={`/month/${selectedMonth}/spent`} className="summary-tile red">
                    <div className="summary-tile-label">🛒 Total Spent</div>
                    <div className="summary-tile-value">
                        {loading ? "—" : fmt(analytics?.totalCosts || 0)}
                    </div>
                </Link>
                <Link href={`/month/${selectedMonth}/income`} className="summary-tile green">
                    <div className="summary-tile-label">💵 Total Income</div>
                    <div className="summary-tile-value">
                        {loading ? "—" : fmt(analytics?.totalIncome || 0)}
                    </div>
                </Link>
                <div className="summary-tile blue">
                    <div className="summary-tile-label">📈 Net Income</div>
                    <div className="summary-tile-value">
                        {loading ? "—" : fmt(analytics?.netIncome || 0)}
                    </div>
                </div>
                <div className="summary-tile amber">
                    <div className="summary-tile-label">📅 Avg Daily</div>
                    <div className="summary-tile-value">
                        {loading ? "—" : fmt(analytics?.avgDailySpend || 0)}
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="card chart-container">
                <div className="card-header">
                    <h2 className="card-title">Income vs Costs</h2>
                </div>
                {loading ? (
                    <div className="skeleton" style={{ height: 180 }} />
                ) : chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={chartData} barGap={8}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                            <XAxis dataKey="name" stroke="#6b7280" fontSize={11} />
                            <YAxis stroke="#6b7280" fontSize={11} tickFormatter={(v) => `${symbol}${v}`} />
                            <Tooltip
                                contentStyle={{
                                    background: "#1a1a2e",
                                    border: "1px solid rgba(99,102,241,0.3)",
                                    borderRadius: 8,
                                    boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                                    color: "#e8eaf6",
                                }}
                                formatter={(value: number | undefined) => [`${symbol}${(value ?? 0).toFixed(2)}`, undefined]}
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

            {showModal && (
                <TransactionModal
                    currencySymbol={symbol}
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
