import { auth } from "@/lib/betterAuth";
import { prisma } from "@kinderz/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const attendanceSchema = z.object({
  date: z.string(), 
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
  const ecdCenterId = user?.ecdCenterId;

  if (!session || !user || user.role !== "ECD_USER" || !ecdCenterId) {
    return NextResponse.json(
      { error: "Unauthorized: Access restricted to assigned center staff" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { date, records } = attendanceSchema.parse(body);
    const attendanceDate = new Date(date);

    // Optimized Security Check: Verify all children belong to this center
    const childIds = records.map(r => r.childId);
    const authorizedChildrenCount = await prisma.child.count({
      where: {
        id: { in: childIds },
        ecdCenterId: ecdCenterId
      }
    });

    if (authorizedChildrenCount !== records.length) {
      return NextResponse.json({ error: "Unauthorized: Some child records do not belong to your center" }, { status: 403 });
    }

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
            status: record.status,
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