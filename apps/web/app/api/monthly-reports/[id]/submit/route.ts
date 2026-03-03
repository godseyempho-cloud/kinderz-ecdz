import { prisma } from "@kinderz/db";
import {
  requireSession,
  requireRole,
  isReportLocked,
  errorResponse,
  ApiError,
} from "@/lib/api-guards";

/**
 * POST /api/monthly-reports/[id]/submit
 * 
 * Supervisor transitions a DRAFT report to SUBMITTED (locked).
 * Once SUBMITTED, the supervisor cannot edit; the auditor begins review.
 * This enforces data integrity: prevents supervisor from changing data after auditor has seen it.
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireSession();
    requireRole(session, ["SUPERVISOR", "ECD_USER"]);

    const reportId = params.id;

    // Load the report to check status and ownership
    const report = await prisma.monthlyReport.findUnique({
      where: { id: reportId },
      select: {
        id: true,
        status: true,
        submittedById: true,
        ecdCenterId: true,
      },
    });

    if (!report) {
      throw new ApiError(404, "Monthly report not found");
    }

    // Verify the supervisor owns this report (can only submit your own)
    if (report.submittedById !== session.user.id) {
      throw new ApiError(403, "You can only submit reports you created");
    }

    // Verify report is still in DRAFT status; cannot re-submit already submitted reports
    isReportLocked(report.status, ["DRAFT"]);

    // Transition to SUBMITTED and set submittedAt timestamp
    const updated = await prisma.monthlyReport.update({
      where: { id: reportId },
      data: {
        status: "SUBMITTED",
        submittedAt: new Date(),
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
