import { prisma } from "@kinderz/db";
import { requireSession, requireRole, ApiError, errorResponse } from "@/lib/api-guards";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireSession();
    requireRole(session, ["SUPERVISOR"]);

    const { responseText } = await req.json();

    const updatedFinding = await prisma.auditFinding.update({
  where: { reportId: params.id },
  data: {
    comments: {
      push: `SUPERVISOR [${new Date().toLocaleDateString()}]: ${responseText}`
    },
    status: "RESOLVED_BY_SUPERVISOR"
  }
});

    return new Response(JSON.stringify(updatedFinding), { status: 200 });
  } catch (error) {
    return errorResponse(error);
  }
}