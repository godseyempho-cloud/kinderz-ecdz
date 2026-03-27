// import { prisma } from "@kinderz/db";
// import {
//   requireSession,
//   requireRole,
//   requireDistrictAccess,
//   ApiError,
//   errorResponse,
// } from "@/lib/api-guards"; 

// // AUDITOR creates a finding tied to a quarterly report
// export async function POST(req: Request) {
//   try {
//     const session = await requireSession();
//     requireRole(session, ["AUDITOR"]);

//     const body = await req.json();
//     const { reportId, comments, compliant } = body;

//     if (!reportId || comments === undefined || compliant === undefined) {
//       throw new ApiError(400, "Missing required fields");
//     }

//     // ensure report exists and belongs to the auditor's district
//     const report = await prisma.quarterlyReport.findUnique({
//       where: { id: reportId },
//       include: { ecdCenter: { select: { districtId: true } } },
//     });

//     if (!report) {
//       throw new ApiError(404, "Quarterly report not found");
//     }

//     if (report.ecdCenter.districtId !== session.user.districtId) {
//       throw new ApiError(403, "Forbidden: Report outside your district.");
//     }

//     const finding = await prisma.auditFinding.create({
//       data: {
//         comments,
//         compliant,
//         reportId,
//       },
//     });

//     return new Response(JSON.stringify(finding), {
//       status: 201,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (error) {
//     return errorResponse(error);
//   }
// }




import { NextResponse } from "next/server";
import { prisma } from "@kinderz/db";
import { requireSession, requireRole, errorResponse } from "@/lib/api-guards";

export async function GET(req: Request) {
  try {
    const session = await requireSession();
    requireRole(session, ["AUDITOR", "ADMIN"]);

    // Fetch all reports that are SUBMITTED (ready for audit) 
    // or already have active findings.
    const reports = await prisma.monthlyReport.findMany({
      where: {
        // Auditors usually only look at submitted or flagged reports
        status: { in: ["SUBMITTED", "APPROVED", "REVISION_REQUIRED"] }
      },
      include: {
        ecdCenter: true,
        auditFindings: true,
        submittedBy: {
          select: { name: true, email: true }
        }
      },
      orderBy: { updatedAt: "desc" }
    });

    return NextResponse.json(reports);
  } catch (error) {
    return errorResponse(error);
  }
}