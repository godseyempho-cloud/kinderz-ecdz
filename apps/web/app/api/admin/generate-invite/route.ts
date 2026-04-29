import { prisma } from "@kinderz/db";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const email = formData.get("email") as string;
    const provinceId = formData.get("provinceId") as string;

    // 1. Generate a cryptographically secure random token (64-character hex string)
    const token = randomBytes(32).toString('hex');

    // 2. Create the Invite Record in the database
    // This establishes the link between the token, the province, and the future Provincial role.
    await prisma.invite.create({
      data: {
        email,
        token,
        role: "PROVINCIAL",
        provinceId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Token expires in 7 days
      },
    });

    // 3. Construct the success URL with search params for the UI to display
    const successUrl = new URL(`/admin/invites/success`, req.url);
    successUrl.searchParams.set("token", token);
    successUrl.searchParams.set("email", email); 
    
    return NextResponse.redirect(successUrl); 
  } catch (error) {
    // Log the actual error to the console for debugging
    console.error("Invite Generation Error:", error);

    // If P2002 Unique Constraint error occurs (Email already has an invite)
    return NextResponse.json(
      { error: "A pending invite already exists for this email or province." }, 
      { status: 400 }
    ); 
  }
}    