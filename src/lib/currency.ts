/**
 * Currency configuration and formatting utilities.
 * Used across all pages to display amounts in the user's preferred currency.
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
    { code: "KES", name: "Kenyan Shilling", symbol: "KSh" },
    { code: "GHS", name: "Ghanaian Cedi", symbol: "₵" },
    { code: "SEK", name: "Swedish Krona", symbol: "kr" },
    { code: "NOK", name: "Norwegian Krone", symbol: "kr" },
    { code: "DKK", name: "Danish Krone", symbol: "kr" },
    { code: "PLN", name: "Polish Zloty", symbol: "zł" },
    { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" },
    { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
    { code: "TWD", name: "New Taiwan Dollar", symbol: "NT$" },
    { code: "COP", name: "Colombian Peso", symbol: "COL$" },
    { code: "ARS", name: "Argentine Peso", symbol: "AR$" },
    { code: "CLP", name: "Chilean Peso", symbol: "CLP$" },
    { code: "PEN", name: "Peruvian Sol", symbol: "S/." },
    { code: "RUB", name: "Russian Ruble", symbol: "₽" },
    { code: "UAH", name: "Ukrainian Hryvnia", symbol: "₴" },
    { code: "RON", name: "Romanian Leu", symbol: "lei" },
    { code: "CZK", name: "Czech Koruna", symbol: "Kč" },
    { code: "HUF", name: "Hungarian Forint", symbol: "Ft" },
    { code: "ILS", name: "Israeli Shekel", symbol: "₪" },
    { code: "QAR", name: "Qatari Riyal", symbol: "﷼" },
    { code: "KWD", name: "Kuwaiti Dinar", symbol: "د.ك" },
    { code: "BHD", name: "Bahraini Dinar", symbol: "BD" },
    { code: "OMR", name: "Omani Rial", symbol: "﷼" },
    { code: "LKR", name: "Sri Lankan Rupee", symbol: "₨" },
    { code: "MMK", name: "Myanmar Kyat", symbol: "K" },
    { code: "NPR", name: "Nepalese Rupee", symbol: "₨" },
];

/** All valid currency codes as a Set for fast lookup */
export const VALID_CURRENCY_CODES = new Set(CURRENCIES.map((c) => c.code));

/**
 * Format cents to a localized currency string.
 * Uses Intl.NumberFormat for proper symbol placement and number formatting.
 */
export function formatCurrency(cents: number, currencyCode: string = "USD"): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currencyCode,
        currencyDisplay: "narrowSymbol",
    }).format(cents / 100);
}

/**
 * Get the symbol for a given currency code.
 */
export function getCurrencySymbol(code: string): string {
    const currency = CURRENCIES.find((c) => c.code === code);
    return currency?.symbol ?? "$";
}
