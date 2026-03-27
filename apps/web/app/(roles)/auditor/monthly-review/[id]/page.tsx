import { prisma } from "@kinderz/db";
import { notFound } from "next/navigation";
import { getMonthName } from "@/lib/report-utils";
import { updateMonthlyReportStatus } from "./actions";
import { DocumentList } from "./components/DocumentList";
import { FinancialCalculator } from "./components/FinancialCalculator";
import { SubmitButtons } from "./components/SubmitButtons";
import { AlertCircle, Users } from "lucide-react"; // Import for icons

export default async function MonthlyAuditPage({ params }: { params: { id: string } }) {
  const report = await prisma.monthlyReport.findUnique({
    where: { id: params.id },
    include: { 
      ecdCenter: {
        include: { children: { where: { funded: true } } } // Fetch total funded children
      }, 
      auditFindings: true,
      documents: true 
    }
  });

  if (!report) notFound();

  // Logic: Compare verified attendance (childrenFunded) with total registered learners
  const totalRegistered = report.ecdCenter.children.length;
  const verifiedFunded = report.childrenFunded || 0;
  const attendanceDrop = totalRegistered > 0 ? (verifiedFunded / totalRegistered) < 0.8 : false;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Review: {getMonthName(report.month)} {report.year}
          </h1>
          <p className="text-slate-500">{report.ecdCenter.name}</p>
        </div>
        <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-black uppercase">
          {report.status}
        </div>
      </div>

      {/* NEW: Attendance Verification Alert */}
      {attendanceDrop && (
        <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-4 items-center">
          <AlertCircle className="h-6 w-6 text-amber-600" />
          <div>
            <p className="text-sm font-bold text-amber-900">Low Attendance Detected</p>
            <p className="text-xs text-amber-700">
              Only {verifiedFunded} out of {totalRegistered} children met the 80% attendance threshold this month.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Verified Learners</span>
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <p className="text-xl font-black text-slate-800">{verifiedFunded}</p>
                </div>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Spent</span>
                <p className="text-xl font-black text-slate-800">R{report.totalExpenditure?.toString()}</p>
            </div>
          </div>

          <section className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Evidence Documents</h3>
            <DocumentList documents={report.documents} />
          </section>
        </div>

        <aside>
          <form action={updateMonthlyReportStatus} className="space-y-4">
            <input type="hidden" name="reportId" value={report.id} />
            
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4">Financial Review</h3>
              
              <FinancialCalculator 
                initialSalaries={Number(report.salariesExpense || 0)} 
                initialFood={Number(report.foodExpense || 0)} 
                initialOverheads={Number(report.overheadsExpense || 0)} 
              />

              <div className="mt-6 pt-6 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Audit Note</label>
                <textarea 
                  name="note" 
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm mb-4 outline-none focus:ring-2 focus:ring-blue-500" 
                  rows={3} 
                  placeholder="Provide feedback to the supervisor..."
                />
                <SubmitButtons />
              </div>
            </div>
          </form>
        </aside>
      </div>
    </div>
  );
}