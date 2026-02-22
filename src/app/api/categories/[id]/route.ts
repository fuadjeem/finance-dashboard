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

    const existing = await prisma.category.findFirst({
        where: { id, userId: user.id },
    });
    if (!existing) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    try {
        const { name, active } = await req.json();

        const data: Record<string, unknown> = {};
        if (name !== undefined) data.name = name.trim();
        if (active !== undefined) data.active = active;

        const category = await prisma.category.update({
            where: { id },
            data,
        });

        return NextResponse.json(category);
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
