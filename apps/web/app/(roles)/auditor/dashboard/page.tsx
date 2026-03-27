import { prisma } from "@kinderz/db";
import { requireSession, requireRole } from "@/lib/api-guards";
import { getMonthsForQuarter, getMonthName, getCalendarYearForMonth } from "@/lib/report-utils";
import Link from "next/link"; 

export default async function AuditorDashboard({ 
    searchParams 
}: { 
    searchParams: { q?: string } 
}) {
    const session = await requireSession();
    requireRole(session, ["AUDITOR"]); 

    if (!session.user.districtId) {
        return <div className="p-8 text-red-600 font-bold">Error: Auditor account is not assigned to a District.</div>;
    }

    // 1. Resolve which Quarter to show (Default to Q1)
    const selectedQuarter = Number(searchParams.q) || 1;
    const fiscalYear = new Date().getFullYear();
    
    // 2. Apply April-start Logic
    const activeMonths = getMonthsForQuarter(selectedQuarter);
    const calendarYear = getCalendarYearForMonth(fiscalYear, selectedQuarter);

    // 3. Fetch Centers and their specific reports for this Quarter
    const centers = await prisma.ecdCenter.findMany({
        where: { districtId: session.user.districtId },
        include: {
            monthlyReports: {
                where: { 
                    year: calendarYear,
                    month: { in: activeMonths }
                },
                orderBy: { month: 'asc' }
            }
        }
    });

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 uppercase tracking-tight">
                        District Oversight
                    </h1>
                    <p className="text-slate-500 font-medium">
                        District: <span className="text-blue-600">{session.user.districtId}</span> | 
                        Fiscal {fiscalYear}
                    </p>
                </div>

                {/* Quarter Switcher */}
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                    {[1, 2, 3, 4].map((q) => (
                        <Link
                            key={q}
                            href={`?q=${q}`}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                                selectedQuarter === q 
                                ? "bg-white text-blue-600 shadow-sm" 
                                : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            Q{q}
                        </Link>
                    ))}
                </div>
            </header>
            
            <div className="grid gap-4">
                {centers.map(center => (
                    <div key={center.id} className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-sm hover:shadow-md transition-shadow gap-4">
                        <div>
                            <h2 className="font-bold text-xl text-slate-800">{center.name}</h2>
                            <p className="text-sm font-mono text-slate-400">BAS: {center.basNumber || 'PENDING'}</p>
                        </div>

                        <div className="flex gap-2 w-full sm:w-auto">
                            {activeMonths.map((m: number) => {
                                const report = center.monthlyReports.find(r => r.month === m);
                                
                                let bgColor = "bg-slate-50 text-slate-300 border-slate-100"; 
                                if (report?.status === 'SUBMITTED') bgColor = "bg-blue-600 text-white border-blue-700";
                                if (report?.status === 'APPROVED') bgColor = "bg-emerald-500 text-white border-emerald-600";
                                if (report?.status === 'REVISION_REQUIRED') bgColor = "bg-amber-500 text-white border-amber-600";
                                if (report?.status === 'DRAFT') bgColor = "bg-slate-400 text-white border-slate-500";

                                return (
                                    <Link 
                                        key={m}
                                        href={report ? `/auditor/review/${report.id}` : '#'}
                                        className={`flex-1 sm:flex-none px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-tighter border shadow-sm transition-all hover:scale-105 active:scale-95 text-center ${bgColor} ${!report && 'cursor-not-allowed opacity-60'}`}
                                    >
                                        <div className="opacity-80 mb-0.5">{getMonthName(m)}</div>
                                        {report?.status || 'Missing'}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {centers.length === 0 && (
                <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-medium text-lg">No centers found in your assigned district.</p>
                </div>
            )} 
        </div> 
    ); 
}