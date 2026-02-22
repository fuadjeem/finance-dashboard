import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const existing = await prisma.transaction.findFirst({
        where: { id, userId: user.id },
    });
    if (!existing) {
        return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    try {
        const { type, amountCents, categoryId, date, note } = await req.json();

        if (type && !["INCOME", "COST"].includes(type)) {
            return NextResponse.json({ error: "Type must be INCOME or COST" }, { status: 400 });
        }
        if (amountCents !== undefined && amountCents <= 0) {
            return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 });
        }
        if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return NextResponse.json({ error: "Date must be in YYYY-MM-DD format" }, { status: 400 });
        }

        if (categoryId) {
            const category = await prisma.category.findFirst({
                where: { id: categoryId, userId: user.id },
            });
            if (!category) {
                return NextResponse.json({ error: "Invalid category" }, { status: 400 });
            }
        }

        const transaction = await prisma.transaction.update({
            where: { id },
            data: {
                ...(type && { type }),
                ...(amountCents && { amountCents: Math.round(amountCents) }),
                ...(categoryId && { categoryId }),
                ...(date && { date }),
                ...(note !== undefined && { note }),
            },
            include: { category: { select: { name: true } } },
        });

        return NextResponse.json(transaction);
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const existing = await prisma.transaction.findFirst({
        where: { id, userId: user.id },
    });
    if (!existing) {
        return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    await prisma.transaction.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted" });
}
