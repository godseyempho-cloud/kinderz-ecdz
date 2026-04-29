"use server";

import { prisma } from "@kinderz/db";
import { auth } from "@/lib/betterAuth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

/**
 * Server Action to register a new ECD Center.
 * Adjusted to match the verified Prisma Model for EcdCenter.
 */
export async function createEcdCenter(data: {
  name: string;
  basNumber?: string;
  registrationLevel?: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // 1. Security Check: Only Auditors (or Admins) should be creating center records
  if (!session || (session.user.role !== "AUDITOR" && session.user.role !== "ADMIN")) {
    throw new Error("Unauthorized: You do not have permission to register centers.");
  }

  // 2. District Assignment: Use the Auditor's districtId from their session
  const districtId = session.user.districtId;

  if (!districtId) {
    return { 
      success: false, 
      error: "Your account is not assigned to a district. Please contact your administrator." 
    };
  }

  try {
    // 3. Database Insertion
    await prisma.ecdCenter.create({
      data: {
        name: data.name,
        basNumber: data.basNumber,
        registrationLevel: data.registrationLevel,
        districtId: districtId,
        // fundingStatus defaults to APPROVED per your model
      },
    });

    // 4. Cache Invalidation: Refresh the Auditor dashboard to show the new center
    revalidatePath("/auditor");
    
    return { success: true };
  } catch (error) {
    console.error("ECD Creation Error:", error);
    return { 
      success: false, 
      error: "An error occurred while saving the center. Ensure the BAS number is unique if applicable." 
    };
  }
}

/**
 * Optional: Fetch centers for the current Auditor's district
 */
export async function getDistrictCenters() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user.districtId) return [];

  return await prisma.ecdCenter.findMany({
    where: { districtId: session.user.districtId },
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { children: true, staff: true }
      }
    }
  });
}