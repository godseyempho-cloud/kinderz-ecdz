import { auth } from "@/lib/betterAuth";
import { prisma } from "@kinderz/db";
import { NextResponse } from "next/server";
import { monthlyReportSchema } from "@/lib/validations/monthly-report";
import { compileQuarterlyData } from "@/lib/services/reports";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session || session.user.role !== "SUPERVISOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const json = await request.json();
    // Partial validation so they can save incomplete drafts
    const body = monthlyReportSchema.partial().parse(json);

    // 1. Calculate total expenditure from the 3 core categories
    const totalExpenditure = 
      (body.salariesExpense || 0) + 
      (body.foodExpense || 0) + 
      (body.overheadsExpense || 0);

    // 2. Update the monthly record
    const updatedReport = await prisma.monthlyReport.update({
      where: { 
        id: params.id,
        ecdCenterId: session.user.ecdCenterId! // Security: ensure they own this record
      },
      data: {
        ...body,
        totalExpenditure,
      },
    });

    // 3. Trigger Quarterly Sync only if this month is now SUBMITTED
    if (updatedReport.status === "SUBMITTED") {
      await compileQuarterlyData(
        updatedReport.ecdCenterId, 
        updatedReport.year, 
        updatedReport.month
      );
    }

    return NextResponse.json(updatedReport);
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
}