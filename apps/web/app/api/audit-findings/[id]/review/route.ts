import { prisma } from "@kinderz/db";
import {
  requireSession,
  requireRole,
  requireProvinceAccess,
  ApiError,
  errorResponse,
} from "@/lib/api-guards";

// PROVINCIAL reviews an audit finding (approve/flag/corrections_required)
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireSession();
    requireRole(session, ["PROVINCIAL"]);

    const findingId = params.id;
    const body = await req.json();
    const { status } = body; // expected to be one of the FindingStatus enum values

    if (!status) {
      throw new ApiError(400, "Missing new status");
    }

    // load existing finding + its report's province via relation
    const existing = await prisma.auditFinding.findUnique({
      where: { id: findingId },
      include: { report: { include: { ecdCenter: { include: { district: true } } } } },
    });

    if (!existing) {
      throw new ApiError(404, "Audit finding not found");
    }

    // ensure the provincial user is assigned to same province
    const reportProvinceId = existing.report.ecdCenter.district.provinceId;
    requireProvinceAccess(session, reportProvinceId);

    const updated = await prisma.auditFinding.update({
      where: { id: findingId },
      data: {
        status,
        reviewedById: session.user.id,
      },
    });

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
