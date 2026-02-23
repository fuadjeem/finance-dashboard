"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import TransactionModal from "@/components/TransactionModal";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="auth-container">
                <span className="loading-spinner" style={{ width: 40, height: 40 }} />
            </div>
        );
    }

    if (!session?.user) return null;

    const user = session.user;
    const initials = (user.name || user.email || "U").charAt(0).toUpperCase();

    const navItems = [
        { href: "/dashboard", icon: "📊", label: "Dashboard" },
        { href: "/transactions", icon: "💳", label: "Transactions" },
        { href: "/settings", icon: "⚙️", label: "Settings" },
    ];

    const bottomNavItems = [
        { href: "/dashboard", icon: "📊", label: "Home" },
        { href: "/transactions", icon: "💳", label: "Transactions" },
        { href: "#add", icon: "+", label: "Add", isAction: true },
        { href: "/api/export/csv", icon: "📥", label: "Export", isExternal: true },
    ];

    return (
        <div className="app-layout">
            {/* Desktop sidebar */}
            <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
                <div className="sidebar-logo">
                    <span>💰</span>
                    <span>FinanceFlow</span>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`nav-link ${pathname === item.href ? "active" : ""}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span className="icon">{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar">{initials}</div>
                        <div>
                            <div className="user-name">{user.name}</div>
                            <div className="user-email">{user.email}</div>
                        </div>
                    </div>
                    <button
                        className="btn btn-ghost btn-full"
                        onClick={async () => {
                            await signOut({ redirect: false });
                            router.push("/login");
                        }}
                    >
                        🚪 Sign Out
                    </button>
                    <a
                        href="/api/export/csv"
                        className="btn btn-ghost btn-full"
                        style={{ marginTop: 4 }}
                    >
                        📥 Export CSV
                    </a>
                </div>
            </aside>

            {/* Mobile header */}
            <header className="mobile-header">
                <div className="mobile-header-left">
                    <span className="mobile-logo-icon">💰</span>
                    <span className="mobile-logo-text">FinanceFlow</span>
                </div>
                <div className="mobile-header-right">
                    <Link href="/settings" className="mobile-header-btn" aria-label="Settings">
                        ⚙️
                    </Link>
                    <button
                        className="mobile-header-btn"
                        onClick={async () => {
                            await signOut({ redirect: false });
                            router.push("/login");
                        }}
                        aria-label="Sign Out"
                    >
                        🚪
                    </button>
                </div>
            </header>

            <main className="main-content">{children}</main>

            {/* Mobile bottom nav */}
            <nav className="bottom-nav">
                {bottomNavItems.map((item) => {
                    if (item.isAction) {
                        return (
                            <button
                                key="add"
                                className="bottom-nav-item bottom-nav-fab"
                                onClick={() => setShowModal(true)}
                            >
                                <span className="bottom-nav-fab-icon">+</span>
                            </button>
                        );
                    }
                    if (item.isExternal) {
                        return (
                            <a
                                key={item.href}
                                href={item.href}
                                className="bottom-nav-item"
                            >
                                <span className="bottom-nav-icon">{item.icon}</span>
                                <span className="bottom-nav-label">{item.label}</span>
                            </a>
                        );
                    }
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`bottom-nav-item ${pathname === item.href || (item.href === "/dashboard" && pathname.startsWith("/category")) || (item.href === "/dashboard" && pathname.startsWith("/month")) ? "active" : ""}`}
                        >
                            <span className="bottom-nav-icon">{item.icon}</span>
                            <span className="bottom-nav-label">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Desktop sidebar toggle */}
            <button
                className="mobile-toggle"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle sidebar"
            >
                {sidebarOpen ? "✕" : "☰"}
            </button>

            {showModal && (
                <TransactionModal
                    onClose={() => setShowModal(false)}
                    onSaved={() => {
                        setShowModal(false);
                        router.refresh();
                    }}
                />
            )}
        </div>
    );
}
