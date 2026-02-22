import { PrismaClient } from "../generated/prisma/wasm";
import { PrismaD1 } from "@prisma/adapter-d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const globalForPrisma = globalThis as unknown as {
    prisma: InstanceType<typeof PrismaClient> | undefined;
};

/**
 * Get a Prisma client instance.
 * - In production (Cloudflare Workers): creates a client with D1 adapter per request
 * - In development: uses a cached global PrismaClient with local SQLite
 */
export function getPrisma() {
    if (process.env.NODE_ENV === "production") {
        const { env } = getCloudflareContext();
        const adapter = new PrismaD1(env.DB);
        return new PrismaClient({ adapter });
    }

    if (!globalForPrisma.prisma) {
        globalForPrisma.prisma = new PrismaClient();
    }
    return globalForPrisma.prisma;
}
