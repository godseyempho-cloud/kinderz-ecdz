import { prisma } from "@kinderz/db";
import { requireSession, requireRole } from "@/lib/api-guards";
import { redirect } from "next/navigation";

export default async function SupervisorRespondPage({ params }: { params: { id: string } }) {
    const session = await requireSession();
    requireRole(session, ["SUPERVISOR"]);

    const report = await prisma.monthlyReport.findUnique({
        where: { id: params.id },
        include: { 
            // AuditFinding relation name in your schema for Quarterly is findings
            // If you added a relation to MonthlyReport, use that here.
        }
    });

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-2">Respond to Audit Findings</h1>
            <p className="text-gray-600 mb-6">Your report has been flagged. Please provide an explanation or update the figures.</p>
            
            <div className="bg-red-50 border border-red-200 p-4 rounded mb-6">
                <h2 className="font-bold text-red-800">Auditor's Comment:</h2>
                {/* Dynamically pull the latest audit finding comment here */}
                <p className="text-red-700 mt-1 italic">"Discrepancy in food expenses vs receipts provided."</p>
            </div>

            <form className="space-y-4">
                <label className="block">
                    <span className="text-gray-700 font-medium">Your Explanation:</span>
                    <textarea className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" rows={4} />
                </label>
                <button className="bg-blue-600 text-white px-6 py-2 rounded font-bold">
                    Submit Response
                </button>
            </form>
        </div>
    );
}