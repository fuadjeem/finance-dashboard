"use client";
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { formatCurrency, getCurrencySymbol } from "@/lib/currency";

interface CurrencyContextValue {
    /** ISO currency code e.g. "USD" */
    currency: string;
    /** The display symbol e.g. "$" */
    symbol: string;
    /** Whether the initial fetch is still loading */
    loading: boolean;
    /** Format cents → localized string using the user's currency */
    fmt: (cents: number) => string;
    /** Update the user's currency preference (PUTs to API) */
    updateCurrency: (code: string) => Promise<boolean>;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
    const [currency, setCurrency] = useState("USD");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/user/currency")
            .then((r) => r.json())
            .then((data) => setCurrency(data.currency || "USD"))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const fmt = useCallback(
        (cents: number) => formatCurrency(cents, currency),
        [currency],
    );

    const symbol = getCurrencySymbol(currency);

    const updateCurrency = useCallback(
        async (code: string): Promise<boolean> => {
            const prev = currency;
            setCurrency(code);
            try {
                const res = await fetch("/api/user/currency", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ currency: code }),
                });
                if (!res.ok) {
                    setCurrency(prev);
                    return false;
                }
                return true;
            } catch {
                setCurrency(prev);
                return false;
            }
        },
        [currency],
    );

    return (
        <CurrencyContext.Provider value={{ currency, symbol, loading, fmt, updateCurrency }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency(): CurrencyContextValue {
    const ctx = useContext(CurrencyContext);
    if (!ctx) throw new Error("useCurrency must be used within <CurrencyProvider>");
    return ctx;
}
