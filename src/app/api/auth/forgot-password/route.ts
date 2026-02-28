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
                    from: "FinanceFlow <noreply@jprojects.cc>",
                    to: email,
                    subject: "Reset your FinanceFlow password",
                    html: `
                        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f6f9fc; padding: 40px 0;">
                            <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                                <div style="text-align: center; margin-bottom: 30px;">
                                    <h1 style="color: #111827; font-size: 24px; font-weight: 700; margin: 0;">FinanceFlow</h1>
                                </div>
                                <h2 style="color: #1f2937; font-size: 20px; font-weight: 600; margin-top: 0; margin-bottom: 16px;">Reset your password</h2>
                                <p style="color: #4b5563; line-height: 1.6; font-size: 15px; margin-bottom: 24px;">
                                    We received a request to reset the password for your FinanceFlow account. Click the button below to set up a new password. This link will safely expire in 1 hour.
                                </p>
                                <div style="text-align: center; margin: 32px 0;">
                                    <a href="${resetUrl}"
                                       style="display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 14px 32px;
                                              border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;
                                              box-shadow: 0 4px 6px rgba(79, 70, 229, 0.25); transition: background-color 0.2s;">
                                        Reset Password
                                    </a>
                                </div>
                                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
                                <p style="color: #9ca3af; font-size: 13px; line-height: 1.5; margin: 0;">
                                    If you didn't request a password reset, you can safely ignore this email. Your password won't be changed until you click the link above and create a new one.
                                </p>
                            </div>
                            <div style="text-align: center; margin-top: 24px;">
                                <p style="color: #9ca3af; font-size: 12px;">© ${new Date().getFullYear()} FinanceFlow. All rights reserved.</p>
                            </div>
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
