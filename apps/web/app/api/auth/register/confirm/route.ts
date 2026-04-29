import { NextResponse } from "next/server";
import { prisma } from "@kinderz/db";
import { hash } from "bcryptjs";

export async function POST(req: Request) {  
  try {   
    const body = await req.json();
    const { password, name, token, email, role, provinceId, districtId, ecdCenterId } = body;

    const hashedPassword = await hash(password, 12);

    await prisma.$transaction(async (tx) => {
      // 1. Create the User with all jurisdictional IDs
      const user = await tx.user.create({
        data: {
          email,
          name,
          role,
          provinceId,
          districtId,   // Consuming districtId here
          ecdCenterId,
          isActive: true,
          emailVerified: true,
        },
      });

      // 2. Create the Account for Credential login
      await tx.account.create({
        data: {
          userId: user.id,
          providerId: "credential",
          accountId: email,
          password: hashedPassword,
        },
      });

      // 3. Mark the invite as used
      await tx.invite.update({
        where: { token },
        data: { used: true },
      });
    }); 

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { error: "Account creation failed. Please contact support." }, 
      { status: 500 }                                
    );
  } 
}