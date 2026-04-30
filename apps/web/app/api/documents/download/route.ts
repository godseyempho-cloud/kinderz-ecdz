// /apps/web/app/api/documents/download/route.ts
import { prisma } from "@kinderz/db";
import { 
  requireSession, 
  requireCenterAccess, 
  errorResponse, 
  ApiError 
} from "@/lib/api-guards";

export async function GET(req: Request) {
  try {
    const session = await requireSession();
    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get("id");

    if (!documentId) throw new ApiError(400, "Document ID is required");

    const doc = await prisma.document.findUnique({
      where: { id: documentId },
      select: { 
        storageKey: true, 
        ecdCenterId: true, 
        filename: true 
      }
    });

    if (!doc) throw new ApiError(404, "Document not found");

    // Check if Auditor/Supervisor has rights to this Center
    await requireCenterAccess(session, doc.ecdCenterId);

    /**
     * NOTE: Once you pick a provider (Vercel Blob, AWS S3, etc.),
     * you will replace the line below with their "getSignedUrl" function.
     * For now, we return a mock secure URL.
     */
    const temporaryUrl = `https://placeholder-storage.com/${doc.storageKey}?token=temp_pass_for_${session.user.id}`;

    return new Response(JSON.stringify({ 
      url: temporaryUrl,
      filename: doc.filename 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return errorResponse(err);
  }
}