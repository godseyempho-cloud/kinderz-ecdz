// /apps/web/app/api/documents/route.ts
import { prisma } from "@kinderz/db";
import { Prisma } from "@prisma/client";
import {
  requireSession,
  requireRole,
  requireCenterAccess,
  errorResponse,
  ApiError,
} from "@/lib/api-guards";

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    requireRole(session, ["SUPERVISOR", "ECD_USER", "ADMIN"]);

    const body = await req.json();
    let { filename, storageKey, category, ecdCenterId, reportId, monthlyReportId, comment } = body;

    // Fix permissions: Force center ID for staff
    if (session.user.role === "SUPERVISOR" || session.user.role === "ECD_USER") {
      ecdCenterId = session.user.ecdCenterId;
    }

    if (!filename || !storageKey || !category || !ecdCenterId) {
      throw new ApiError(400, "Missing required fields (filename, storageKey, category, ecdCenterId)");
    }

    requireCenterAccess(session, ecdCenterId);

    const record = await prisma.document.create({
      data: {
        filename,
        storageKey, // Ensure your schema migration 'npx prisma migrate dev' has run
        category,
        ecdCenterId,
        reportId: reportId || undefined,
        monthlyReportId: monthlyReportId || undefined,
        comment: comment || undefined,
        uploadedById: session.user.id,
      },
    });

    return new Response(JSON.stringify(record), { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function GET(req: Request) {
  try {
    const session = await requireSession();
    const { searchParams } = new URL(req.url);
    const targetCenterId = searchParams.get("ecdCenterId");

    const whereClause: Prisma.DocumentWhereInput = {};

    if (session.user.role === "SUPERVISOR" || session.user.role === "ECD_USER") {
      whereClause.ecdCenterId = session.user.ecdCenterId!;
    } 
    else if (session.user.role === "AUDITOR") {
      whereClause.ecdCenter = { districtId: session.user.districtId! };
      if (targetCenterId) whereClause.ecdCenterId = targetCenterId;
    }
    else if (session.user.role === "PROVINCIAL") {
      whereClause.ecdCenter = { district: { provinceId: session.user.provinceId! } };
      if (targetCenterId) whereClause.ecdCenterId = targetCenterId;
    }
    else if (session.user.role === "ADMIN") {
      if (targetCenterId) whereClause.ecdCenterId = targetCenterId;
    } 

    const documents = await prisma.document.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    return new Response(JSON.stringify(documents), { status: 200 });
  } catch (err) {
    return errorResponse(err);   
  }
}