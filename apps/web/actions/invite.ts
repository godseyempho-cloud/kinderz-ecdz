"use server";

import { prisma } from "@kinderz/db"; 
import { Role } from "@prisma/client";
import * as crypto from "node:crypto"; // Secure token generation
import { revalidatePath } from "next/cache";

export async function createInvite(data: {
  email: string;
  role: Role;
  provinceId?: string;
  districtId?: string;
}) {
  try {
    const emailLower = data.email.toLowerCase();

    // 1. Check if a User with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: emailLower }
    });
    if (existingUser) {
      return { success: false, error: "A user with this email already exists." };
    }

    // 2. Rule Enforcement: Check if District/Province already has an assigned role
    // This prevents double-assigning auditors to the same district (Rule 2)
    if (data.districtId && data.role === "AUDITOR") {
      const existingAuditor = await prisma.user.findFirst({
        where: { 
          districtId: data.districtId,
          role: "AUDITOR" 
        }
      });
      if (existingAuditor) {
        return { success: false, error: "This district already has an assigned Auditor." };
      }
    }

    // 3. Generate a secure random token
    const token = crypto.randomBytes(32).toString("hex");
    
    // 4. Set expiry to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // 5. Create the invite record
    // We use 'upsert' or delete existing pending invites for the same email 
    // to keep the database clean
    await prisma.invite.deleteMany({
      where: { email: emailLower }
    });

    const invite = await prisma.invite.create({
      data: {
        email: emailLower,
        role: data.role,
        provinceId: data.provinceId || null,
        districtId: data.districtId || null,
        token: token,
        expiresAt: expiresAt,
      },
    });

    // 6. Construct Link 
    // Uses the Environment variable for the domain (e.g., tinyiko.com or localhost)
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/register?token=${token}`;

    // 7. Refresh the UI
    // This ensures the District Card instantly shows 'Pending' or updates the list
    revalidatePath("/provincial/districts"); 
    
    // In a real production app, you would call an email service here (e.g., Resend)
    // For now, we return the link so you can manually copy/paste it for testing
    return { success: true, link: inviteLink };

  } catch (error) {
    console.error("Invite Error:", error);
    return { success: false, error: "Failed to create invite. Please try again." };
  }
} 