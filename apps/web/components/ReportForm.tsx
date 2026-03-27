"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Updated interface to match your Prisma model fields
interface MonthlyReportData {
  month: number;
  year: number;
  days: number;           // Changed from daysOpen to match Prisma @default(22)
  allocation: number;
  foodExpense: number;
  salariesExpense: number;
  overheadsExpense: number;
  attendanceCount: number; // Added: required by your Prisma model
  childrenFunded: number;  // Added: required by your Prisma model
  notes: string;
}

export default function ReportForm({ ecdCenterId }: { ecdCenterId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [bankChargesConfirmed, setBankChargesConfirmed] = useState(false);

  // Initialize with all required fields for the Tinyiko MVP
  const [formData, setFormData] = useState<MonthlyReportData>({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    days: 22,
    allocation: 21120.0, // Hardcoded for MVP as discussed in the To-Do list
    foodExpense: 0,
    salariesExpense: 0,
    overheadsExpense: 0,
    attendanceCount: 0,
    childrenFunded: 0,
    notes: "",
  });

  const totalExpenditure = 
    Number(formData.foodExpense) + 
    Number(formData.salariesExpense) + 
    Number(formData.overheadsExpense);

  const variance = formData.allocation - totalExpenditure;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankChargesConfirmed) {
      alert("Please confirm that Bank Charges are included in the Overheads.");
      return;
    }
    
    setLoading(true);
    try {
      // Corrected API path to match your route.ts location
      const response = await fetch("/api/monthly-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Passing ecdCenterId and totalExpenditure as required by the API
        body: JSON.stringify({ 
          ...formData, 
          totalExpenditure, 
          ecdCenterId 
        }),
      });

      if (response.ok) {
        router.push("/dashboard/reports");
        router.refresh();
      } else {
        const err = await response.text();
        alert(`Error: ${err}`);
      }
    } catch (error) {
      console.error("Submission failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-6 text-blue-900 border-b pb-2 uppercase tracking-wide">
        Monthly Budget & Expenditure Report
      </h2>

      {/* Header Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div>
          <label className="block text-xs font-bold mb-1 uppercase text-gray-500">Reporting Month</label>
          <select 
            className="w-full p-2 border rounded bg-gray-50 font-medium"
            value={formData.month}
            onChange={(e) => setFormData({...formData, month: parseInt(e.target.value)})}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold mb-1 uppercase text-gray-500">Operating Days</label>
          <input 
            type="number" 
            className="w-full p-2 border rounded font-medium"
            value={formData.days}
            onChange={(e) => setFormData({...formData, days: parseInt(e.target.value)})}
          />
        </div>
        {/* NEW: Operational Stats required by Prisma */}
        <div>
          <label className="block text-xs font-bold mb-1 uppercase text-gray-500">Children Funded</label>
          <input 
            type="number" 
            className="w-full p-2 border rounded font-medium"
            value={formData.childrenFunded}
            onChange={(e) => setFormData({...formData, childrenFunded: parseInt(e.target.value)})}
          />
        </div>
      </div>

      {/* Expenditure Table */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100 text-left text-xs uppercase text-gray-600">
              <th className="border p-3">Category</th>
              <th className="border p-3">Monthly Allocation (R)</th>
              <th className="border p-3">Actual Expenditure (R)</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            <tr>
              <td className="border p-3 font-semibold">Food / Nutrition</td>
              <td className="border p-3 bg-gray-50 italic text-gray-500">8,448.00</td>
              <td className="border p-3">
                <input 
                  type="number" 
                  step="0.01"
                  className="w-full p-1 outline-none focus:ring-1 focus:ring-blue-400 font-mono"
                  placeholder="0.00"
                  onChange={(e) => setFormData({...formData, foodExpense: parseFloat(e.target.value) || 0})}
                />
              </td>
            </tr>
            <tr>
              <td className="border p-3 font-semibold">Salaries / Stipends</td>
              <td className="border p-3 bg-gray-50 italic text-gray-500">8,448.00</td>
              <td className="border p-3">
                <input 
                  type="number" 
                  step="0.01"
                  className="w-full p-1 outline-none focus:ring-1 focus:ring-blue-400 font-mono"
                  placeholder="0.00"
                  onChange={(e) => setFormData({...formData, salariesExpense: parseFloat(e.target.value) || 0})}
                />
              </td>
            </tr>
            <tr className={!bankChargesConfirmed && formData.overheadsExpense > 0 ? "bg-yellow-50" : ""}>
              <td className="border p-3 font-semibold">
                Overheads
                <span className="block text-[9px] text-blue-600 uppercase font-bold mt-1">
                  * Must include Bank Charges
                </span>
              </td>
              <td className="border p-3 bg-gray-50 italic text-gray-500">4,224.00</td>
              <td className="border p-3">
                <input 
                  type="number" 
                  step="0.01"
                  className="w-full p-1 outline-none focus:ring-1 focus:ring-blue-400 font-mono"
                  placeholder="0.00"
                  onChange={(e) => setFormData({...formData, overheadsExpense: parseFloat(e.target.value) || 0})}
                />
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="bg-blue-900 text-white font-bold text-base">
              <td className="border p-3 text-right pr-6" colSpan={2}>TOTAL EXPENDITURE</td>
              <td className="border p-3 font-mono">R {totalExpenditure.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
           <label className="block text-xs font-bold mb-1 uppercase text-gray-500">Actual Attendance (Monthly Total)</label>
           <input 
            type="number" 
            className="w-full p-2 border rounded font-medium"
            placeholder="e.g. 450"
            value={formData.attendanceCount}
            onChange={(e) => setFormData({...formData, attendanceCount: parseInt(e.target.value) || 0})}
          />
        </div>
        <div>
           <label className="block text-xs font-bold mb-1 uppercase text-gray-500">Unspent / Variance</label>
           <div className={`p-2 border rounded font-mono font-bold ${variance < 0 ? 'text-red-600 bg-red-50' : 'text-blue-900 bg-gray-50'}`}>
              R {variance.toFixed(2)}
           </div>
        </div>
      </div>

      {/* Notes Field */}
      <div className="mb-6">
        <label className="block text-xs font-bold mb-1 uppercase text-gray-500">Comments / Notes</label>
        <textarea 
          className="w-full p-2 border rounded text-sm min-h-[80px]"
          placeholder="Add any specific details regarding variances or issues..."
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
        />
      </div>

      {/* Bank Charge Confirmation */}
      <div className={`p-4 rounded border-2 transition-all ${bankChargesConfirmed ? 'border-green-200 bg-green-50' : 'border-yellow-300 bg-yellow-50'}`}>
        <label className="flex items-start space-x-3 cursor-pointer">
          <input 
            type="checkbox" 
            className="w-5 h-5 mt-1 rounded border-gray-300 text-blue-900 focus:ring-blue-900"
            checked={bankChargesConfirmed}
            onChange={(e) => setBankChargesConfirmed(e.target.checked)}
          />
          <span className="text-sm font-semibold text-gray-800 leading-tight">
            I confirm that the total for Overheads includes all <span className="underline decoration-red-500">Bank Charges</span> as shown on the center's bank statement for this month.
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading || !bankChargesConfirmed}
        className="mt-8 w-full bg-blue-900 text-white font-bold py-4 rounded-lg hover:bg-blue-800 transition shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {loading ? "Syncing with Tinyiko..." : "Submit Monthly Report"}
      </button>
      
      {!bankChargesConfirmed && (
        <p className="text-center text-[11px] text-red-500 mt-3 font-bold uppercase tracking-tighter">
          Validation Error: Bank charge confirmation is mandatory.
        </p>
      )}
    </form>
  );
}