import { prisma } from "@kinderz/db";
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
    requireRole(session, ["SUPERVISOR", "ECD_USER"]);

    const body = await req.json();
    const { childId, date, present, reportId } = body;
    if (!childId || date === undefined || present === undefined) {
      throw new ApiError(400, "Missing required fields");
    }

    // verify child belongs to same center
    const child = await prisma.child.findUnique({ where: { id: childId } });
    if (!child) throw new ApiError(404, "Child not found");
    requireCenterAccess(session, child.ecdCenterId);

    const data: any = {
      childId,
      date: new Date(date),
      present,
    };
    if (reportId) data.reportId = reportId;

    const attendance = await prisma.attendance.create({ data });

    return new Response(JSON.stringify(attendance), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
