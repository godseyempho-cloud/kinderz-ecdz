"use client";

import { useState } from "react";

interface Props {
  initialSalaries?: number;
  initialFood?: number;
  initialOverheads?: number;
}

export function FinancialCalculator({ initialSalaries = 0, initialFood = 0, initialOverheads = 0 }: Props) {
  const [salaries, setSalaries] = useState(initialSalaries);
  const [food, setFood] = useState(initialFood);
  const [overheads, setOverheads] = useState(initialOverheads);

  const total = Number(salaries) + Number(food) + Number(overheads);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Staff Salaries</label>
          <input 
            type="number" 
            name="salariesExpense"
            defaultValue={initialSalaries}
            onChange={(e) => setSalaries(Number(e.target.value))}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Food & Groceries</label>
          <input 
            type="number" 
            name="foodExpense"
            defaultValue={initialFood}
            onChange={(e) => setFood(Number(e.target.value))}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Overheads/Other</label>
          <input 
            type="number" 
            name="overheadsExpense"
            defaultValue={initialOverheads}
            onChange={(e) => setOverheads(Number(e.target.value))}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <div className="mt-4 p-4 bg-blue-600 rounded-xl shadow-inner">
        <div className="flex justify-between items-center">
          <span className="text-blue-100 text-xs font-bold uppercase">Total Calculated</span>
          <span className="text-white text-xl font-black font-mono">
            R {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
} 