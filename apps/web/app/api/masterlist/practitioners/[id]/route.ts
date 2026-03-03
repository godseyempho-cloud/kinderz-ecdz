import { prisma } from "@kinderz/db";
import {
  requireSession,
  requireRole,
  requireCenterAccess,
  errorResponse,
  ApiError,
} from "@/lib/api-guards";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireSession();
    requireRole(session, ["SUPERVISOR", "ECD_USER"]);

    const body = await req.json();
    const { fullName, role, salary } = body;

    const existing = await prisma.practitioner.findUnique({ where: { id: params.id } });
    if (!existing) throw new ApiError(404, "Practitioner not found");
    requireCenterAccess(session, existing.ecdCenterId);

    const updated = await prisma.practitioner.update({
      where: { id: params.id },
      data: {
        fullName: fullName ?? existing.fullName,
        role: role ?? existing.role,
        salary: salary ? salary.toString() : existing.salary,
      },
    });

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireSession();
    requireRole(session, ["SUPERVISOR", "ECD_USER"]);

    const existing = await prisma.practitioner.findUnique({ where: { id: params.id } });
    if (!existing) throw new ApiError(404, "Practitioner not found");
    requireCenterAccess(session, existing.ecdCenterId);

    await prisma.practitioner.delete({ where: { id: params.id } });
    return new Response(null, { status: 204 });
  } catch (err) {
    return errorResponse(err);
  }
}
