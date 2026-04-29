"use client";

import { useState } from "react";
import { createEcdCenter } from "@/actions/ecd";

interface AddCenterModalProps {
  onCloseAction: () => void; // Renamed to satisfy TS(71007)
}

export default function AddCenterModal({ onCloseAction }: AddCenterModalProps) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await createEcdCenter({
      name: formData.get("name") as string,
      basNumber: formData.get("basNumber") as string,
      registrationLevel: formData.get("registrationLevel") as string,
    });

    setLoading(false);
    if (result.success) {
      onCloseAction();
    } else {
      alert(result.error);
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">Register New ECD Center</h2>
          <p className="text-xs text-slate-500 mt-1">Add a center to the district registry</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Center Name</label>
            <input 
              name="name" 
              required 
              className="w-full mt-1 p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="e.g. Little Stars Preschool" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">BAS Number</label>
            <input 
              name="basNumber" 
              className="w-full mt-1 p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="Accounting system ID (optional)" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Registration Level</label>
            <select 
              name="registrationLevel"
              className="w-full mt-1 p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="Bronze">Bronze (Entry Level)</option>
              <option value="Silver">Silver (Standard)</option>
              <option value="Gold">Gold (Fully Compliant)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button 
              type="button" 
              onClick={onCloseAction} 
              className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold disabled:opacity-50 hover:bg-blue-700 transition shadow-lg"
            >
              {loading ? "Registering..." : "Register Center"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}