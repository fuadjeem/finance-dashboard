import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function GET(req: NextRequest) {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const activeOnly = searchParams.get("active") !== "false";

    const where: Record<string, unknown> = { userId: user.id };
    if (type) where.type = type;
    if (activeOnly) where.active = true;

    const categories = await prisma.category.findMany({
        where,
        orderBy: { name: "asc" },
    });

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

        // Check for duplicate
        const existing = await prisma.category.findFirst({
            where: { userId: user.id, name: name.trim(), type },
        });
        if (existing) {
            return NextResponse.json(
                { error: "Category already exists" },
                { status: 409 }
            );
        }

        const category = await prisma.category.create({
            data: { userId: user.id, name: name.trim(), type },
        });

        return NextResponse.json(category, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
