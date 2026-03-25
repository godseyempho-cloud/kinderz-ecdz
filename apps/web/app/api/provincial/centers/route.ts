// /api/provincial/centers/route.ts
// Handles CRUD operations for ECD centers within the provincial's province.
// PROVINCIAL can create, update, or deactivate centers in their province.
// Guards: requireRole(PROVINCIAL), requireProvinceAccess.

import { prisma } from "@kinderz/db";
import { requireSession, requireRole, requireProvinceAccess, ApiError, errorResponse } from "@/lib/api-guards";

export async function GET(req: Request) {
  try {
    const session = await requireSession();
    requireRole(session, ["PROVINCIAL"]);
    const centers = await prisma.ecdCenter.findMany({
      where: { district: { provinceId: session.user.provinceId } },
      include: { district: true, supervisor: true },
    });
    return new Response(JSON.stringify(centers), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    requireRole(session, ["PROVINCIAL"]);
    const { name, districtId, basNumber, registrationExpiryDate, registrationLevel } = await req.json();
    // Validate district belongs to province
    const district = await prisma.district.findUnique({ where: { id: districtId } });
    if (!district || district.provinceId !== session.user.provinceId) throw new ApiError(403, "Invalid district");
    const center = await prisma.ecdCenter.create({
      data: { name, districtId, basNumber, registrationExpiryDate: registrationExpiryDate ? new Date(registrationExpiryDate) : null, registrationLevel },
    });
    return new Response(JSON.stringify(center), { status: 201, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return errorResponse(err);
  }
}