import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function GET(req: NextRequest) {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const months = parseInt(searchParams.get("months") || "6");
    const endMonth = searchParams.get("month"); // YYYY-MM format

    // Calculate date range
    let endDate: Date;
    if (endMonth) {
        const [year, month] = endMonth.split("-").map(Number);
        endDate = new Date(year, month, 0); // Last day of the given month
    } else {
        endDate = new Date();
    }

    const startDate = new Date(endDate.getFullYear(), endDate.getMonth() - months + 1, 1);

    const startStr = startDate.toISOString().slice(0, 10);
    const endStr = endDate.toISOString().slice(0, 10);

    const transactions = await prisma.transaction.findMany({
        where: {
            userId: user.id,
            date: { gte: startStr, lte: endStr },
        },
        select: { type: true, amountCents: true, date: true },
    });

    // Aggregate by month
    const monthlyData: Record<string, { income: number; costs: number }> = {};

    // Initialize all months
    for (let i = 0; i < months; i++) {
        const d = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        monthlyData[key] = { income: 0, costs: 0 };
    }

    for (const tx of transactions) {
        const monthKey = tx.date.slice(0, 7); // YYYY-MM
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { income: 0, costs: 0 };
        }
        if (tx.type === "INCOME") {
            monthlyData[monthKey].income += tx.amountCents;
        } else {
            monthlyData[monthKey].costs += tx.amountCents;
        }
    }

    // Convert to array sorted by month
    const summary = Object.entries(monthlyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, data]) => ({
            month,
            income: data.income,
            costs: data.costs,
        }));

    // Also compute current month analytics
    const now = new Date();
    const currentMonthKey = endMonth || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const currentMonthTxns = transactions.filter((tx) => tx.date.startsWith(currentMonthKey));

    const totalIncome = currentMonthTxns
        .filter((tx) => tx.type === "INCOME")
        .reduce((sum, tx) => sum + tx.amountCents, 0);

    const totalCosts = currentMonthTxns
        .filter((tx) => tx.type === "COST")
        .reduce((sum, tx) => sum + tx.amountCents, 0);

    // Avg daily spend this month
    const daysInMonth = new Date(
        parseInt(currentMonthKey.split("-")[0]),
        parseInt(currentMonthKey.split("-")[1]),
        0
    ).getDate();
    const dayOfMonth = Math.min(now.getDate(), daysInMonth);
    const avgDailySpend = dayOfMonth > 0 ? Math.round(totalCosts / dayOfMonth) : 0;

    return NextResponse.json({
        summary,
        analytics: {
            netIncome: totalIncome - totalCosts,
            totalIncome,
            totalCosts,
            avgDailySpend,
            currentMonth: currentMonthKey,
        },
    });
}
