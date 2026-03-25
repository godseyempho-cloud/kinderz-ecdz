// import { prisma } from "@kinderz/db";

// export async function compileQuarterlyData(centerId: string, year: number, month: number) {
//   const quarter = Math.ceil(month / 3);
//   const startMonth = (quarter - 1) * 3 + 1;
//   const monthsInQuarter = [startMonth, startMonth + 1, startMonth + 2];

//   // 1. Fetch all 3 monthly reports for this specific quarter
//   const months = await prisma.monthlyReport.findMany({
//     where: {
//       ecdCenterId: centerId,
//       year: year,
//       month: { in: monthsInQuarter },
//       status: "SUBMITTED"
//     }
//   });

//   // 2. Only proceed to compile if the Supervisor has submitted all 3 months
//   if (months.length === 3) {
//     // Sum up the key totals for the Auditor
//     const totalExpenses = months.reduce((acc, m) => acc + Number(m.totalExpenditure), 0);
    
//     // We also want to sum up or average the attendance for the Auditor's high-level view
//     const totalAttendance = months.reduce((acc, m) => acc + (m.attendanceCount || 0), 0);

//     return await prisma.quarterlyReport.upsert({
//       where: {
//         ecdCenterId_year_quarter: {
//           ecdCenterId: centerId,
//           year: year,
//           quarter: quarter,
//         }
//       },
//       update: { 
//         totalExpenses, 
//         status: "SUBMITTED",
//         notes: `Auto-compiled from months: ${monthsInQuarter.join(", ")}`
//       },
//       create: {
//         ecdCenterId: centerId,
//         year,
//         quarter,
//         totalExpenses,
//         status: "SUBMITTED",
//         createdById: months[0].submittedById, // Crediting the original supervisor
//       }
//     });
//   }
  
//   return null; // Not ready for compilation yet
// }



import { prisma } from "@kinderz/db";

export async function compileQuarterlyData(centerId: string, year: number, month: number) {
  // Map months to SA Financial Quarters (Month 4 = April = Q1)
  const quarterMap: Record<number, { q: number; months: number[] }> = {
    4: { q: 1, months: [4, 5, 6] }, 5: { q: 1, months: [4, 5, 6] }, 6: { q: 1, months: [4, 5, 6] },
    7: { q: 2, months: [7, 8, 9] }, 8: { q: 2, months: [7, 8, 9] }, 9: { q: 2, months: [7, 8, 9] },
    10: { q: 3, months: [10, 11, 12] }, 11: { q: 3, months: [10, 11, 12] }, 12: { q: 3, months: [10, 11, 12] },
    1: { q: 4, months: [1, 2, 3] }, 2: { q: 4, months: [1, 2, 3] }, 3: { q: 4, months: [1, 2, 3] },
  };

  const { q: quarter, months: monthsInQuarter } = quarterMap[month];

  const months = await prisma.monthlyReport.findMany({
    where: {
      ecdCenterId: centerId,
      year: year,
      month: { in: monthsInQuarter },
      status: "SUBMITTED"
    }
  });

  if (months.length === 3) {
    const totalExpenses = months.reduce((acc, m) => acc + Number(m.totalExpenditure), 0);
    
    return await prisma.quarterlyReport.upsert({
      where: {
        ecdCenterId_year_quarter: { ecdCenterId: centerId, year, quarter }
      },
      update: { totalExpenses, status: "SUBMITTED" },
      create: {
        ecdCenterId: centerId,
        year,
        quarter,
        totalExpenses,
        status: "SUBMITTED",
        createdById: months[0].submittedById
      }
    });
  }
  return null;
}