import { prisma } from "@kinderz/db";
import { requireSession, requireRole, ApiError, errorResponse } from "@/lib/api-guards";

// CRUD for provincial-level records. ADMIN uses this to create or reassign a
// provincial user, and optionally update the province metadata.

export async function GET(req: Request) {
  try {
    const session = await requireSession();
    requireRole(session, ["ADMIN"]);
    const provincials = await prisma.user.findMany({ where: { role: "PROVINCIAL" } });
    return new Response(JSON.stringify(provincials), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return errorResponse(err);
  }
} 

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    requireRole(session, ["ADMIN"]);
    const { email, provinceId } = await req.json();
    // in practice we'd create an invite instead; this endpoint is a shortcut.
    const user = await prisma.user.create({
      data: { email, role: "PROVINCIAL", provinceId },
    });
    return new Response(JSON.stringify(user), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
