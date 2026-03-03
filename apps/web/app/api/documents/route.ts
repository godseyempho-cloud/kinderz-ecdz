import { prisma } from "@kinderz/db";
import {
  requireSession,
  requireRole,
  requireCenterAccess,
  errorResponse,
  ApiError,
} from "@/lib/api-guards";

// generic document upload endpoint used by mobile/web supervisory roles
export async function POST(req: Request) {
  try {
    const session = await requireSession();
    requireRole(session, ["SUPERVISOR", "ECD_USER"]);

    const body = await req.json();
    const { filename, url, category, ecdCenterId, reportId, monthlyReportId, comment } = body;
    if (!filename || !url || !category || !ecdCenterId) {
      throw new ApiError(400, "Missing required fields");
    }
    requireCenterAccess(session, ecdCenterId);

    // Sanitize and validate comment: replace tabs with spaces, trim, enforce max length
    let sanitizedComment: string | undefined = undefined;
    if (comment !== undefined && comment !== null) {
      const asString = String(comment).replace(/\t+/g, " ").trim();
      const MAX_LEN = 1000; // 1k chars max to avoid DB bloat
      if (asString.length > MAX_LEN) {
        throw new ApiError(400, `Comment is too long (max ${MAX_LEN} characters)`);
      }
      sanitizedComment = asString || undefined;
    }

    const record = await prisma.document.create({
      data: {
        filename,
        url,
        category,
        ecdCenterId,
        reportId: reportId || undefined,
        monthlyReportId: monthlyReportId || undefined,
        comment: sanitizedComment,
        uploadedById: session.user.id,
      },
    });

    return new Response(JSON.stringify(record), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
