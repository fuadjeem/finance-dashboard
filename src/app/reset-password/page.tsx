"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token") || "";

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setStatus("error");
            setMessage("Passwords do not match");
            return;
        }

        if (password.length < 8) {
            setStatus("error");
            setMessage("Password must be at least 8 characters");
            return;
        }

        setStatus("loading");

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });
            const data = await res.json();

            if (res.ok) {
                setStatus("success");
                setMessage(data.message);
            } else {
                setStatus("error");
                setMessage(data.error || "Something went wrong");
            }
        } catch {
            setStatus("error");
            setMessage("Something went wrong. Please try again.");
        }
    };

    if (!token) {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <div className="logo">⚠️</div>
                    <h1>Invalid Link</h1>
                    <p className="subtitle">This reset link is invalid or has expired.</p>
                    <div className="auth-link">
                        <Link href="/forgot-password">Request a new reset link</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="logo">🔒</div>
                <h1>Reset Password</h1>
                <p className="subtitle">Enter your new password</p>

                {status === "success" ? (
                    <>
                        <div className="success-msg">{message}</div>
                        <div className="auth-link">
                            <Link href="/login">Go to Sign In</Link>
                        </div>
                    </>
                ) : (
                    <>
                        {status === "error" && <div className="error-msg">{message}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>New Password</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={8}
                                />
                            </div>
                            <div className="form-group">
                                <label>Confirm Password</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={8}
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary btn-full"
                                disabled={status === "loading"}
                            >
                                {status === "loading" ? <span className="loading-spinner" /> : "Reset Password"}
                            </button>
                        </form>
                        <div className="auth-link">
                            <Link href="/login">← Back to Sign In</Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="auth-container">
                <span className="loading-spinner" style={{ width: 40, height: 40 }} />
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}
