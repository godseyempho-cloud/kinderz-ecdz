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
    // also load center to verify funding status
    const center = await prisma.ecdCenter.findUnique({ where: { id: ecdCenterId } });
    if (!center) {
      throw new ApiError(404, "ECD center not found");
    }
    if (center.fundingStatus === "DISCONTINUED") {
      throw new ApiError(403, "Center is closed");
    }
    requireCenterAccess(session, ecdCenterId);

    // OPTIONAL: prevent ECD_USERs from calling via desktop/web client by checking user-agent
    if (session.user.role === "ECD_USER") {
      const ua = req.headers.get("user-agent") || "";
      const isWeb = /Mozilla|Chrome|Safari/i.test(ua);
      if (isWeb) {
        throw new ApiError(403, "ECD users must use mobile app");
      }
    }

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

    // 6. Create report in DRAFT status, allowing supervisor to edit before final submission
    // status: "DRAFT" means the supervisor can still modify this report.
    // When they click "Submit", the status moves to "SUBMITTED" and locks further edits.
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
        status: "DRAFT", // New reports start in DRAFT; supervisor can edit freely
        // submittedAt remains null until the supervisor explicitly submits (status -> SUBMITTED)
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
