import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { headers } from "next/headers";
import { decode } from "next-auth/jwt";

export async function getSessionUser() {
    // Mobile clients send Authorization: Bearer <token>
    const headersList = await headers();
    const authHeader = headersList.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        try {
            const decoded = await decode({
                token,
                secret: process.env.NEXTAUTH_SECRET as string,
            });
            if (decoded?.id) {
                return {
                    id: decoded.id as string,
                    name: decoded.name as string,
                    email: decoded.email as string,
                };
            }
        } catch { /* invalid token, fall through to cookie session */ }
    }

    // Web clients use cookie-based NextAuth sessions
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;
    return session.user as { id: string; name: string; email: string };
}
