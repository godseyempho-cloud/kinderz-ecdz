import { prisma } from "@kinderz/db";
import { getSession } from "@/lib/get-session";
import { redirect, notFound } from "next/navigation";
import { MessageSquareQuote, Send } from "lucide-react";

export default async function SupervisorRespondPage({ params }: { params: { id: string } }) {
    const session = await getSession();
    
    // Role Guard
    if (!session || session.user.role !== "SUPERVISOR") {
        redirect("/login");
    }

    const report = await prisma.monthlyReport.findUnique({
        where: { id: params.id },
        include: { 
            auditFindings: true // Ensure 'findings' matches your Prisma relation name
        }
    });

    if (!report) notFound();

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <header>
                <h1 className="text-2xl font-black text-slate-900">Resolve Audit Finding</h1>
                <p className="text-slate-500">Report Period: {report.month} {report.year}</p>
            </header>
            
            <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl">
                <div className="flex items-center gap-2 text-amber-800 mb-2">
                    <MessageSquareQuote size={20} />
                    <h2 className="font-bold">Auditor's Discrepancy Note</h2>
                </div>
                {/* Fallback text if no finding is found yet */}
                <p className="text-amber-900 italic bg-white/50 p-4 rounded-lg border border-amber-100">
                    {report.auditFindings?.[0]?.content || "Please review the financial discrepancy in your submission."}
</p>
            </div>

            <div className="bg-white border rounded-2xl p-8 shadow-sm"> 
                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Supervisor Response 
                        </label>
                        <textarea 
                            placeholder="Explain the discrepancy or provide details of the correction made..."
                            className="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 min-h-[150px]"
                        />
                    </div>
                    <button className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-xl font-bold hover:bg-blue-600 transition-all">
                        <Send size={18} /> Submit Response
                    </button>
                </form>
            </div>
        </div>
    );
}