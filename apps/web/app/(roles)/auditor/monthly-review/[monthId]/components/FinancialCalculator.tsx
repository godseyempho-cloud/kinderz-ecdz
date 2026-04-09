// apps/web/app/(roles)/auditor/monthly-review/[id]/components/FinancialCalculator.tsx

"use client";

import { useState } from "react";

interface Props {
  initialSalaries?: number;
  initialFood?: number;
  initialOverheads?: number;
  allocatedBudget: number; 
}

export function FinancialCalculator({ 
  initialSalaries = 0, 
  initialFood = 0, 
  initialOverheads = 0,
  allocatedBudget 
}: Props) {
  const [salaries, setSalaries] = useState(initialSalaries);
  const [food, setFood] = useState(initialFood);
  const [overheads, setOverheads] = useState(initialOverheads);

  const total = Number(salaries) + Number(food) + Number(overheads);
  const variance = allocatedBudget - total;
  const isOverBudget = variance < 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Staff Salaries</label>
          <input 
            type="number" 
            defaultValue={initialSalaries}
            onChange={(e) => setSalaries(Number(e.target.value))}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Food & Groceries</label>
          <input 
            type="number" 
            defaultValue={initialFood}
            onChange={(e) => setFood(Number(e.target.value))}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Overheads</label>
          <input 
            type="number" 
            defaultValue={initialOverheads}
            onChange={(e) => setOverheads(Number(e.target.value))}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-600">Reconciliation Metric</th>
              <th className="px-4 py-3 font-semibold text-slate-600 text-right">Amount (ZAR)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="px-4 py-3 text-slate-500">Total Allocated Budget</td>
              <td className="px-4 py-3 text-right font-mono font-medium">R {allocatedBudget.toLocaleString()}</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-slate-500">Current Calculated Total</td>
              <td className="px-4 py-3 text-right font-mono font-medium text-blue-600">R {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr className={isOverBudget ? "bg-red-50/50" : "bg-emerald-50/50"}>
              <td className={`px-4 py-4 font-bold ${isOverBudget ? "text-red-700" : "text-emerald-700"}`}>
                {isOverBudget ? "Budget Overspend (Shortfall)" : "Remaining Balance (Variance)"}
              </td>
              <td className={`px-4 py-4 text-right font-bold font-mono text-lg ${isOverBudget ? "text-red-700" : "text-emerald-700"}`}>
                R {Math.abs(variance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}















// "use client";

// import { useState } from "react";

// interface Props {
//   initialSalaries?: number;
//   initialFood?: number;
//   initialOverheads?: number;
// }

// export function FinancialCalculator({ initialSalaries = 0, initialFood = 0, initialOverheads = 0 }: Props) {
//   const [salaries, setSalaries] = useState(initialSalaries);
//   const [food, setFood] = useState(initialFood);
//   const [overheads, setOverheads] = useState(initialOverheads);

//   const total = Number(salaries) + Number(food) + Number(overheads);

//   return (
//     <div className="space-y-4">
//       <div className="grid grid-cols-1 gap-4">
//         <div className="space-y-1">
//           <label className="text-[10px] font-bold text-slate-400 uppercase">Staff Salaries</label>
//           <input 
//             type="number" 
//             name="salariesExpense"
//             defaultValue={initialSalaries}
//             onChange={(e) => setSalaries(Number(e.target.value))}
//             className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
//           />
//         </div>
        
//         <div className="space-y-1">
//           <label className="text-[10px] font-bold text-slate-400 uppercase">Food & Groceries</label>
//           <input 
//             type="number" 
//             name="foodExpense"
//             defaultValue={initialFood}
//             onChange={(e) => setFood(Number(e.target.value))}
//             className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
//           />
//         </div>

//         <div className="space-y-1">
//           <label className="text-[10px] font-bold text-slate-400 uppercase">Overheads/Other</label>
//           <input 
//             type="number" 
//             name="overheadsExpense"
//             defaultValue={initialOverheads}
//             onChange={(e) => setOverheads(Number(e.target.value))}
//             className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
//           />
//         </div>
//       </div>

//       <div className="mt-4 p-4 bg-blue-600 rounded-xl shadow-inner">
//         <div className="flex justify-between items-center">
//           <span className="text-blue-100 text-xs font-bold uppercase">Total Calculated</span>
//           <span className="text-white text-xl font-black font-mono">
//             R {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// } 