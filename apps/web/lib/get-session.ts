import { auth } from "@/lib/betterAuth";
import { headers } from "next/headers";
import { prisma } from "@kinderz/db";

/**
 * Enhanced session type that includes role, jurisdiction, and status checks.
 * This enriches the basic Better-Auth session with database-driven permissions.
 */
export interface EnrichedSession {
    user: {
        id: string;
        email: string;
        role: string; // ADMIN, PROVINCIAL, SUPERVISOR, AUDITOR, ECD_USER
        ecdCenterId: string | null; // Jurisdiction: which center this user belongs to
        districtId: string | null; // Jurisdiction: which district this user belongs to
        isActive: boolean; // false = blocked from all access
        isFrozen: boolean; // false = account temporarily locked
        banned: boolean; // false = account permanently locked
    };
    expiresAt: number;
}

/**
 * getSession()
 * 1. Fetch session from Better-Auth
 * 2. Query user record from DB to get role, jurisdictions, status
 * 3. Return null if user is banned/frozen/inactive (immediate blocklist)
 * 4. Return enriched session with role + jurisdiction for guards
 */
export async function getSession(): Promise<EnrichedSession | null> {
    return await auth.api.getSession({
        headers: await headers()
        }).then(async (session) => {
            // If no session, return null immediately
            if (!session?.user?.id) return null;

            // Query Prisma to get full user record including role, jurisdictions, status
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: {
                    id: true,
                    email: true,
                    role: true,
                    ecdCenterId: true,
                    districtId: true,
                    isActive: true,
                    isFrozen: true,
                    banned: true,
                },
            });

            // User not found in DB (should not happen, but be safe)
            if (!user) return null;

            // REJECT: User is banned (permanent block)
            if (user.banned) return null;

            // REJECT: User is frozen (temporary block)
            if (user.isFrozen) return null;

            // REJECT: User is marked inactive (administrative hold)
            if (!user.isActive) return null;

            // Return enriched session with role, jurisdictions, and status snapshot
            return {
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role, // Now includes ADMIN, PROVINCIAL, etc.
                    ecdCenterId: user.ecdCenterId, // null for Admin/Provincial; set for SUPERVISOR/ECD_USER
                    districtId: user.districtId, // null for non-Auditor; set for AUDITOR
                    isActive: user.isActive,
                    isFrozen: user.isFrozen,
                    banned: user.banned,
                },
                // auth.api.getSession() returns { session: { expiresAt: Date }, user: {...} }
                // Convert to numeric ms timestamp for easier comparisons in guards
                expiresAt: session?.session?.expiresAt
                    ? new Date(session.session.expiresAt).getTime()
                    : Date.now(),
            };
    });
}  