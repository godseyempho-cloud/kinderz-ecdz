import { NextResponse } from "next/server";
import { prisma } from "@kinderz/db";
import { getSession } from "@/lib/get-session";
import { requireCenterAccess, ApiError } from "@/lib/api-guards";
import { z } from "zod";

const findingSchema = z.object({
  message: z.string().min(5, "Finding content must be at least 5 characters"),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || !session.user) throw new ApiError(401, "Unauthorized");

    const report = await prisma.monthlyReport.findUnique({
      where: { id: params.id },
      select: { id: true, ecdCenterId: true }
    });

    if (!report) throw new ApiError(404, "Monthly report not found");

    await requireCenterAccess(session, report.ecdCenterId);

    const json = await req.json();
    const { message, severity } = findingSchema.parse(json);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the finding
      const newFinding = await tx.auditFinding.create({
        data: {
          reportId: report.id,
          content: message,
          severity: severity,
          status: "OPEN",
          createdBy: session.user.id, // Using the new relation field name
          comments: [],
        },
      });

      // 2. Update report status 
      // NOTE: Ensure 'REVISION_REQUIRED' matches your SubmissionStatus enum
      await tx.monthlyReport.update({
        where: { id: report.id },
        data: { 
          status: "REVISION_REQUIRED" 
        },
      });

      return newFinding;
    });

    return NextResponse.json(result, { status: 201 });

  } catch (error: any) {
    // Fix 2: Accessing Zod errors correctly
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    
    // Fix 3: Handle ApiError with type safety
    if (error instanceof ApiError) {
      const status = (error as any).statusCode || 500;
      return NextResponse.json({ error: error.message }, { status });
    }
    
    console.error("AUDIT_FINDING_POST_ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}