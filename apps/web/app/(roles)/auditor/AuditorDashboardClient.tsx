"use client";

import { useState } from "react";
import AddCenterModal from "@/components/modals/AddCenterModal";

export default function AuditorDashboardClient({ 
  centerCount, 
  districtName 
}: { 
  centerCount: number; 
  districtName: string 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium uppercase">Registered Centers</p>
          <p className="text-3xl font-bold text-blue-600">{centerCount}</p>
        </div>
        
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium uppercase">Pending Audits</p>
          <p className="text-3xl font-bold text-slate-400">Coming Soon</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-center">
        <h3 className="text-lg font-semibold text-slate-700">District Registry</h3>
        <p className="text-slate-500 max-w-xs mb-4">
          Register all ECD centers within {districtName} to begin auditing.
        </p>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
        >
          + Add New ECD Center
        </button>
      </div>

      // Inside AuditorDashboardClient.tsx
{isModalOpen && <AddCenterModal onCloseAction={() => setIsModalOpen(false)} />}
    </>
  );
}