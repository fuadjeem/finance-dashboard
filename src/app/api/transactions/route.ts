import { NextRequest, NextResponse } from "next/server";
import { findTransactions, findCategoryById, createTransaction } from "@/lib/d1";
import { getSessionUser } from "@/lib/session";

export async function GET(req: NextRequest) {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || undefined;
    const categoryId = searchParams.get("categoryId") || undefined;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    const search = searchParams.get("search") || undefined;
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const { transactions, total } = await findTransactions(user.id, {
        type,
        categoryId,
        startDate,
        endDate,
        search,
        limit,
        offset,
    });

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
        const category = await findCategoryById(categoryId, user.id);
        if (!category) {
            return NextResponse.json({ error: "Invalid category" }, { status: 400 });
        }

        const transaction = await createTransaction({
            userId: user.id,
            categoryId,
            type,
            amountCents: Math.round(amountCents),
            date,
            note: note || "",
        });

        return NextResponse.json(transaction, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
