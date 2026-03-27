// apps/web/app/(roles)/auditor/review/[id]/actions.ts
"use server";

import { prisma } from "@kinderz/db";
import { revalidatePath } from "next/cache";
// Import the actual Enum type from Prisma for type safety
import { SubmissionStatus } from "@prisma/client"; 

/**
 * Updates a Quarterly Report status and records the audit timestamp.
 * @param reportId - The UUID/CUID of the QuarterlyReport
 * @param status - Must be 'APPROVED' or 'REJECTED'
 */
export async function generateQuarterlyReport(
  reportId: string, 
  status: "APPROVED" | "REJECTED"
) {
  try {
    // 1. Map the string input to the official Prisma Enum
    // This prevents runtime errors if the DB expects a specific case
    const updateStatus: SubmissionStatus = status === "APPROVED" 
      ? SubmissionStatus.APPROVED 
      : SubmissionStatus.REVISION_REQUIRED; // Or REJECTED if you add it to schema

    // 2. Update the quarterlyReport model
    await prisma.quarterlyReport.update({
      where: { id: reportId },
      data: { 
        status: updateStatus,
        // Using submittedAt as the "Finalized" date for the report
        submittedAt: new Date(), 
        updatedAt: new Date(),
      },
    });

    // 3. Clear the cache for the review page so the UI updates immediately
    revalidatePath(`/auditor/review/${reportId}`);
    
    return { success: true };
  } catch (error) {
    // Log the error specifically for the Quarterly model to help debugging
    console.error("Prisma Error updating QuarterlyReport:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Database update failed" 
    };
  }
}