import { prisma } from "@kinderz/db";
import { getSession } from "@/lib/get-session";
import { redirect, notFound } from "next/navigation";
import { FileSearch, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function AuditorVerifyPage({ params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session || session.user.role !== "AUDITOR") {
    redirect("/login");
  }

  const document = await prisma.document.findUnique({
    where: { id: params.id },
    include: {
      uploadedBy: true,
      monthlyReport: true, // Link to the report this document proves
    }
  });

  if (!document) notFound();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link 
        href={document.monthlyReportId ? `/auditor/monthly-review/${document.monthlyReportId}` : "/auditor/dashboard"}
        className="text-sm font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Review
      </Link>

      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <FileSearch className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{document.filename}</h1>
              <p className="text-xs text-slate-500 font-mono">Verified by District: {session.user.districtId}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
              {document.category}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3">
          {/* Left: Preview Area */}
          <div className="lg:col-span-2 p-6 border-r bg-slate-100">
            <div className="aspect-[1/1.4] bg-white rounded-lg shadow-lg border overflow-hidden">
              <iframe src={document.url} className="w-full h-full" />
            </div>
          </div>

          {/* Right: Audit Sidebar */}
          <div className="p-6 space-y-8">
            <section>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Report Context</h3>
              {document.monthlyReport ? (
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <p className="text-sm font-bold text-blue-900">
                    Period: {document.monthlyReport.month}/{document.monthlyReport.year}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    This document serves as proof for center expenditures.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <p className="text-xs font-bold text-amber-700 uppercase">Unlinked Document</p>
                </div>
              )}
            </section>

            <section className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Auditor Actions</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                If this document is blurry or incorrect, please flag it in the main Review page under "Notes."
              </p>
              
              <button className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all">
                <CheckCircle2 className="h-4 w-4" /> Mark as Verified
              </button>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}