import PaymentVerificationList from "@/components/auditor/PaymentVerificationList";
import { prisma } from "@kinderz/db";

export default async function ReviewReportPage({ params }: { params: { monthId: string } }) {
  const report = await prisma.monthlyReport.findUnique({
    where: { id: params.monthId },
    include: { ecdCenter: true, documents: true }
  });

  return (
    <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
      <section>
        <h1 className="text-xl font-bold mb-4">Review: {report?.ecdCenter.name}</h1>
        {/* Component to show Income vs Expense figures */}
        <div className="bg-white p-6 shadow rounded">
            <h2 className="font-semibold border-b pb-2">Reported Figures</h2>
<p>Monthly Allocation: R {report?.allocation.toString()}</p> 
<p>Total Expenditure: R {report?.totalExpenditure.toString()}</p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-lg font-bold">Evidence & Findings</h2>
        <PaymentVerificationList documents={report?.documents || []} />
        
        {/* The Comment Box - This will hit the POST /finding route we created earlier */}
        <div className="bg-blue-50 p-6 rounded border border-blue-200">
           <h3 className="font-bold mb-2">Audit Finding</h3>
           <textarea className="w-full p-2 border rounded" placeholder="Add audit comments..." />
           <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded">Submit Finding</button>
        </div>
      </section>
    </div>
  );
}