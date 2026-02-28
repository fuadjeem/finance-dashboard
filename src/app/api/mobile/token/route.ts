import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/d1";
import { compare } from "bcryptjs";
import { encode } from "next-auth/jwt";

// POST /api/mobile/token
// Accepts: { email, password }
// Returns: { token, user } — token is a NextAuth-compatible JWT for use as Bearer
export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }

        const user = await findUserByEmail(email);
        if (!user) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        const isValid = await compare(password, user.passwordHash);
        if (!isValid) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        // Encode a NextAuth-compatible JWT so decode() in session.ts can verify it
        const token = await encode({
            token: {
                id: user.id,
                name: user.name,
                email: user.email,
                sub: user.id,
            },
            secret: process.env.NEXTAUTH_SECRET as string,
        });

        return NextResponse.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                currency: user.currency ?? "USD",
            },
        });
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
