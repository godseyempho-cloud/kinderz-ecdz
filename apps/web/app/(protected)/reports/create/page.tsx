import { getSession } from "@/lib/get-session";
import ReportForm from "@/components/ReportForm";

// The supervisor submission page is only accessible to authenticated supervisors/ECD users.
// It renders a simple form that posts to /api/monthly-reports via fetch.

export default async function CreateReportPage() {
  const session = await getSession();
  if (!session || (session.user.role !== "SUPERVISOR" && session.user.role !== "ECD_USER")) {
    // In a real app we might redirect but server component cannot redirect inside async
    return <p className="p-8">Access denied</p>;
  } 

  const centerId = session.user.ecdCenterId;
   
  if (!centerId) {
    return <p className="p-8">Error: No ECD center assigned to this account</p>;
  }   

  return (
    <div className="p-8"> 
      <h1 className="text-2xl font-bold mb-4">Submit Monthly Report</h1>
      <ReportForm centerId={centerId} />
    </div>
  );
}

