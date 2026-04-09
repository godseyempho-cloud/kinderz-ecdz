import { getSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import ReportForm from "@/components/ReportForm";
import { FilePlus, AlertTriangle } from "lucide-react";

export default async function CreateReportPage() {
  const session = await getSession();

  // Guard: Strictly Supervisor/ECD_USER
  if (!session || (session.user.role !== "SUPERVISOR" && session.user.role !== "ECD_USER")) {
    redirect("/login");
  }

  const centerId = session.user.ecdCenterId;
   
  if (!centerId) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-xl flex gap-3 text-red-800">
        <AlertTriangle />
        <div>
          <h2 className="font-bold">Account Error</h2>
          <p className="text-sm">No ECD center is assigned to this account. Please contact your Admin.</p>
        </div>
      </div>
    );
  }   

  return ( 
    <div className="max-w-3xl mx-auto space-y-6"> 
      <div className="flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg text-white">
          <FilePlus size={24} />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Submit Monthly Report</h1>
      </div>
      
      <div className="bg-white border rounded-2xl p-8 shadow-sm">
        <ReportForm ecdCenterId={centerId} />
      </div>
    </div> 
  );
}