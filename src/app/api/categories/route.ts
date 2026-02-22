import { NextRequest, NextResponse } from "next/server";
import { findCategories, findCategoryByNameAndType, createCategory } from "@/lib/d1";
import { getSessionUser } from "@/lib/session";

export async function GET(req: NextRequest) {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || undefined;
    const activeOnly = searchParams.get("active") !== "false";

    const categories = await findCategories(user.id, { type, activeOnly });
    return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { name, type } = await req.json();

        if (!name || !name.trim()) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }
        if (!type || !["INCOME", "COST"].includes(type)) {
            return NextResponse.json({ error: "Type must be INCOME or COST" }, { status: 400 });
        }

        const existing = await findCategoryByNameAndType(user.id, name.trim(), type);
        if (existing) {
            return NextResponse.json(
                { error: "Category already exists" },
                { status: 409 }
            );
        }

        const category = await createCategory({ userId: user.id, name: name.trim(), type });
        return NextResponse.json(category, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
