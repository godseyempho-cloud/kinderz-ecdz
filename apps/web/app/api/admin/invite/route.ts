import { NextResponse } from "next/server";
import { prisma } from "@kinderz/db";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    // 1. Verify the requester is an ADMIN (Simplified for now, add auth check later)
    const { email, role, provinceId, districtId, ecdCenterId } = await req.json();

    // 2. Rule 2: Check if Provincdial already exists for this province
    if (role === "PROVINCIAL" && provinceId) {
      const existing = await prisma.user.findFirst({
        where: { provinceId, role: "PROVINCIAL", isActive: true },
      });
      if (existing) {
        return NextResponse.json({ error: "Province already has a Provincial account." }, { status: 400 });
      }
    }

    // 3. Rule 2: Check if Auditor already exists for this district
    if (role === "AUDITOR" && districtId) {
      const existing = await prisma.user.findFirst({
        where: { districtId, role: "AUDITOR", isActive: true },
      });
      if (existing) {
        return NextResponse.json({ error: "District already has an Auditor account." }, { status: 400 });
      }
    }

    // 4. Rule 3: Check if Supervisor already exists for this Center
    if (role === "SUPERVISOR" && ecdCenterId) {
       const existing = await prisma.user.findFirst({
        where: { ecdCenterId, role: "SUPERVISOR", isActive: true },
      });
      if (existing) {
        return NextResponse.json({ error: "Center already has a Supervisor account." }, { status: 400 });
      }
    }

    // 5. Generate unique token
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // 6. Save invite
    await prisma.invite.create({
      data: {
        email,
        role,
        provinceId,
        districtId,
        ecdCenterId,
        token,
        expiresAt,
      },
    });

    return NextResponse.json({ message: "Invite generated successfully", token });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to process invite" }, { status: 500 });
  }
}