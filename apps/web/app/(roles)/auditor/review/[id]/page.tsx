import { prisma } from "@kinderz/db";
import { getMonthsForQuarter, getMonthName, getCalendarYearForMonth } from "@/lib/report-utils";
import { QuarterlyGenerator } from "./components/QuarterlyGenerator";
import { notFound } from "next/navigation";

export default async function ReviewPage({ params }: { params: { id: string } }) {
    // 1. Fetch the specific quarterly report being reviewed
    const report = await prisma.quarterlyReport.findUnique({
        where: { id: params.id },
        include: { 
            ecdCenter: {
                include: {
                    monthlyReports: true 
                }
            }
        }
    });

    if (!report) notFound();

    // 2. Use the April-start logic from our new utility
    const requiredMonths = getMonthsForQuarter(report.quarter);
    const targetCalendarYear = getCalendarYearForMonth(report.year, report.quarter);

    // 3. Filter for the 3 months that belong to this specific fiscal quarter
    const relevantMonthlyReports = report.ecdCenter.monthlyReports.filter(
        (m) => requiredMonths.includes(m.month) && m.year === targetCalendarYear
    );

    const allMonthsCleared = relevantMonthlyReports.length === 3 && 
        relevantMonthlyReports.every((m) => m.status === "APPROVED");
 
    return (
        <div className="p-8 max-w-5xl mx-auto">
            <header className="mb-8 border-b pb-6">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    Review: Q{report.quarter} Fiscal {report.year}
                </h1>
                <p className="text-slate-500 font-medium mt-1">
                    Center: <span className="text-blue-600">{report.ecdCenter.name}</span>
                </p>
            </header>
            
            <section className="mb-10">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                    Monthly Compliance Status
                </h3>
                <div className="flex gap-6">
                    {requiredMonths.map((monthNum: number) => {
                        const mReport = relevantMonthlyReports.find(r => r.month === monthNum);
                        const isApproved = mReport?.status === "APPROVED";

                        return (
                            <div key={monthNum} className="flex flex-col items-center gap-3 group">
                                <div 
                                    className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-sm font-black shadow-md transition-all ${
                                        isApproved ? "bg-emerald-500 rotate-3" : "bg-slate-200"
                                    }`}
                                >
                                    {getMonthName(monthNum)}
                                </div>
                                <div className="text-center">
                                    <span className={`text-[10px] px-2 py-1 rounded-md uppercase font-black border ${
                                        isApproved 
                                            ? "border-emerald-200 text-emerald-700 bg-emerald-50" 
                                            : "border-slate-200 text-slate-500 bg-slate-50"
                                    }`}>
                                        {mReport ? mReport.status : "MISSING"}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {allMonthsCleared ? (
                <div className="animate-in fade-in zoom-in duration-500">
                    <div className="p-6 border-2 border-emerald-100 bg-emerald-50 rounded-2xl mb-6 flex items-center gap-4">
                        <div className="bg-emerald-500 text-white p-2 rounded-full">✅</div>
                        <p className="text-emerald-900 font-medium">
                            <strong>Compliance Verified.</strong> All monthly reports are approved. You can now finalize the quarterly payout statement.
                        </p>
                    </div>
                    <QuarterlyGenerator submissionId={report.id} />
                </div>
            ) : (
                <div className="p-6 border-2 border-dashed border-amber-200 bg-amber-50 rounded-2xl">
                    <h4 className="text-amber-900 font-bold mb-1">Quarterly Lock Active</h4>
                    <p className="text-sm text-amber-800 opacity-90">
                        The <strong>QuarterlyGenerator</strong> is disabled because some monthly reports are either missing or not yet approved. 
                        Please ensure all months ({requiredMonths.map(m => getMonthName(m)).join(", ")}) are cleared by the center.
                    </p>
                </div>
            )}
        </div>
    );
}