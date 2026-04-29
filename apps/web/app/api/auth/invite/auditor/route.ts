import { auth } from "@/lib/betterAuth";
import { headers } from "next/headers";
import { prisma } from "@kinderz/db";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto"; // Use native Node crypto

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "PROVINCIAL") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email, districtId } = await req.json();

  if (!email || !districtId) {
    return NextResponse.json({ error: "Email and District are required" }, { status: 400 });
  }

  try {
    // Generate a secure random token
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); 

    await prisma.invite.create({
      data: {
        email,
        role: "AUDITOR",
        districtId,
        provinceId: session.user.provinceId, 
        token,
        expiresAt,
      },
    });

    // Construct the link
    const inviteLink = `${process.env.BETTER_AUTH_URL}/auth/register?token=${token}`;

    return NextResponse.json({ success: true, inviteLink });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create invite" }, { status: 500 });
  }
}