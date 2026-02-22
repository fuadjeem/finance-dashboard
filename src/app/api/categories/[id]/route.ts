import { NextRequest, NextResponse } from "next/server";
import { findCategoryById, updateCategory } from "@/lib/d1";
import { getSessionUser } from "@/lib/session";

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const existing = await findCategoryById(id, user.id);
    if (!existing) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    try {
        const { name, active } = await req.json();

        const data: { name?: string; active?: boolean } = {};
        if (name !== undefined) data.name = name.trim();
        if (active !== undefined) data.active = active;

        const category = await updateCategory(id, data);
        return NextResponse.json(category);
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
