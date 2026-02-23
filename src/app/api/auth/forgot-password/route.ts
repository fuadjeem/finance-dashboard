import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, createPasswordResetToken } from "@/lib/d1";

function generateToken(): string {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let token = "";
    for (let i = 0; i < 48; i++) {
        token += chars[Math.floor(Math.random() * chars.length)];
    }
    return token;
}

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        // Always return success to prevent email enumeration
        const user = await findUserByEmail(email);
        if (!user) {
            return NextResponse.json({ message: "If an account with that email exists, a reset link has been sent." });
        }

        const token = generateToken();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

        await createPasswordResetToken(user.id, token, expiresAt);

        // Determine the base URL
        const baseUrl = process.env.NEXTAUTH_URL || req.nextUrl.origin;
        const resetUrl = `${baseUrl}/reset-password?token=${token}`;

        // Send email via Resend
        const resendKey = process.env.RESEND_API_KEY;
        if (resendKey) {
            const emailRes = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${resendKey}`,
                },
                body: JSON.stringify({
                    from: "FinanceFlow <onboarding@resend.dev>",
                    to: email,
                    subject: "Reset your FinanceFlow password",
                    html: `
                        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
                            <h2 style="color: #333;">Reset your password</h2>
                            <p style="color: #666; line-height: 1.6;">
                                You requested a password reset for your FinanceFlow account.
                                Click the button below to set a new password. This link expires in 1 hour.
                            </p>
                            <a href="${resetUrl}"
                               style="display: inline-block; background: #6366f1; color: white; padding: 14px 28px;
                                      border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0;">
                                Reset Password
                            </a>
                            <p style="color: #999; font-size: 13px;">
                                If you didn't request this, you can safely ignore this email.
                            </p>
                        </div>
                    `,
                }),
            });
            const emailData = await emailRes.json();
            console.log("Resend response:", emailRes.status, JSON.stringify(emailData));

            if (!emailRes.ok) {
                return NextResponse.json({
                    message: "If an account with that email exists, a reset link has been sent.",
                    debug: emailData
                });
            }
        }

        return NextResponse.json({ message: "If an account with that email exists, a reset link has been sent." });
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
