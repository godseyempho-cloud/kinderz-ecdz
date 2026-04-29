"use client";

import { useState } from "react";
// Import the new modal component
import InviteAuditorModal from "@/components/modals/InviteAuditorModal";
import { Role } from "@prisma/client";

interface District {
  id: string;
  name: string;
  _count: { ecdCenters: number; auditors: number };
}

interface Invite {
  id: string;
  email: string;
  role: Role;
  provinceId: string | null;
  districtId: string | null;
  ecdCenterId: string | null;
  token: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

export default function DistrictTableClient({ 
  initialDistricts, 
  initialInvites 
}: { 
  initialDistricts: District[]; 
  initialInvites: Invite[]; 
}) {
  // State to track which district is being invited to, which also controls modal visibility
  const [selectedDistrict, setSelectedDistrict] = useState<{ id: string; name: string } | null>(null);

  return (
    <div className="space-y-12">
      {/* 1. Main Districts Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">District Name</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 text-center">Centers</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 text-center">Auditors</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {initialDistricts.map((d) => (
              <tr key={d.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4 font-medium text-slate-700">{d.name}</td>
                <td className="px-6 py-4 text-center text-slate-600">{d._count.ecdCenters}</td>
                <td className="px-6 py-4 text-center">
                   <span className={`px-2 py-1 rounded-full text-xs font-medium ${d._count.auditors > 0 ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                    {d._count.auditors} Active
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => setSelectedDistrict({ id: d.id, name: d.name })}
                    className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                  >
                    Invite Auditor
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 2. Pending Invites Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800">Pending Auditor Invitations</h3>
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-xs font-bold text-slate-500">Email</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500">Sent Date</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {initialInvites.length === 0 ? (
                <tr><td colSpan={3} className="px-6 py-12 text-center text-slate-400">No pending invites</td></tr>
              ) : (
                initialInvites.map(invite => (
                  <tr key={invite.id}>
                    <td className="px-6 py-3 text-sm text-slate-600">{invite.email}</td>
                    <td className="px-6 py-3 text-sm text-slate-400">{new Date(invite.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-3 text-right">
                      <span className="text-amber-600 text-[10px] font-bold uppercase bg-amber-50 px-2 py-1 rounded border border-amber-100">
                        Pending
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal is rendered only when a district is selected */}
      {selectedDistrict && (
        <InviteAuditorModal 
          districtId={selectedDistrict.id} 
          districtName={selectedDistrict.name} 
          onClose={() => setSelectedDistrict(null)} 
        />
      )}
    </div>
  ); 
}