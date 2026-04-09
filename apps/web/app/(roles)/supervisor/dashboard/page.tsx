import { prisma } from "@kinderz/db";
import { getSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { FindingsList } from "@/components/supervisor/findings-list";
import { AlertCircle, UploadCloud } from "lucide-react"; // Standardizing on Lucide icons

export default async function SupervisorDashboardPage() {
  const session = await getSession();

  // 1. Strict Security: Enforce role-based access
  if (!session?.user || session.user.role !== "SUPERVISOR") {
    redirect("/auth/login");
  }

  const centerId = session.user.ecdCenterId;

  // 2. Data Safety: Handle missing center assignments gracefully
  if (!centerId) {
    return (
      <div className="p-8 flex items-center gap-3 text-red-600 bg-red-50 rounded-xl border border-red-100">
        <AlertCircle className="h-5 w-5" />
        <span className="font-bold">Account Configuration Error: No ECD Center assigned to your profile.</span>
      </div>
    );
  }

  // 3. Robust Data Fetching: Capture all relevant finding states
  const findings = await prisma.auditFinding.findMany({
    where: {
      report: { ecdCenterId: centerId },
      status: {
        in: ["OPEN", "CORRECTIONS_REQUIRED", "DISPUTED"]
      }
    },
    include: {
      report: {
        select: { month: true, year: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-10 border-b pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Supervisor Dashboard</h1>
          <p className="text-slate-500 font-medium mt-1">
            Managing Center ID: <span className="text-blue-600 font-mono">{centerId}</span>
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-800">Outstanding Findings</h2>
            {findings.length > 0 && (
              <span className="bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-full animate-pulse">
                {findings.length}
              </span>
            )}
          </div>
          
          <FindingsList initialFindings={findings} />
        </div>

        <aside className="space-y-6">
          {/* Action Card: Direct link to evidence uploads */}
          <div className="bg-white border-2 border-slate-100 p-6 rounded-2xl shadow-sm">
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-blue-600">
              <UploadCloud className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Evidence Submission</h3>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Upload monthly bank statements and invoices to resolve pending findings.
            </p>
            <a 
              href="/supervisor/upload" 
              className="block w-full text-center bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors"
            >
              Go to Uploads
            </a>
          </div>

          {/* Context Card: Explainer */}
          <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl">
            <h3 className="font-bold text-blue-900 mb-2 text-sm uppercase tracking-wider">Audit Insight</h3>
            <p className="text-xs text-blue-800 leading-relaxed font-medium">
              Findings listed here prevent your reports from being <strong>Approved</strong>. 
              Review the messages, update your documents, and the Auditor will be notified to re-verify.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}