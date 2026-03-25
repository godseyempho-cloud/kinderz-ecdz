import { auth } from "@/lib/betterAuth";
import { prisma } from "@kinderz/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const attendanceSchema = z.object({
  date: z.string(), // "YYYY-MM-DD"
  records: z.array(
    z.object({
      childId: z.string(),
      status: z.enum(["PRESENT", "ABSENT", "SICK"]),
      notes: z.string().optional(),
    })
  ),
});

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  const user = session?.user;
  const role = user?.role;
  const ecdCenterId = user?.ecdCenterId;

  // Strict Role Check - Ensure session exists and user is assigned to a center
  if (!session || !user || role !== "ECD_USER" || !ecdCenterId) {
    return NextResponse.json(
      { error: "Unauthorized: Only ECD Users can mark attendance" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { date, records } = attendanceSchema.parse(body);
    
    // Ensure the date is handled as a UTC midnight date to avoid timezone shifts
    const attendanceDate = new Date(date);

    const results = await prisma.$transaction(
      records.map((record) =>
        prisma.attendance.upsert({
          where: {
            childId_date: {
              childId: record.childId,
              date: attendanceDate,
            },
          },
          update: {
            status: record.status, // Directly saving the string enum
            notes: record.notes ?? "",
            markedById: user.id,
          },
          create: {
            childId: record.childId,
            date: attendanceDate,
            status: record.status,
            notes: record.notes ?? "",
            ecdCenterId: ecdCenterId,
            markedById: user.id,
          },
        })
      )
    );

    return NextResponse.json({ success: true, count: results.length });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Attendance Sync Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}