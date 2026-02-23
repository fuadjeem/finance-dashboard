import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { findPasswordResetToken, deletePasswordResetToken, updateUserPassword } from "@/lib/d1";

export async function POST(req: NextRequest) {
    try {
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
        }

        if (password.length < 8) {
            return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
        }

        const resetRecord = await findPasswordResetToken(token);
        if (!resetRecord) {
            return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
        }

        // Check expiry
        const expiresAt = new Date(resetRecord.expiresAt);
        if (expiresAt < new Date()) {
            await deletePasswordResetToken(resetRecord.id);
            return NextResponse.json({ error: "Reset link has expired. Please request a new one." }, { status: 400 });
        }

        // Hash new password and update
        const passwordHash = await hash(password, 12);
        await updateUserPassword(resetRecord.userId, passwordHash);

        // Clean up token
        await deletePasswordResetToken(resetRecord.id);

        return NextResponse.json({ message: "Password has been reset. You can now sign in." });
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
