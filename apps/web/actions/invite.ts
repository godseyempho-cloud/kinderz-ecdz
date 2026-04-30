"use server";

import { prisma } from "@kinderz/db"; 
import { Role } from "@prisma/client";
import * as crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/betterAuth"; // Add this
import { headers } from "next/headers"; // Add this

export async function createInvite(data: {
  email: string;
  role: Role;
  provinceId?: string;
  districtId?: string;
}) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    
    // 1. Auth Guard: Must be logged in
    if (!session) return { success: false, error: "Unauthorized" };

    const inviterRole = session.user.role;
    const inviterProvinceId = session.user.provinceId;

    // 2. Permission Matrix: Prevent illegal invitations
    // Rule: Only Admin can invite Provincials
    if (data.role === "PROVINCIAL" && inviterRole !== "ADMIN") {
      return { success: false, error: "Only Admins can invite Provincial Heads." };
    }

    // Rule: Provincial users can ONLY invite to their own Province
    if (inviterRole === "PROVINCIAL") {
      // If they try to invite an Auditor, verify the district belongs to their province
      if (data.districtId) {
        const targetDistrict = await prisma.district.findUnique({
          where: { id: data.districtId },
          select: { provinceId: true }
        });

        if (targetDistrict?.provinceId !== inviterProvinceId) {
          return { success: false, error: "You cannot invite an auditor to a district outside your province." };
        }
      }
    }

    const emailLower = data.email.toLowerCase().trim();

    // 3. Existing User Check
    const existingUser = await prisma.user.findUnique({ where: { email: emailLower } });
    if (existingUser) return { success: false, error: "User already exists." };

    // 4. One Auditor Per District Rule
    if (data.districtId && data.role === "AUDITOR") {
      const existingAuditor = await prisma.user.findFirst({
        where: { districtId: data.districtId, role: "AUDITOR" }
      });
      if (existingAuditor) return { success: false, error: "District already has an Auditor." };
    }

    // 5. Token & Invite Creation
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Clean up old invites for this email
    await prisma.invite.deleteMany({ where: { email: emailLower } });

    await prisma.invite.create({
      data: {
        email: emailLower,
        role: data.role,
        provinceId: data.provinceId || null,
        districtId: data.districtId || null,
        token: token,
        expiresAt: expiresAt,
      },
    });

    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/register/${token}`; // Note: added /[token] path

    revalidatePath("/provincial"); 
    
    return { success: true, link: inviteLink };

  } catch (error) {
    console.error("Invite Error:", error);
    return { success: false, error: "Server error during invitation." };
  }
}