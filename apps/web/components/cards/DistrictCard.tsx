"use client"; // Required for useState to work

import { useState } from "react";
import Link from "next/link";
import InviteAuditorModal from "../modals/InviteAuditorModal"; // Modal component

interface DistrictCardProps {
  districtId: string;
  name: string;
  auditor: { name: string | null; email: string } | null;
}

export default function DistrictCard({ districtId, name, auditor }: DistrictCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false); // Controls invite popup

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-bold text-lg text-slate-800">{name}</h3>
        {/* Badge styling from your original file */}
        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${auditor ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
          {auditor ? 'Staffed' : 'Vacant'}
        </span>
      </div>

      {auditor ? (
        <div className="space-y-1">
          {/* Detailed user info from your original file */}
          <p className="text-sm text-slate-600 font-medium">{auditor.name || "Unnamed Auditor"}</p>
          <p className="text-xs text-slate-400 mb-4">{auditor.email}</p>
          
          <Link 
            href={`/provincial/districts/${districtId}`}
            className="mt-4 block text-center py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200 transition"
          >
            View District Data
          </Link>
        </div>
      ) : (
        <div className="py-2">
          {/* Placeholder and Action button */}
          <p className="text-sm text-slate-500 italic mb-4 font-light">No auditor assigned yet.</p>
          <button 
            onClick={() => setIsModalOpen(true)} // Triggers the modal
            className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm transition active:scale-[0.98]"
          >
            + Invite Auditor
          </button>
        </div>
      )}

      {/* Logic to show the modal */}
      {isModalOpen && (
        <InviteAuditorModal 
          districtId={districtId} 
          districtName={name} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
}