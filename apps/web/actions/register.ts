"use server";

import { prisma } from "@kinderz/db";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";

export type RegisterActionResponse = {
  success?: boolean;
  error?: string;
};

export async function registerUser(formData: FormData): Promise<RegisterActionResponse> {
  try {
    const name = formData.get("name") as string;
    const password = formData.get("password") as string;
    const token = formData.get("token") as string;

    if (!name || !password || !token) {
      return { error: "All fields are required." };
    }

    const invite = await prisma.invite.findUnique({
      where: { token, used: false },
    });

    if (!invite || (invite.expiresAt && invite.expiresAt < new Date())) {
      return { error: "Invalid or expired invitation token." };
    }

    const hashedPassword = await hash(password, 12);

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: invite.email.toLowerCase().trim(),
          name: name,
          password: hashedPassword, 
          role: invite.role,
          provinceId: invite.provinceId,
          districtId: invite.districtId,
          ecdCenterId: invite.ecdCenterId,
          isActive: true,
          emailVerified: true, 
        },
      });

      await tx.account.create({
        data: {
          userId: user.id,
          accountId: user.id, 
          providerId: "credential",
          password: hashedPassword,
        },
      });

      await tx.invite.update({
        where: { id: invite.id },
        data: { used: true },
      });
    });

    revalidatePath("/");
    return { success: true };

  } catch (error: any) {
    console.error("Registration Error:", error);
    if (error.code === 'P2002') {
      return { error: "This email or role assignment is already taken." };
    }
    return { error: "Failed to create account. Please try again." };
  }
}