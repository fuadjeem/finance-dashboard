// Extend CloudflareEnv to include our D1 database binding
declare global {
    interface CloudflareEnv {
        DB: D1Database;
    }
}

export { };
