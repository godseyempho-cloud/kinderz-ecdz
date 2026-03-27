// import { prisma } from "@kinderz/db";
// import type { DocumentCategory } from "@prisma/client";
// import {
//   requireSession,
//   requireRole,
//   requireCenterAccess,
//   errorResponse,
//   ApiError,
// } from "@/lib/api-guards";

// // Input types used for validation and clarity
// // category is narrowed to the Prisma-generated enum
// // Amount/date are also typed appropriately
// // We'll still validate on receipt to protect against bad JSON.

// type AllocationInput = {
//   category: DocumentCategory;
//   amount: number | string;
//   date: string; // ISO date string
// };

// export async function POST(req: Request) {
//   try {
//     // 1. Authentication & authorization
//     const session = await requireSession();
//     requireRole(session, ["SUPERVISOR", "ECD_USER"]);

//     // 2. Parse payload
//     const body = await req.json();
//     const {
//       year,
//       month,
//       ecdCenterId,
//       allocation,
//       salariesExpense = 0,
//       foodExpense = 0,
//       overheadsExpense = 0,
//       otherExpense = 0,
//       // we don't trust the incoming JSON, so coerce into the correct type
//       allocations: rawAllocations,
//       attendanceCount,
//       childrenFunded,
//       notes,
//       signatureUrl,
//     } = body; 

//     const allocations: AllocationInput[] = Array.isArray(rawAllocations)
//       ? // perform basic runtime check on each element
//         rawAllocations.map((a) => {
//           // ensure category is one of the enum values, otherwise default to OTHER
//           const cat = a.category as DocumentCategory;
//           const allowed: DocumentCategory[] = [
//             "FOOD",
//             "SALARIES",
//             "OVERHEADS",
//             "BANK_STATEMENT",
//             "FINANCIAL_REPORT",
//             "AFFIDAVIT",
//             "OTHER",
//           ];
//           return {
//             category: allowed.includes(cat) ? cat : "OTHER",
//             amount: a.amount,
//             date: a.date,
//           };
//         })
//       : [];

//     // 3. Basic validation
//     if (
//       year === undefined ||
//       month === undefined ||
//       !ecdCenterId ||
//       allocation === undefined
//     ) {
//       throw new ApiError(400, "Missing required fields");
//     }
//     if (month < 1 || month > 12) {
//       throw new ApiError(400, "Month must be between 1 and 12");
//     }

//     // 4. Enforce center-level access
//     // also load center to verify funding status
//     const center = await prisma.ecdCenter.findUnique({ where: { id: ecdCenterId } });
//     if (!center) {
//       throw new ApiError(404, "ECD center not found");
//     }
//     if (center.fundingStatus === "DISCONTINUED") {
//       throw new ApiError(403, "Center is closed");
//     }
//     requireCenterAccess(session, ecdCenterId);

//     // OPTIONAL: prevent ECD_USERs from calling via desktop/web client by checking user-agent
//     if (session.user.role === "ECD_USER") {
//       const ua = req.headers.get("user-agent") || "";
//       const isWeb = /Mozilla|Chrome|Safari/i.test(ua);
//       if (isWeb) {
//         throw new ApiError(403, "ECD users must use mobile app");
//       }
//     }

//     // 5. Compute totals and perform server-side sanity checks
//     // const totalExpenditure = allocations.reduce(
//     //   (sum: number, a: AllocationInput) => sum + parseFloat(String(a.amount)),
//     //   0
//     // );

//     // 5. Compute totals and perform server-side sanity checks
// const totalExpenditure = allocations.reduce(
//   (sum: number, a: AllocationInput) => sum + parseFloat(String(a.amount)),
//   0
// );

//     // 6. Create report in DRAFT status, allowing supervisor to edit before final submission
//     // status: "DRAFT" means the supervisor can still modify this report.
//     // When they click "Submit", the status moves to "SUBMITTED" and locks further edits.
//     const report = await prisma.monthlyReport.create({
//       data: {
//         year,
//         month,
//         ecdCenterId,
//         submittedById: session.user.id,
//         allocation: allocation.toString(),
//         totalExpenditure: totalExpenditure.toString(),
//         salariesExpense: salariesExpense?.toString(),
//         foodExpense: foodExpense?.toString(),
//         overheadsExpense: overheadsExpense?.toString(),
//         otherExpense: otherExpense?.toString(),
//         attendanceCount,
//         childrenFunded,
//         notes,
//         signatureUrl,
//         status: "DRAFT", // New reports start in DRAFT; supervisor can edit freely
//         // submittedAt remains null until the supervisor explicitly submits (status -> SUBMITTED)
//         allocations: {
//           create: allocations.map((a: AllocationInput) => ({
//             category: a.category,
//             amount: a.amount.toString(),
//             date: new Date(a.date),
//           })),
//         },
//       },
//     });

//     return new Response(JSON.stringify(report), {
//       status: 201,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (error) {
//     return errorResponse(error);
//   }
// }







// second file; 
// export async function POST(req: Request) {
//   try {
//     const session = await getSession();

//     // 1. Guard: Check Authentication & Role
//     if (!session || session.user.role !== "SUPERVISOR") {
//       return new NextResponse("Unauthorized: Only supervisors can submit reports.", { status: 401 });
//     }

//     // 2. Parse & Validate Body
//     const body = await req.json();
//     const validation = monthlyReportSchema.safeParse(body);

//     if (!validation.success) {
//       return NextResponse.json({ 
//         error: "Invalid report data", 
//         details: validation.error.format() 
//       }, { status: 400 });
//     }

//     const data = validation.data;
//     const { centerId, totalExpenditure } = body; // These are extra fields from your form

//     if (!centerId) {
//       return new NextResponse("Center ID is required", { status: 400 });
//     }

//     // 3. Database Operation
//     // We use an upsert or create depending on if a report for this month already exists
//     const report = await prisma.monthlyReport.create({
//       data: {
//         centerId,
//         year: data.year,
//         month: data.month,
//         daysOpen: data.days,
        
//         // Expenses
//         salariesExpense: data.salariesExpense,
//         foodExpense: data.foodExpense,
//         overheadsExpense: data.overheadsExpense,
        
//         // Metadata
//         status: data.status || "SUBMITTED",
//         notes: data.notes || "",
        
//         // Storing the calculated total for quick audit views
//         totalExpenses: totalExpenditure,
        
//         // Tracking who created it
//         createdBy: session.user.id,
//       },
//     });

//     return NextResponse.json(report, { status: 201 });
//   } catch (error: any) {
//     console.error("[MONTHLY_REPORT_POST]", error);
    
//     // Check for unique constraint (e.g., if a report for this month/year already exists)
//     if (error.code === 'P2002') {
//       return new NextResponse("A report for this month and year already exists.", { status: 409 });
//     }

//     return new NextResponse("Internal Server Error", { status: 500 });
//   }
// }






import { NextResponse } from "next/server";
import { prisma } from "@kinderz/db";
import { monthlyReportSchema } from "@/lib/validations/monthly-report";
import { 
  requireSession, 
  requireRole, 
  requireCenterAccess, 
  errorResponse, 
  ApiError 
} from "@/lib/api-guards";

export async function POST(req: Request) {
  try {
    // 1. High-Security Guards (From File 1)
    const session = await requireSession();
    requireRole(session, ["SUPERVISOR", "ECD_USER"]);

    // 2. Schema Validation (From File 2)
    const body = await req.json();
    const validation = monthlyReportSchema.safeParse(body);

    if (!validation.success) {
      throw new ApiError(400, "Invalid data structure");
    }

    const data = validation.data;
    const { ecdCenterId, totalExpenditure } = body;

    // 3. Center Access Check (Crucial for South African NPO compliance)
    const center = await prisma.ecdCenter.findUnique({ where: { id: ecdCenterId } });
    if (!center || center.fundingStatus === "DISCONTINUED") {
      throw new ApiError(403, "Center is inactive or not found");
    }
    requireCenterAccess(session, ecdCenterId);

    // 4. Create as DRAFT (Allows supervisor to fix mistakes)
    const report = await prisma.monthlyReport.create({
      data: {
        ecdCenterId,
        year: data.year,
        month: data.month,
        days: data.days,
        salariesExpense: data.salariesExpense.toString(),
        foodExpense: data.foodExpense.toString(),
        overheadsExpense: data.overheadsExpense.toString(),
        totalExpenditure: totalExpenditure.toString(),
        allocation: body.allocation, // From the form or fetched
        status: "DRAFT", 
        submittedById: session.user.id,

        attendanceCount: data.attendanceCount,
        childrenFunded: data.childrenFunded,
        notes: data.notes,
    



      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    // Uses your helper from File 1 to keep responses consistent
    return errorResponse(error);
  }
}





