import { prisma } from "@kinderz/db";
import {
  requireSession,
  requireRole,
  requireCenterAccess,
  errorResponse,
  ApiError,
} from "@/lib/api-guards";

// Manage practitioner masterlist for a center
export async function GET(req: Request) {
  try {
    const session = await requireSession();
    requireRole(session, ["SUPERVISOR", "ECD_USER"]);

    const url = new URL(req.url);
    const centerId = url.searchParams.get("centerId");
    if (!centerId) {
      throw new ApiError(400, "centerId query parameter required");
    }
    requireCenterAccess(session, centerId);

    const skip = parseInt(url.searchParams.get("skip") || "0");
    const take = parseInt(url.searchParams.get("take") || "50");

    const list = await prisma.practitioner.findMany({
      where: { ecdCenterId: centerId },
      skip,
      take,
      orderBy: { fullName: "asc" },
    });

    return new Response(JSON.stringify(list), {
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
    requireRole(session, ["SUPERVISOR", "ECD_USER"]);

    const body = await req.json();
    const { fullName, role, salary, ecdCenterId } = body;
    if (!fullName || !role || !ecdCenterId) {
      throw new ApiError(400, "Missing required fields");
    }
    requireCenterAccess(session, ecdCenterId);

    const created = await prisma.practitioner.create({
      data: {
        fullName,
        role,
        salary: salary ? salary.toString() : undefined,
        ecdCenterId,
      },
    });

    return new Response(JSON.stringify(created), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
