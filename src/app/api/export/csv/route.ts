import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function GET() {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const transactions = await prisma.transaction.findMany({
        where: { userId: user.id },
        include: { category: { select: { name: true } } },
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    });

    const headers = ["Date", "Type", "Category", "Amount", "Note"];
    const rows = transactions.map((tx) => [
        tx.date,
        tx.type,
        tx.category.name,
        (tx.amountCents / 100).toFixed(2),
        `"${(tx.note || "").replace(/"/g, '""')}"`,
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return new NextResponse(csv, {
        headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="transactions-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
    });
}
