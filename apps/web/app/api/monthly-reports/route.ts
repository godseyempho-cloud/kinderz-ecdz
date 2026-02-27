import { prisma } from "@kinderz/db";
import type { DocumentCategory } from "@prisma/client";
import {
  requireSession,
  requireRole,
  requireCenterAccess,
  errorResponse,
  ApiError,
} from "@/lib/api-guards";

// Input types used for validation and clarity
// category is narrowed to the Prisma-generated enum
// Amount/date are also typed appropriately
// We'll still validate on receipt to protect against bad JSON.

type AllocationInput = {
  category: DocumentCategory;
  amount: number | string;
  date: string; // ISO date string
};

export async function POST(req: Request) {
  try {
    // 1. Authentication & authorization
    const session = await requireSession();
    requireRole(session, ["SUPERVISOR", "ECD_USER"]);

    // 2. Parse payload
    const body = await req.json();
    const {
      year,
      month,
      ecdCenterId,
      allocation,
      salariesExpense = 0,
      foodExpense = 0,
      overheadsExpense = 0,
      otherExpense = 0,
      // we don't trust the incoming JSON, so coerce into the correct type
      allocations: rawAllocations,
      attendanceCount,
      childrenFunded,
      notes,
      signatureUrl,
    } = body; 

    const allocations: AllocationInput[] = Array.isArray(rawAllocations)
      ? // perform basic runtime check on each element
        rawAllocations.map((a) => {
          // ensure category is one of the enum values, otherwise default to OTHER
          const cat = a.category as DocumentCategory;
          const allowed: DocumentCategory[] = [
            "FOOD",
            "SALARIES",
            "OVERHEADS",
            "BANK_STATEMENT",
            "FINANCIAL_REPORT",
            "AFFIDAVIT",
            "OTHER",
          ];
          return {
            category: allowed.includes(cat) ? cat : "OTHER",
            amount: a.amount,
            date: a.date,
          };
        })
      : [];

    // 3. Basic validation
    if (
      year === undefined ||
      month === undefined ||
      !ecdCenterId ||
      allocation === undefined
    ) {
      throw new ApiError(400, "Missing required fields");
    }
    if (month < 1 || month > 12) {
      throw new ApiError(400, "Month must be between 1 and 12");
    }

    // 4. Enforce center-level access
    requireCenterAccess(session, ecdCenterId);

    // 5. Compute totals and perform server-side sanity checks
    // const totalExpenditure = allocations.reduce(
    //   (sum: number, a: AllocationInput) => sum + parseFloat(String(a.amount)),
    //   0
    // );

    // 5. Compute totals and perform server-side sanity checks
const totalExpenditure = allocations.reduce(
  (sum: number, a: AllocationInput) => sum + parseFloat(String(a.amount)),
  0
);

    // 6. Persist to database
    const report = await prisma.monthlyReport.create({
      data: {
        year,
        month,
        ecdCenterId,
        submittedById: session.user.id,
        allocation: allocation.toString(),
        totalExpenditure: totalExpenditure.toString(),
        salariesExpense: salariesExpense?.toString(),
        foodExpense: foodExpense?.toString(),
        overheadsExpense: overheadsExpense?.toString(),
        otherExpense: otherExpense?.toString(),
        attendanceCount,
        childrenFunded,
        notes,
        signatureUrl,
        submittedAt: new Date(),
        allocations: {
          create: allocations.map((a: AllocationInput) => ({
            category: a.category,
            amount: a.amount.toString(),
            date: new Date(a.date),
          })),
        },
      },
    });

    return new Response(JSON.stringify(report), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
