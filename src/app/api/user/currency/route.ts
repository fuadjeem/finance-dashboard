import { NextRequest, NextResponse } from "next/server";
import { getUserCurrency, updateUserCurrency } from "@/lib/d1";
import { getSessionUser } from "@/lib/session";
import { VALID_CURRENCY_CODES } from "@/lib/currency";

export async function GET() {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currency = await getUserCurrency(user.id);
    return NextResponse.json({ currency });
}

export async function PUT(req: NextRequest) {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { currency } = await req.json();

        if (!currency || !VALID_CURRENCY_CODES.has(currency)) {
            return NextResponse.json({ error: "Invalid currency code" }, { status: 400 });
        }

        await updateUserCurrency(user.id, currency);
        return NextResponse.json({ currency });
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
