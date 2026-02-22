/**
 * D1-compatible database abstraction layer
 * In production (Cloudflare Workers): uses D1 directly via getCloudflareContext()
 * In development: uses better-sqlite3 via the local SQLite file
 */

import { getCloudflareContext } from "@opennextjs/cloudflare";

// Re-export a cuid-like ID generator (simple but unique enough)
function generateId(): string {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    const timestamp = Date.now().toString(36);
    let random = "";
    for (let i = 0; i < 12; i++) {
        random += chars[Math.floor(Math.random() * chars.length)];
    }
    return timestamp + random;
}

interface D1Result<T = Record<string, unknown>> {
    results: T[];
}

interface D1DB {
    prepare(sql: string): {
        bind(...params: unknown[]): {
            all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
            first<T = Record<string, unknown>>(): Promise<T | null>;
            run(): Promise<unknown>;
        };
    };
}

function getDB(): D1DB {
    const { env } = getCloudflareContext();
    return env.DB as unknown as D1DB;
}

// --- User operations ---

interface User {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    createdAt: string;
}

export async function findUserByEmail(email: string): Promise<User | null> {
    const db = getDB();
    return db.prepare("SELECT * FROM User WHERE email = ?").bind(email).first<User>();
}

export async function createUser(data: { name: string; email: string; passwordHash: string }): Promise<User> {
    const db = getDB();
    const id = generateId();
    await db
        .prepare("INSERT INTO User (id, name, email, passwordHash, createdAt) VALUES (?, ?, ?, ?, datetime('now'))")
        .bind(id, data.name, data.email, data.passwordHash)
        .run();
    return (await db.prepare("SELECT * FROM User WHERE id = ?").bind(id).first<User>())!;
}

// --- Category operations ---

interface Category {
    id: string;
    userId: string;
    name: string;
    type: string;
    active: number; // SQLite boolean
    createdAt: string;
}

export async function findCategories(
    userId: string,
    opts?: { type?: string; activeOnly?: boolean }
): Promise<Category[]> {
    const db = getDB();
    let sql = "SELECT * FROM Category WHERE userId = ?";
    const params: unknown[] = [userId];

    if (opts?.type) {
        sql += " AND type = ?";
        params.push(opts.type);
    }
    if (opts?.activeOnly !== false) {
        sql += " AND active = 1";
    }
    sql += " ORDER BY name ASC";

    const stmt = db.prepare(sql);
    const result = await stmt.bind(...params).all<Category>();
    return result.results;
}

export async function findCategoryById(id: string, userId: string): Promise<Category | null> {
    const db = getDB();
    return db.prepare("SELECT * FROM Category WHERE id = ? AND userId = ?").bind(id, userId).first<Category>();
}

export async function findCategoryByNameAndType(
    userId: string,
    name: string,
    type: string
): Promise<Category | null> {
    const db = getDB();
    return db
        .prepare("SELECT * FROM Category WHERE userId = ? AND name = ? AND type = ?")
        .bind(userId, name, type)
        .first<Category>();
}

export async function createCategory(data: { userId: string; name: string; type: string }): Promise<Category> {
    const db = getDB();
    const id = generateId();
    await db
        .prepare("INSERT INTO Category (id, userId, name, type, active, createdAt) VALUES (?, ?, ?, ?, 1, datetime('now'))")
        .bind(id, data.userId, data.name, data.type)
        .run();
    return (await db.prepare("SELECT * FROM Category WHERE id = ?").bind(id).first<Category>())!;
}

export async function createManyCategories(
    categories: { userId: string; name: string; type: string }[]
): Promise<void> {
    const db = getDB();
    for (const cat of categories) {
        const id = generateId();
        await db
            .prepare("INSERT INTO Category (id, userId, name, type, active, createdAt) VALUES (?, ?, ?, ?, 1, datetime('now'))")
            .bind(id, cat.userId, cat.name, cat.type)
            .run();
    }
}

export async function updateCategory(
    id: string,
    data: { name?: string; active?: boolean }
): Promise<Category> {
    const db = getDB();
    const sets: string[] = [];
    const params: unknown[] = [];

    if (data.name !== undefined) {
        sets.push("name = ?");
        params.push(data.name);
    }
    if (data.active !== undefined) {
        sets.push("active = ?");
        params.push(data.active ? 1 : 0);
    }

    if (sets.length > 0) {
        params.push(id);
        await db.prepare(`UPDATE Category SET ${sets.join(", ")} WHERE id = ?`).bind(...params).run();
    }

    return (await db.prepare("SELECT * FROM Category WHERE id = ?").bind(id).first<Category>())!;
}

// --- Transaction operations ---

interface Transaction {
    id: string;
    userId: string;
    categoryId: string;
    type: string;
    amountCents: number;
    date: string;
    note: string;
    createdAt: string;
    categoryName?: string;
}

export async function findTransactions(
    userId: string,
    opts?: {
        type?: string;
        categoryId?: string;
        startDate?: string;
        endDate?: string;
        search?: string;
        limit?: number;
        offset?: number;
    }
): Promise<{ transactions: Transaction[]; total: number }> {
    const db = getDB();
    let whereSql = "WHERE t.userId = ?";
    const params: unknown[] = [userId];
    const countParams: unknown[] = [userId];

    if (opts?.type) {
        whereSql += " AND t.type = ?";
        params.push(opts.type);
        countParams.push(opts.type);
    }
    if (opts?.categoryId) {
        whereSql += " AND t.categoryId = ?";
        params.push(opts.categoryId);
        countParams.push(opts.categoryId);
    }
    if (opts?.startDate) {
        whereSql += " AND t.date >= ?";
        params.push(opts.startDate);
        countParams.push(opts.startDate);
    }
    if (opts?.endDate) {
        whereSql += " AND t.date <= ?";
        params.push(opts.endDate);
        countParams.push(opts.endDate);
    }
    if (opts?.search) {
        whereSql += " AND t.note LIKE ?";
        params.push(`%${opts.search}%`);
        countParams.push(`%${opts.search}%`);
    }

    const limit = opts?.limit ?? 50;
    const offset = opts?.offset ?? 0;

    const countResult = await db
        .prepare(`SELECT COUNT(*) as count FROM "Transaction" t ${whereSql}`)
        .bind(...countParams)
        .first<{ count: number }>();

    params.push(limit, offset);
    const result = await db
        .prepare(
            `SELECT t.*, c.name as categoryName FROM "Transaction" t LEFT JOIN Category c ON t.categoryId = c.id ${whereSql} ORDER BY t.date DESC, t.createdAt DESC LIMIT ? OFFSET ?`
        )
        .bind(...params)
        .all<Transaction>();

    return {
        transactions: result.results.map((t) => ({
            ...t,
            category: { name: t.categoryName || "" },
        })) as unknown as Transaction[],
        total: countResult?.count || 0,
    };
}

export async function findTransactionById(
    id: string,
    userId: string
): Promise<Transaction | null> {
    const db = getDB();
    return db
        .prepare('SELECT * FROM "Transaction" WHERE id = ? AND userId = ?')
        .bind(id, userId)
        .first<Transaction>();
}

export async function createTransaction(data: {
    userId: string;
    categoryId: string;
    type: string;
    amountCents: number;
    date: string;
    note: string;
}): Promise<Transaction> {
    const db = getDB();
    const id = generateId();
    await db
        .prepare(
            'INSERT INTO "Transaction" (id, userId, categoryId, type, amountCents, date, note, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, datetime(\'now\'))'
        )
        .bind(id, data.userId, data.categoryId, data.type, data.amountCents, data.date, data.note)
        .run();

    const tx = await db
        .prepare(
            'SELECT t.*, c.name as categoryName FROM "Transaction" t LEFT JOIN Category c ON t.categoryId = c.id WHERE t.id = ?'
        )
        .bind(id)
        .first<Transaction>();

    return { ...tx!, category: { name: tx?.categoryName || "" } } as unknown as Transaction;
}

export async function updateTransaction(
    id: string,
    data: {
        type?: string;
        amountCents?: number;
        categoryId?: string;
        date?: string;
        note?: string;
    }
): Promise<Transaction> {
    const db = getDB();
    const sets: string[] = [];
    const params: unknown[] = [];

    if (data.type) { sets.push("type = ?"); params.push(data.type); }
    if (data.amountCents) { sets.push("amountCents = ?"); params.push(Math.round(data.amountCents)); }
    if (data.categoryId) { sets.push("categoryId = ?"); params.push(data.categoryId); }
    if (data.date) { sets.push("date = ?"); params.push(data.date); }
    if (data.note !== undefined) { sets.push("note = ?"); params.push(data.note); }

    if (sets.length > 0) {
        params.push(id);
        await db.prepare(`UPDATE "Transaction" SET ${sets.join(", ")} WHERE id = ?`).bind(...params).run();
    }

    const tx = await db
        .prepare(
            'SELECT t.*, c.name as categoryName FROM "Transaction" t LEFT JOIN Category c ON t.categoryId = c.id WHERE t.id = ?'
        )
        .bind(id)
        .first<Transaction>();

    return { ...tx!, category: { name: tx?.categoryName || "" } } as unknown as Transaction;
}

export async function deleteTransaction(id: string): Promise<void> {
    const db = getDB();
    await db.prepare('DELETE FROM "Transaction" WHERE id = ?').bind(id).run();
}

export async function findTransactionsForSummary(
    userId: string,
    startDate: string,
    endDate: string
): Promise<{ type: string; amountCents: number; date: string }[]> {
    const db = getDB();
    const result = await db
        .prepare(
            'SELECT type, amountCents, date FROM "Transaction" WHERE userId = ? AND date >= ? AND date <= ?'
        )
        .bind(userId, startDate, endDate)
        .all<{ type: string; amountCents: number; date: string }>();
    return result.results;
}

export async function findTransactionsForExport(
    userId: string
): Promise<{ date: string; type: string; categoryName: string; amountCents: number; note: string }[]> {
    const db = getDB();
    const result = await db
        .prepare(
            'SELECT t.date, t.type, c.name as categoryName, t.amountCents, t.note FROM "Transaction" t LEFT JOIN Category c ON t.categoryId = c.id WHERE t.userId = ? ORDER BY t.date DESC, t.createdAt DESC'
        )
        .bind(userId)
        .all<{ date: string; type: string; categoryName: string; amountCents: number; note: string }>();
    return result.results;
}
