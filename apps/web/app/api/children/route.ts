import { auth } from "@/lib/betterAuth";
import { prisma } from "@kinderz/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  
  const ecdCenterId = session?.user?.ecdCenterId;
  const role = session?.user?.role;

  // Allow both roles to SEE the children (Read-only)
  if (!session || !ecdCenterId || !["ECD_USER", "SUPERVISOR"].includes(role || "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const children = await prisma.child.findMany({
      where: { ecdCenterId: ecdCenterId },
      orderBy: { fullName: 'asc' }, // Ensure 'name' matches your schema field!
    });

    return NextResponse.json(children);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch children" }, { status: 500 });
  }
}