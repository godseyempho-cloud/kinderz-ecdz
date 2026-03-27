import { NextResponse } from "next/server";
import { prisma } from "@kinderz/db"; 
import { getSession } from "@/lib/get-session";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();

    // Guard: Ensure user is logged in and is a SUPERVISOR
    if (!session || session.user.role !== "SUPERVISOR") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { comment } = await req.json();
    const findingId = params.id;

    if (!comment || comment.trim().length < 5) {
      return new NextResponse("A valid resolution comment is required.", { status: 400 });
    }

    // Update the finding
    // We move status to 'RESOLVED' and append the supervisor's note to the comments array
    const updatedFinding = await prisma.auditFinding.update({
      where: { 
        id: findingId 
      },
      data: {
        status: "RESOLVED",
        comments: {
          push: `[${new Date().toLocaleDateString()}] Supervisor Resolve: ${comment}`,
        },
        // If your schema has a resolvedAt field, uncomment below:
        // resolvedAt: new Date(),
      },
    });

    return NextResponse.json(updatedFinding);
  } catch (error) {
    console.error("[FINDING_RESOLVE_PATCH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}