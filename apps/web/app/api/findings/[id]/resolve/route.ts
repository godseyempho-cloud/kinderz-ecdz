// Location: apps/web/app/api/findings/[id]/resolve/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@kinderz/db"; 
import { getSession } from "@/lib/get-session";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();

    if (!session || session.user.role !== "SUPERVISOR") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { comment } = await req.json();

    const updatedFinding = await prisma.auditFinding.update({
      where: { id: params.id },
      data: {
        // Match your FindingStatus enum:
        status: "RESOLVED_BY_SUPERVISOR", 
        comments: {
          push: `[${new Date().toLocaleDateString()}] Supervisor Resolve: ${comment}`,
        },
      },
    });

    return NextResponse.json(updatedFinding);
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}