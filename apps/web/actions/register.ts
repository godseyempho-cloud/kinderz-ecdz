"use server";

import { prisma } from "@kinderz/db";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";

// Explicitly define the response type to fix the TypeScript error
export type RegisterActionResponse = {
  success?: boolean;
  error?: string;
};

export async function registerAuditor(formData: FormData): Promise<RegisterActionResponse> {
  try {
    const name = formData.get("name") as string;
    const password = formData.get("password") as string;
    const token = formData.get("token") as string;

    if (!name || !password || !token) {
      return { error: "All fields are required." };
    }

    // 1. Validate Invite
    const invite = await prisma.invite.findUnique({
      where: { token, used: false },
    });

    if (!invite || invite.expiresAt < new Date()) {
      return { error: "Invalid or expired invitation token." };
    }

    // 2. Hash Password
    const hashedPassword = await hash(password, 12);

    // 3. Transaction to ensure data integrity
    await prisma.$transaction(async (tx) => {
      // Create User
      const user = await tx.user.create({
        data: {
          email: invite.email.toLowerCase(),
          name: name,
          password: hashedPassword, // Store in User model for credentials
          role: invite.role,
          provinceId: invite.provinceId,
          districtId: invite.districtId,
          ecdCenterId: invite.ecdCenterId,
          isActive: true,
          emailVerified: true, // Mark as verified since they used an invite link
        },
      });

      // Create Account record for Better-Auth
      await tx.account.create({
        data: {
          userId: user.id,
          accountId: user.id, 
          providerId: "credential",
          password: hashedPassword,
        },
      });

      // Burn the invite
      await tx.invite.update({
        where: { id: invite.id },
        data: { used: true },
      });
    });

    revalidatePath("/provincial/districts");
    return { success: true };

  } catch (error: any) {
    console.error("Registration Error:", error);
    if (error.code === 'P2002') {
      return { error: "A user with this role is already assigned to this area." };
    }
    return { error: "Failed to create account. Please try again." };
  }
}