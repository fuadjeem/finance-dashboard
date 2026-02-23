"use client";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();

            if (res.ok) {
                setStatus("sent");
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

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="logo">🔑</div>
                <h1>Forgot Password</h1>
                <p className="subtitle">Enter your email and we&apos;ll send you a reset link</p>

                {status === "sent" ? (
                    <div className="success-msg">{message}</div>
                ) : (
                    <>
                        {status === "error" && <div className="error-msg">{message}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary btn-full"
                                disabled={status === "loading"}
                            >
                                {status === "loading" ? <span className="loading-spinner" /> : "Send Reset Link"}
                            </button>
                        </form>
                    </>
                )}

                <div className="auth-link">
                    <Link href="/login">← Back to Sign In</Link>
                </div>
            </div>
        </div>
    );
}
