import { getSession } from "@/lib/get-session";
import ReportList from "@/components/ReportList";

// Auditors' view lists the reports they need to audit for their province.
// Status shows SUBMITTED (awaiting audit) or REVIEWED (audited).

export default async function AuditorReportsPage() {
  const session = await getSession();
  if (!session || session.user.role !== "AUDITOR") {
    return <p className="p-8">Access denied</p>;
  }

  // In a real implementation we'd fetch reports from an API endpoint here.
  // For now render placeholder list of IDs.
  const dummy: { id: string; year: number; month: number; status: string }[] = [
    { id: "abc", year: 2026, month: 1, status: "SUBMITTED" },
    { id: "def", year: 2026, month: 2, status: "REVIEWED" },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auditor - Reports to Review</h1>
      <ReportList reports={dummy} />
    </div>
  );
}
