import { prisma } from "@kinderz/db";
import { notFound } from "next/navigation";
import { getMonthName } from "@/lib/report-utils";
import { updateMonthlyReportStatus } from "./actions";
import { FinancialCalculator } from "./components/FinancialCalculator";  
import { SubmitButtons } from "./components/SubmitButtons";
import { AuditViewWrapper } from "./components/AuditViewWrapper";
import { AlertCircle, Users, Landmark } from "lucide-react";

export default async function MonthlyAuditPage({ params }: { params: { monthId: string } }) {
  const report = await prisma.monthlyReport.findUnique({
    where: { id: params.monthId },  
    include: { 
      ecdCenter: {
        include: { children: { where: { funded: true } } }  
      }, 
      documents: true 
    }
  });

  if (!report) notFound();

  const totalRegistered = report.ecdCenter.children.length;
  const verifiedFunded = report.childrenFunded || 0;
  const attendanceDrop = totalRegistered > 0 ? (verifiedFunded / totalRegistered) < 0.8 : false;

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Review: {getMonthName(report.month)} {report.year}
          </h1>
          <p className="text-slate-500 font-medium">{report.ecdCenter.name}</p>
        </div>
        <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider">
          {report.status}
        </div>
      </div>

      {/* Conditional Alert */}
      {attendanceDrop && (
        <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-4 items-center">
          <AlertCircle className="h-6 w-6 text-amber-600" />
          <div>
            <p className="text-sm font-bold text-amber-900">Low Attendance Alert</p>
            <p className="text-xs text-amber-700">
              Only {verifiedFunded} out of {totalRegistered} children met the 80% threshold.
            </p>
          </div>
        </div>
      )}

      {/* The Wrapper handles the Split-Screen State */}
      <AuditViewWrapper documents={report.documents}>
        <div className="space-y-8">
          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Verified Learners</span>
                <div className="flex items-center gap-2 mt-1">
                    <Users className="h-5 w-5 text-blue-500" />
                    <p className="text-2xl font-black text-slate-800">{verifiedFunded}</p>
                </div>
            </div>
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Center Allocation</span>
                <div className="flex items-center gap-2 mt-1">
                    <Landmark className="h-5 w-5 text-emerald-500" />
                    <p className="text-2xl font-black text-slate-800">R{report.allocation?.toString()}</p>
                </div>
            </div>
          </div>

          {/* Verification & Financial Form */}
          <aside>
            <form action={updateMonthlyReportStatus} className="space-y-4">
              <input type="hidden" name="reportId" value={report.id} />
              
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm border-t-4 border-t-blue-600">
                <h3 className="font-bold text-slate-800 mb-6">Financial Reconciliation</h3>
                
                <FinancialCalculator 
                  initialSalaries={Number(report.salariesExpense || 0)} 
                  initialFood={Number(report.foodExpense || 0)} 
                  initialOverheads={Number(report.overheadsExpense || 0)} 
                  allocatedBudget={Number(report.allocation || 0)}
                />

                <div className="mt-8 pt-6 border-t border-slate-100">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 text-left">Internal Audit Note</label>
                  <textarea 
                    name="note" 
                    className="w-full border border-slate-200 rounded-xl p-4 text-sm mb-4 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50" 
                    rows={4}   
                    placeholder="Note discrepancies or justification for findings..."
                  />
                  <SubmitButtons />  
                </div>
              </div>
            </form>
          </aside>
        </div>
      </AuditViewWrapper>
    </div>
  );
}