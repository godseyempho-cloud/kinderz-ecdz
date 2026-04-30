import { prisma } from "@kinderz/db";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { requireSession, requireRole, errorResponse } from "@/lib/api-guards";

export async function POST(req: Request) {
  try {
    // SECURITY UPGRADE: Only real Admins can generate these links
    const session = await requireSession();
    requireRole(session, ["ADMIN"]);

    const formData = await req.formData();
    const email = (formData.get("email") as string).toLowerCase().trim();
    const provinceId = formData.get("provinceId") as string;

    const token = randomBytes(32).toString('hex');

    await prisma.invite.create({
      data: {
        email,
        token,
        role: "PROVINCIAL",
        provinceId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const successUrl = new URL(`/admin/invites/success`, req.url);
    successUrl.searchParams.set("token", token);
    successUrl.searchParams.set("email", email); 
    
    return NextResponse.redirect(successUrl); 
  } catch (err) {
    return errorResponse(err);
  }
}