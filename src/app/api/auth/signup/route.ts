import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { findUserByEmail, createUser, createManyCategories } from "@/lib/d1";

const DEFAULT_COST_CATEGORIES = [
    "Food & Dining",
    "Transportation",
    "Housing",
    "Utilities",
    "Entertainment",
    "Shopping",
    "Healthcare",
    "Education",
    "Other",
];

const DEFAULT_INCOME_CATEGORIES = [
    "Salary",
    "Freelance",
    "Investment",
    "Gift",
    "Other",
];

export async function POST(req: NextRequest) {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Name, email, and password are required" },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters" },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Invalid email format" },
                { status: 400 }
            );
        }

        const existing = await findUserByEmail(email);
        if (existing) {
            return NextResponse.json(
                { error: "Email already registered" },
                { status: 409 }
            );
        }

        const passwordHash = await hash(password, 12);

        const user = await createUser({ name, email, passwordHash });

        // Create default categories
        const allCategories = [
            ...DEFAULT_COST_CATEGORIES.map((cat) => ({
                userId: user.id,
                name: cat,
                type: "COST",
            })),
            ...DEFAULT_INCOME_CATEGORIES.map((cat) => ({
                userId: user.id,
                name: cat,
                type: "INCOME",
            })),
        ];
        await createManyCategories(allCategories);

        return NextResponse.json(
            { message: "Account created", userId: user.id },
            { status: 201 }
        );
    } catch {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
