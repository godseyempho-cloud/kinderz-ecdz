import { prisma } from "@kinderz/db";
import { requireSession, requireRole, ApiError, errorResponse } from "@/lib/api-guards";

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    requireRole(session, ["AUDITOR"]);

    // FIX 1: You extracted 'centerId' from the JSON, 
    // but you tried to use 'ecdCenterId' in the prisma.create block.
    // We will rename it here to match your schema.
    const { centerId: ecdCenterId, quarter, year, monthlyReportIds } = await req.json();

    // 1. Check if all 3 monthly reports are actually APPROVED
    const reports = await prisma.monthlyReport.findMany({
      where: { 
        id: { in: monthlyReportIds }, 
        status: "APPROVED" 
      }
    });

    if (reports.length < 3) {
      throw new ApiError(400, "All three monthly reports must be APPROVED before quarterly submission.");
    }

    // 2. Create the Quarterly Report
    const quarterly = await prisma.quarterlyReport.create({
      data: {
        ecdCenterId, // This now matches the variable name above
        quarter,
        year,
        status: "SUBMITTED_TO_PROVINCE",
        // FIX 2: Your model calls this 'createdById', not 'compiledById'.
        createdById: session.user.id, 
      }
    });

    return new Response(JSON.stringify(quarterly), { 
        status: 201,
        headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return errorResponse(error);
  }
}