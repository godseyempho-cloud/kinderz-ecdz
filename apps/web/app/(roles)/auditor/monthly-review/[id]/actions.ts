"use server";

import { prisma } from "@kinderz/db";
import { revalidatePath } from "next/cache";
import { SubmissionStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { redirect } from "next/navigation";

/**
 * Helper Logic: Calculates how many children met the 80% attendance threshold
 * for a specific monthly report period.
 */
async function calculateFundedChildren(reportId: string) {
  // Finds the specific month, year, and center associated with the audit report.
  const report = await prisma.monthlyReport.findUnique({
    where: { id: reportId },
    select: { month: true, year: true, ecdCenterId: true, days: true }
  });

  // If no report is found, it defaults to 0 to prevent calculation errors.
  if (!report) return 0;

  // Retrieves all children at this center who are marked as "funded" (eligible for subsidy).
  const children = await prisma.child.findMany({
    where: { ecdCenterId: report.ecdCenterId, funded: true }
  });

  let qualifyingChildren = 0;
  // The total days the center was operational for that specific month.
  const totalPossibleDays = report.days || 20; // Fallback to 20 if days not set

  for (const child of children) {
    // Queries the Attendance table for "PRESENT" marks for this specific child.
    const presentCount = await prisma.attendance.count({
      where: {
        childId: child.id,
        status: "PRESENT",
        // Ensures only attendance from the correct month and year is counted.
        date: {
          gte: new Date(report.year, report.month - 1, 1),
          lt: new Date(report.year, report.month, 1),
        }
      }
    });

    // Division: (Days Present / Total Operating Days)
    const attendanceRate = presentCount / totalPossibleDays;
    
    // The "80% Rule": If the child's rate is 0.8 or higher, they are added to the qualifying count.
    if (attendanceRate >= 0.8) {
      qualifyingChildren++;
    }
  }

  // Returns the final number of children who met the attendance requirement.
  return qualifyingChildren;
}

/**
 * Main Action: Updates the report status, performs financial calculations, 
 * and verifies attendance-based funding.
 */
export async function updateMonthlyReportStatus(formData: FormData) {
  // 1. Extract basic form data
  const reportId = formData.get("reportId") as string;
  const status = formData.get("status") as SubmissionStatus;
  const note = formData.get("note") as string;

  // 2. Grab financial values from the form (default to "0" if empty)
  const salaries = new Decimal((formData.get("salariesExpense") as string) || "0");
  const food = new Decimal((formData.get("foodExpense") as string) || "0");
  const overheads = new Decimal((formData.get("overheadsExpense") as string) || "0");
  const other = new Decimal((formData.get("otherExpense") as string) || "0");

  // 3. Auto-Calculate the Total Expenditure
  const calculatedTotal = salaries.plus(food).plus(overheads).plus(other);

  // 4. Run the 80% Attendance Verification Logic
  const fundedCount = await calculateFundedChildren(reportId);

  // 5. Update Database with all calculated results
  await prisma.monthlyReport.update({
    where: { id: reportId },
    data: {
      status,
      notes: note || undefined,
      salariesExpense: salaries,
      foodExpense: food,
      overheadsExpense: overheads,
      otherExpense: other,
      totalExpenditure: calculatedTotal,
      childrenFunded: fundedCount, // Records the answer to the 80% attendance question
    },
  });

  // 6. Handle Audit Findings if revision is required
  if (status === "REVISION_REQUIRED" && note) {
    await prisma.auditFinding.create({
      data: {
        reportId,
        content: note,
        severity: "MEDIUM",
        status: "OPEN",
        createdBy: "SYSTEM_AUDITOR", // In production, replace with actual user session ID
      },
    });
  }

  // 7. Refresh the UI and redirect if approved
  revalidatePath(`/auditor/monthly-review/${reportId}`);
  revalidatePath(`/auditor/dashboard`);

  if (status === "APPROVED") {
    redirect("/auditor/dashboard");
  }
}