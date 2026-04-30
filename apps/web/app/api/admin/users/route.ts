import { prisma } from "@kinderz/db";
import { requireSession, requireRole, ApiError, errorResponse } from "@/lib/api-guards";

// Admin users endpoint: list users, change roles/flags, ban/unban
export async function GET(req: Request) {
  try {
    const session = await requireSession();
    requireRole(session, ["ADMIN"]);
    
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      // Optional: select specific fields to avoid leaking sensitive metadata
    });
    
    return new Response(JSON.stringify(users), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await requireSession();
    requireRole(session, ["ADMIN"]);

    const { id, role, isActive, banned } = await req.json();
    
    if (!id) throw new ApiError(400, "User ID required");

    // CRITICAL SAFETY: Prevent Admin from locking themselves out
    if (id === session.user.id && (isActive === false || banned === true)) {
      throw new ApiError(400, "Security Violation: You cannot deactivate or ban your own administrative account.");
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role, isActive, banned },
    });

    return new Response(JSON.stringify(user), { status: 200 });
  } catch (err) {
    return errorResponse(err);
  }
}