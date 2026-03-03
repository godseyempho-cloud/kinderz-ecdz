import { getSession } from "@/lib/get-session";
import ReconciliationTable, { ReconciliationRow } from "@/components/ReconciliationTable";

// Auditor review page displays a submitted report and allows the auditor to
// compare their own figures, enter comments, and mark as reviewed. For now,
// the page shows the reconciliation table component with static data.

interface PageProps {
  params: { id: string };
}

export default async function AuditorReportPage({ params }: PageProps) {
  const session = await getSession();
  if (!session || session.user.role !== "AUDITOR") {
    return <p className="p-8">Access denied</p>;
  }

  const { id } = params;

  // placeholder static reconciliation data
  const rows: ReconciliationRow[] = [
    { label: "Allocation received", supervisorValue: 1000 },
    { label: "Attendance count", supervisorValue: 45 },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auditor Review of Report {id}</h1>
      <ReconciliationTable rows={rows} />
      <p className="mt-4">Audit comments and mark-as-reviewed form will go here.</p>
    </div>
  );
}
