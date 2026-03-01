/**
 * Currency utilities for the mobile app.
 * Matches the web app's src/lib/currency.ts exactly.
 */

export interface CurrencyInfo {
    code: string;
    name: string;
    symbol: string;
}

export const CURRENCIES: CurrencyInfo[] = [
    { code: "USD", name: "US Dollar", symbol: "$" },
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "GBP", name: "British Pound", symbol: "£" },
    { code: "JPY", name: "Japanese Yen", symbol: "¥" },
    { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
    { code: "INR", name: "Indian Rupee", symbol: "₹" },
    { code: "BDT", name: "Bangladeshi Taka", symbol: "৳" },
    { code: "PKR", name: "Pakistani Rupee", symbol: "₨" },
    { code: "AUD", name: "Australian Dollar", symbol: "A$" },
    { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
    { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
    { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
    { code: "SAR", name: "Saudi Riyal", symbol: "﷼" },
    { code: "MYR", name: "Malaysian Ringgit", symbol: "RM" },
    { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
    { code: "THB", name: "Thai Baht", symbol: "฿" },
    { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp" },
    { code: "PHP", name: "Philippine Peso", symbol: "₱" },
    { code: "VND", name: "Vietnamese Dong", symbol: "₫" },
    { code: "KRW", name: "South Korean Won", symbol: "₩" },
    { code: "TRY", name: "Turkish Lira", symbol: "₺" },
    { code: "BRL", name: "Brazilian Real", symbol: "R$" },
    { code: "MXN", name: "Mexican Peso", symbol: "MX$" },
    { code: "ZAR", name: "South African Rand", symbol: "R" },
    { code: "NGN", name: "Nigerian Naira", symbol: "₦" },
    { code: "EGP", name: "Egyptian Pound", symbol: "E£" },
    { code: "SEK", name: "Swedish Krona", symbol: "kr" },
    { code: "NOK", name: "Norwegian Krone", symbol: "kr" },
    { code: "DKK", name: "Danish Krone", symbol: "kr" },
    { code: "PLN", name: "Polish Zloty", symbol: "zł" },
    { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" },
    { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
    { code: "TWD", name: "New Taiwan Dollar", symbol: "NT$" },
    { code: "RUB", name: "Russian Ruble", symbol: "₽" },
    { code: "ILS", name: "Israeli Shekel", symbol: "₪" },
    { code: "QAR", name: "Qatari Riyal", symbol: "﷼" },
];

export const VALID_CURRENCY_CODES = new Set(CURRENCIES.map((c) => c.code));

/** Format cents into localized currency string */
export function formatCurrency(cents: number, currencyCode: string = "USD"): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currencyCode,
        currencyDisplay: "narrowSymbol",
    }).format(cents / 100);
}

/** Get symbol for a currency code */
export function getCurrencySymbol(code: string): string {
    const currency = CURRENCIES.find((c) => c.code === code);
    return currency?.symbol ?? "$";
}
