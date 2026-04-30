"use server";

import { prisma } from "@kinderz/db";
import { revalidatePath } from "next/cache";
import { SubmissionStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/get-session"; 

/**
 * Calculates how many funded children met the 80% attendance threshold.
 * Note: Per project requirements, "Seen" (Present or Half-Day) counts as attendance.
 */
async function calculateFundedChildren(reportId: string) {
  const report = await prisma.monthlyReport.findUnique({
    where: { id: reportId },
    select: { month: true, year: true, ecdCenterId: true, days: true }
  });

  if (!report) return 0;

  const children = await prisma.child.findMany({
    where: { ecdCenterId: report.ecdCenterId, funded: true }
  });

  let qualifyingChildren = 0;
  const totalPossibleDays = report.days || 20; // Fallback to 20 business days

  for (const child of children) {
    const presentCount = await prisma.attendance.count({
      where: {
        childId: child.id,
        // Requirement: Being seen on location (Present/Half-Day) counts.
        status: { in: ["PRESENT", "HALF_DAY"] }, 
        date: {
          gte: new Date(report.year, report.month - 1, 1),
          lt: new Date(report.year, report.month, 1),
        }
      }
    });

    if ((presentCount / totalPossibleDays) >= 0.8) {
      qualifyingChildren++;
    }
  }
  return qualifyingChildren;
}

/**
 * Main Action: Finalizes the audit, calculates financials using high-precision math,
 * and creates audit findings if revision is required.
 */
export async function updateMonthlyReportStatus(formData: FormData) {
  const session = await getSession();
  
  // Strict Role Check: Only Auditors can perform this action.
  if (!session?.user || session.user.role !== "AUDITOR") {
    throw new Error("Unauthorized: Only auditors can update report status.");
  }

  const reportId = formData.get("reportId") as string;
  const status = formData.get("status") as SubmissionStatus;
  const note = formData.get("note") as string;

  // Financial values use Decimal to avoid JS floating-point errors (e.g., 0.1 + 0.2)
  const salaries = new Decimal((formData.get("salariesExpense") as string) || "0");
  const food = new Decimal((formData.get("foodExpense") as string) || "0");
  const overheads = new Decimal((formData.get("overheadsExpense") as string) || "0");
  const other = new Decimal((formData.get("otherExpense") as string) || "0");
  
  const calculatedTotal = salaries.plus(food).plus(overheads).plus(other);
  const fundedCount = await calculateFundedChildren(reportId);

  // Transaction ensures the report and findings are updated together.
  await prisma.$transaction(async (tx) => {
    await tx.monthlyReport.update({
      where: { id: reportId },
      data: {
        status,
        notes: note || undefined,
        salariesExpense: salaries,
        foodExpense: food,
        overheadsExpense: overheads,
        otherExpense: other,
        totalExpenditure: calculatedTotal,
        childrenFunded: fundedCount,
      },
    });

    // Create a finding only if the Auditor manually flags for revision.
    if (status === "REVISION_REQUIRED" && note) {
      await tx.auditFinding.create({
        data: {
          reportId,
          content: note,
          severity: "MEDIUM", 
          status: "OPEN",
          createdBy: session.user.id,
        },
      });
    }
  });

  revalidatePath(`/auditor/monthly-review/${reportId}`);
  revalidatePath(`/auditor/dashboard`);

  // Redirect only on successful approval to keep user at dashboard.
  if (status === "APPROVED") {
    redirect("/auditor/dashboard");
  }
}