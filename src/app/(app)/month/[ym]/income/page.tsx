"use client";
import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";

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

export default function IncomeDetailPage({ params }: { params: Promise<{ ym: string }> }) {
    const { ym } = use(params);
    const router = useRouter();
    const [month, setMonth] = useState(ym);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

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

    const totalIncome = transactions.reduce((sum, tx) => sum + tx.amountCents, 0);

    return (
        <div className="detail-page">
            <div className="detail-header">
                <button className="back-btn" onClick={() => router.back()}>← Back</button>
                <h1>Income Overview</h1>
                <div className="detail-total positive">{formatCurrency(totalIncome)}</div>
            </div>

            <div className="month-selector" style={{ marginBottom: 20, justifyContent: "center" }}>
                <button onClick={() => navigateMonth(-1)}>‹</button>
                <span className="current-month">{monthLabel}</span>
                <button onClick={() => navigateMonth(1)}>›</button>
            </div>

            {loading ? (
                <div className="skeleton" style={{ height: 200 }} />
            ) : transactions.length > 0 ? (
                <div className="card">
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
                                {transactions.map((tx) => (
                                    <tr key={tx.id}>
                                        <td>{tx.date}</td>
                                        <td><span className="category-badge">{tx.category.name}</span></td>
                                        <td className="amount-income">{formatCurrency(tx.amountCents)}</td>
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
