import { prisma } from "@kinderz/db";
import { getSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { FindingsList } from "@/components/supervisor/findings-list";

export default async function SupervisorDashboardPage() {
  const session = await getSession();

  if (!session?.user || session.user.role !== "SUPERVISOR") {
    redirect("/auth/login");
  }

  const centerId = session.user.ecdCenterId;
  if (!centerId) {
    return <div className="p-8 text-red-500 font-bold">Error: No ECD Center assigned.</div>;
  }

  // Use the robust filtering from Option 1
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
      <header className="mb-10 border-b pb-6">
        <h1 className="text-3xl font-bold text-gray-900">Supervisor Dashboard</h1>
        <p className="text-gray-500">Center: <span className="text-blue-600 font-medium">{centerId}</span></p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-semibold">Outstanding Findings</h2>
            {findings.length > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {findings.length}
              </span>
            )}
          </div>
          
          {/* Use the interactive component here */}
          <FindingsList initialFindings={findings} />
        </div>

        <aside className="space-y-6">
          <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl">
            <h3 className="font-bold text-blue-900 mb-2">Audit Insight</h3>
            <p className="text-sm text-blue-800 leading-relaxed">
              These issues are preventing your reports from being marked as <strong>Approved</strong>. 
              Once resolved, they will be sent back to the Auditor for final sign-off.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}