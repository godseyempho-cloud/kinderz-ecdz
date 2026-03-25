"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface MonthlyReportData {
  month: number;
  year: number;
  days: number;
  allocation: number;
  foodExpense: number;
  salariesExpense: number;
  overheadsExpense: number;
}

export default function ReportForm({ centerId }: { centerId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // New state to track if the supervisor confirmed bank charges
  const [bankChargesConfirmed, setBankChargesConfirmed] = useState(false);

  const [formData, setFormData] = useState<MonthlyReportData>({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    days: 22,
    allocation: 21120.0, 
    foodExpense: 0,
    salariesExpense: 0,
    overheadsExpense: 0,
  });

  // Calculate totals and variances
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
      const response = await fetch("/api/reports/monthly", {
        method: "POST",
        body: JSON.stringify({ ...formData, totalExpenditure, centerId }),
      });

      if (response.ok) {
        router.push("/dashboard/reports");
        router.refresh();
      }
    } catch (error) {
      console.error("Submission failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-6 text-blue-900 border-b pb-2">
        Monthly Budget & Expenditure Report
      </h2>

      {/* Header Info */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div>
          <label className="block text-sm font-semibold mb-1">Reporting Month</label>
          <select 
            className="w-full p-2 border rounded bg-gray-50"
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
          <label className="block text-sm font-semibold mb-1">Operating Days</label>
          <input 
            type="number" 
            className="w-full p-2 border rounded"
            value={formData.days}
            onChange={(e) => setFormData({...formData, days: parseInt(e.target.value)})}
          />
        </div>
      </div>

      {/* Expenditure Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100 text-left text-sm">
              <th className="border p-3">Category</th>
              <th className="border p-3">Monthly Allocation (R)</th>
              <th className="border p-3">Actual Expenditure (R)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-3 font-medium">Food / Nutrition</td>
              <td className="border p-3 bg-gray-50 italic text-gray-600">8,448.00</td>
              <td className="border p-3">
                <input 
                  type="number" 
                  step="0.01"
                  className="w-full p-1 outline-none focus:ring-1 focus:ring-blue-400"
                  placeholder="0.00"
                  onChange={(e) => setFormData({...formData, foodExpense: parseFloat(e.target.value) || 0})}
                />
              </td>
            </tr>
            <tr>
              <td className="border p-3 font-medium">Salaries / Stipends</td>
              <td className="border p-3 bg-gray-50 italic text-gray-600">8,448.00</td>
              <td className="border p-3">
                <input 
                  type="number" 
                  step="0.01"
                  className="w-full p-1 outline-none focus:ring-1 focus:ring-blue-400"
                  placeholder="0.00"
                  onChange={(e) => setFormData({...formData, salariesExpense: parseFloat(e.target.value) || 0})}
                />
              </td>
            </tr>
            <tr className={!bankChargesConfirmed && formData.overheadsExpense > 0 ? "bg-yellow-50" : ""}>
              <td className="border p-3 font-medium">
                Overheads
                <span className="block text-[10px] text-blue-600 uppercase font-bold mt-1">
                  * Must include Bank Charges
                </span>
              </td>
              <td className="border p-3 bg-gray-50 italic text-gray-600">4,224.00</td>
              <td className="border p-3">
                <input 
                  type="number" 
                  step="0.01"
                  className="w-full p-1 outline-none focus:ring-1 focus:ring-blue-400"
                  placeholder="0.00"
                  onChange={(e) => setFormData({...formData, overheadsExpense: parseFloat(e.target.value) || 0})}
                />
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="bg-blue-900 text-white font-bold">
              <td className="border p-3">TOTAL</td>
              <td className="border p-3 text-blue-200">R {formData.allocation.toFixed(2)}</td>
              <td className="border p-3">R {totalExpenditure.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Variance Alert Box */}
      <div className="mt-6 p-4 rounded bg-gray-50 border border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-gray-600">Unspent / Variance:</span>
          <span className={`text-lg font-mono font-bold ${variance < 0 ? 'text-red-600' : 'text-blue-900'}`}>
            R {variance.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Bank Charge Confirmation - The "Alert" Logic */}
      <div className={`mt-6 p-4 rounded border-2 transition-all ${bankChargesConfirmed ? 'border-green-200 bg-green-50' : 'border-yellow-300 bg-yellow-50'}`}>
        <label className="flex items-center space-x-3 cursor-pointer">
          <input 
            type="checkbox" 
            className="w-5 h-5 rounded border-gray-300 text-blue-900 focus:ring-blue-900"
            checked={bankChargesConfirmed}
            onChange={(e) => setBankChargesConfirmed(e.target.checked)}
          />
          <span className="text-sm font-semibold text-gray-800">
            I confirm that the total for Overheads includes all <span className="underline decoration-red-500">Bank Charges</span> as shown on the bank statement.
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading || !bankChargesConfirmed}
        className="mt-8 w-full bg-blue-900 text-white font-bold py-4 rounded hover:bg-blue-800 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {loading ? "Processing..." : "Submit Monthly Report"}
      </button>
      
      {!bankChargesConfirmed && (
        <p className="text-center text-[11px] text-red-500 mt-2 font-bold uppercase">
          Confirmation of bank charges required before submission
        </p>
      )}
    </form>
  );
}