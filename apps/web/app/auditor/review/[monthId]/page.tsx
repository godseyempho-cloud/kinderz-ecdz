import { prisma } from "@kinderz/db";
import { requireSession, requireRole } from "@/lib/api-guards";
import PaymentVerificationList from "@/components/auditor/PaymentVerificationList";
import { redirect } from "next/navigation";

export default async function ReviewMonthPage({ params }: { params: { monthId: string } }) {
    const session = await requireSession();
    requireRole(session, ["AUDITOR"]);

    const report = await prisma.monthlyReport.findUnique({
        where: { id: params.monthId },
        include: { 
            ecdCenter: true, 
            documents: true,
            // Include findings to show previous comments
            // Note: reportId is unique in AuditFinding
        }
    });

    if (!report) redirect("/auditor/reports");

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold">{report.ecdCenter.name}</h1>
                    <p className="text-gray-500">Review for Month {report.month}, {report.year}</p>
                </div>
                <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-sm font-medium">
                    Status: {report.status}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Financial Summary */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <h2 className="text-lg font-semibold mb-4">Reported Financials</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded">
                                <p className="text-sm text-gray-500">Total Allocation</p>
                                <p className="text-xl font-bold text-green-600">R {report.allocation.toString()}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded">
                                <p className="text-sm text-gray-500">Total Expenditure</p>
                                <p className="text-xl font-bold text-red-600">R {report.totalExpenditure.toString()}</p>
                            </div>
                        </div>
                    </div>
                    
                    <PaymentVerificationList documents={report.documents} />
                </div>

                {/* Audit Actions Sidebar */}
                <div className="space-y-6">
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                        <h3 className="font-bold text-blue-900 mb-4">Submit Audit Finding</h3>
                        <form className="space-y-4">
                            <textarea 
                                className="w-full p-3 border rounded-lg text-sm" 
                                rows={5}
                                placeholder="Detail any discrepancies or required corrections..."
                            />
                            <select className="w-full p-2 border rounded-lg text-sm bg-white">
                                <option value="APPROVED">Approve Report</option>
                                <option value="FLAGGED">Flag for Review</option>
                                <option value="CORRECTIONS_REQUIRED">Request Corrections</option>
                            </select>
                            <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition">
                                Save Finding
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}