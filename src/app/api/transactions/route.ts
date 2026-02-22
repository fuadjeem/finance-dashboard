import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function GET(req: NextRequest) {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const categoryId = searchParams.get("categoryId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: Record<string, unknown> = { userId: user.id };
    if (type) where.type = type;
    if (categoryId) where.categoryId = categoryId;
    if (startDate || endDate) {
        where.date = {};
        if (startDate) (where.date as Record<string, string>).gte = startDate;
        if (endDate) (where.date as Record<string, string>).lte = endDate;
    }
    if (search) {
        where.note = { contains: search };
    }

    const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
            where,
            include: { category: { select: { name: true } } },
            orderBy: [{ date: "desc" }, { createdAt: "desc" }],
            take: limit,
            skip: offset,
        }),
        prisma.transaction.count({ where }),
    ]);

    return NextResponse.json({ transactions, total });
}

export async function POST(req: NextRequest) {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { type, amountCents, categoryId, date, note } = await req.json();

        if (!type || !["INCOME", "COST"].includes(type)) {
            return NextResponse.json({ error: "Type must be INCOME or COST" }, { status: 400 });
        }
        if (!amountCents || amountCents <= 0) {
            return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 });
        }
        if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return NextResponse.json({ error: "Date must be in YYYY-MM-DD format" }, { status: 400 });
        }
        if (!categoryId) {
            return NextResponse.json({ error: "Category is required" }, { status: 400 });
        }

        // Verify category belongs to user
        const category = await prisma.category.findFirst({
            where: { id: categoryId, userId: user.id },
        });
        if (!category) {
            return NextResponse.json({ error: "Invalid category" }, { status: 400 });
        }

        const transaction = await prisma.transaction.create({
            data: {
                userId: user.id,
                categoryId,
                type,
                amountCents: Math.round(amountCents),
                date,
                note: note || "",
            },
            include: { category: { select: { name: true } } },
        });

        return NextResponse.json(transaction, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
