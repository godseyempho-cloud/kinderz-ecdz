import { auth } from "@/lib/betterAuth";
import { prisma } from "@kinderz/db";
import { NextResponse } from "next/server";
import { monthlyReportSchema } from "@/lib/validations/monthly-report";
import { compileQuarterlyData } from "@/lib/services/reports";

export async function POST(request: Request) {
  // 1. Authenticate the Supervisor
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session || session.user.role !== "SUPERVISOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // 2. Validate the input data
    const json = await request.json();
    const body = monthlyReportSchema.parse(json);

    // 3. Logic: Check if a report for this month already exists
    const existing = await prisma.monthlyReport.findUnique({
      where: {
        ecdCenterId_year_month: {
          ecdCenterId: session.user.ecdCenterId!,
          year: body.year,
          month: body.month,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Report already exists for this month" }, { status: 400 });
    }

    // 4. Calculate total expenditure on the fly
    const totalExpenditure = 
      body.salariesExpense + body.foodExpense + body.overheadsExpense ; 
    // 5. Save to Database
    const report = await prisma.monthlyReport.create({
      data: {
        ...body,
        totalExpenditure,
        ecdCenterId: session.user.ecdCenterId!,
        submittedById: session.user.id,
      },
    });

    // 4. Trigger compile if status is SUBMITTED immediately
    if (report.status === "SUBMITTED") {
      await compileQuarterlyData(report.ecdCenterId, report.year, report.month);
    }

    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json({ error: "Invalid data submitted" }, { status: 400 });
  }
}


export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  
  // 1. Security Check
  if (!session || session.user.role !== "SUPERVISOR" || !session.user.ecdCenterId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());

    // 2. Fetch all reports for the center for the selected year
    const reports = await prisma.monthlyReport.findMany({
      where: {
        ecdCenterId: session.user.ecdCenterId,
        year: year,
      },
      orderBy: {
        month: 'asc'
      },
      select: {
        id: true,
        month: true,
        year: true,
        status: true,
        totalExpenditure: true,
        submittedAt: true,
        // We include these for the summary cards on the dashboard
        salariesExpense: true,
        foodExpense: true,
        overheadsExpense: true,
      }
    });

    // 3. Optional: Add "Missing" months to the response so the UI knows what to show as "Not Started"
    const monthsPresent = reports.map(r => r.month);
    const dashboardData = Array.from({ length: 12 }, (_, i) => {
      const monthNum = i + 1;
      const existingReport = reports.find(r => r.month === monthNum);
      
      return existingReport || { 
        month: monthNum, 
        status: "NOT_STARTED", 
        totalExpenditure: 0 
      };
    });

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Dashboard Fetch Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}



