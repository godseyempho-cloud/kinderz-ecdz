import { prisma } from "@kinderz/db";
import {
  requireSession,
  requireRole,
  requireDistrictAccess,
  preventSelfReview,
  errorResponse,
} from "@/lib/api-guards";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireSession();
    requireRole(session, ["AUDITOR"]);

    const reportId = params.id; 

    // load existing report with center/district so we can apply district guard
    const existing = await prisma.monthlyReport.findUnique({
      where: { id: reportId },
      include: { ecdCenter: { select: { districtId: true } } },
    });

    if (!existing) {
      throw new Error("Monthly report not found");
    }

    // enforce that auditor belongs to same district
    requireDistrictAccess(session, existing.ecdCenter.districtId);

    // conflict of interest check
    preventSelfReview(existing.submittedById, session.user.id);

    // parse incoming review fields
    const {
      salariesDepCalc,
      foodDepCalc,
      overheadsDepCalc,
      attendanceCount,
      childrenFunded,
    } = await req.json();

    const updated = await prisma.monthlyReport.update({
      where: { id: reportId },
      data: {
        salariesDepCalc,
        foodDepCalc,
        overheadsDepCalc,
        attendanceCount,
        childrenFunded,
        reviewedById: session.user.id,
        reviewedAt: new Date(),
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
