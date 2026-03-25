import { prisma } from "@kinderz/db";
import {
  requireSession,
  requireRole,
  requireProvinceAccess,
  ApiError,
  errorResponse,
} from "@/lib/api-guards";

export async function POST(
  req: Request,
  { params }: { params: { id: string } } // This is the MonthlyReport ID
) {
  try {
    // 1. Security Check: Must be logged in and be an AUDITOR
    const session = await requireSession();
    requireRole(session, ["AUDITOR"]);

    const reportId = params.id;
    const body = await req.json();
    const { comments, status } = body;

    if (!status) {
      throw new ApiError(400, "Status is required (e.g., APPROVED, FLAGGED)");
    }

    // 2. Load the Monthly Report to check Province Access
    const report = await prisma.monthlyReport.findUnique({
      where: { id: reportId },
      include: { 
        ecdCenter: { 
          include: { 
            district: true 
          } 
        } 
      },
    });

    if (!report) {
      throw new ApiError(404, "Monthly Report not found");
    }

    // 3. Ensure Auditor has access to this Report's Province
    const reportProvinceId = report.ecdCenter.district.provinceId;
    requireProvinceAccess(session, reportProvinceId);

    // 4. Upsert the Finding (Create if new, Update if exists)
    const finding = await prisma.auditFinding.upsert({
      where: { reportId: reportId },
      update: {
        comments,
        status,
        reviewedById: session.user.id,
      },
      create: {
        reportId: reportId,
        comments,
        status,
        reviewedById: session.user.id,
        compliant: status === "APPROVED",
      },
    });

    // 5. Workflow Logic: If corrections are needed, move report back to DRAFT
    if (status === "CORRECTIONS_REQUIRED") {
      await prisma.monthlyReport.update({
        where: { id: reportId },
        data: { status: "DRAFT" }
      });
    }

    return new Response(JSON.stringify(finding), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    // Use the centralized error handler from your lib
    return errorResponse(error);
  }
}







// import { prisma } from "@kinderz/db";
// import {
//   requireSession,
//   requireRole,
//   requireProvinceAccess,
//   ApiError,
//   errorResponse,
// } from "@/lib/api-guards";

// // PROVINCIAL reviews an audit finding (approve/flag/corrections_required)
// export async function PATCH(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const session = await requireSession();
//     requireRole(session, ["PROVINCIAL"]);

//     const findingId = params.id;
//     const body = await req.json();
//     const { status } = body; // expected to be one of the FindingStatus enum values

//     if (!status) {
//       throw new ApiError(400, "Missing new status");
//     }

//     // load existing finding + its report's province via relation
//     const existing = await prisma.auditFinding.findUnique({
//       where: { id: findingId },
//       include: { report: { include: { ecdCenter: { include: { district: true } } } } },
//     });

//     if (!existing) {
//       throw new ApiError(404, "Audit finding not found");
//     }

//     // ensure the provincial user is assigned to same province
//     const reportProvinceId = existing.report.ecdCenter.district.provinceId;
//     requireProvinceAccess(session, reportProvinceId);

//     const updated = await prisma.auditFinding.update({
//       where: { id: findingId },
//       data: {
//         status,
//         reviewedById: session.user.id,
//       },
//     });

//     return new Response(JSON.stringify(updated), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (error) {
//     return errorResponse(error);
//   }
// }
