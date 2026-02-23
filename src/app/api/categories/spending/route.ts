import { NextRequest, NextResponse } from "next/server";
import { findCategorySpending } from "@/lib/d1";
import { getSessionUser } from "@/lib/session";

export async function GET(req: NextRequest) {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const now = new Date();
    const month = searchParams.get("month") || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const categories = await findCategorySpending(user.id, month);
    return NextResponse.json(categories);
}
