./components/modals/InviteAuditorModal.tsx
"use client";

import { useState } from "react";
import { createInvite } from "@/actions/invite";

interface InviteModalProps {
  districtId: string;
  districtName: string;
  onClose: () => void;
}

export default function InviteAuditorModal({ districtId, districtName, onClose }: InviteModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const result = await createInvite({
      email,
      role: "AUDITOR",
      districtId: districtId,
    });

    if (result.success) {
      setIsSuccess(true);
    } else {
      setLoading(false);
      alert(result.error || "Failed to send invite");
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
        {!isSuccess ? (
          <>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Invite Auditor</h2>
            <p className="text-sm text-slate-500 mb-6">Assigning official for <strong>{districtName}</strong>.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Email Address</label>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="auditor@gov.za" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="flex-1 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {loading ? "Sending..." : "Send Invite"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Invite Sent!</h2>
            <p className="text-sm text-slate-500 mb-6">Sent to <strong>{email}</strong></p>
            <button onClick={onClose} className="w-full py-2 bg-slate-800 text-white font-semibold rounded-lg">Done</button>
          </div>
        )}
      </div>
    </div>
  );
}./components/modals/AddCenterModal.tsx
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
}./components/modals/InviteUserModal.tsx
"use client";

import { useState } from "react";
import { createInvite } from "@/actions/invite";
// We import from the client specifically to ensure the Enum is found
import { Role } from "@prisma/client"; 

export default function InviteUserModal({ openerRole }: { openerRole: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    
    // Extracting values to match the object structure createInvite expects
    const result = await createInvite({
      email: formData.get("email") as string,
      role: formData.get("role") as Role,
    });

    if (result.success && 'link' in result) {
      // Logic to handle local/Codespaces environment URLs
      const host = window.location.host.replace(':3000', '');
      const link = `${window.location.protocol}//${host}/register/${result.link}`;
      setInviteLink(link);
    } else {
      alert(result.error || "Failed to create invite");
    }
    setLoading(false);
  }

  const closeModal = () => {
    setIsOpen(false);
    setInviteLink("");
  };

  if (!isOpen) return (
    <button 
      onClick={() => setIsOpen(true)}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 shadow-md transition-all flex items-center gap-2"
    >
      <span className="text-xl">+</span> Invite Staff
    </button>
  );

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-xl text-slate-800">Invite New Staff</h3>
          <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 p-1">✕</button>
        </div>

        <div className="p-6">
          {!inviteLink ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Email Address</label>
                <input name="email" type="email" required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="staff@example.co.za" />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Assigned Role</label>
                <select name="role" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white outline-none">
                  {openerRole === "ADMIN" && <option value="PROVINCIAL">Provincial Head</option>}
                  <option value="AUDITOR">District Auditor</option>
                  <option value="SUPERVISOR">ECD Supervisor</option>
                </select>
              </div>

              <button disabled={loading} className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold disabled:opacity-50 hover:bg-slate-800 transition-colors">
                {loading ? "Generating..." : "Generate Invitation Link"}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-100 rounded-xl text-center">
                <p className="text-sm text-green-800 font-semibold">Link generated for testing</p>
              </div>
              <input readOnly value={inviteLink} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-blue-600" />
              <div className="flex flex-col gap-2">
                <button onClick={() => { navigator.clipboard.writeText(inviteLink); alert("Link copied!"); }} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700">Copy Link</button>
                <button onClick={closeModal} className="w-full text-slate-500 py-2 font-medium hover:bg-slate-50 rounded-xl">Done</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}./components/ReportForm.tsx
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
}./components/cards/DistrictCard.tsx
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
}./components/SessionProvider.tsx
"use client";

import { authClient } from "@/lib/auth-client"; // Ensure this path matches your client config
import { createContext, useContext, ReactNode } from "react";

type SessionContextType = ReturnType<typeof authClient.useSession>;

const SessionContext = createContext<SessionContextType | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const session = authClient.useSession();

  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};./components/auditor/QuarterlyToolGenerator.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface GeneratorProps {
    centerId: string;
    year: number;
    quarter: number;
    monthlyReportIds: string[];
}

export default function QuarterlyToolGenerator({ centerId, year, quarter, monthlyReportIds }: GeneratorProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/auditor/quarterly/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ centerId, year, quarter, monthlyReportIds }),
            });

            if (response.ok) {
                alert("Quarterly Monitoring Tool Generated & Submitted!");
                router.push("/dashboard");
            } else {
                const err = await response.json();
                alert(`Error: ${err.error}`);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-green-50 border border-green-200 p-6 rounded-xl">
            <h3 className="text-green-900 font-bold mb-2">Quarterly Submission Ready</h3>
            <p className="text-green-700 text-sm mb-4">
                All monthly reports for Q{quarter} are approved. You can now generate the official Quarterly Monitoring Tool.
            </p>
            <button 
                onClick={handleGenerate}
                disabled={loading}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50"
            >
                {loading ? "Generating..." : "Generate Quarterly Tool"}
            </button>
        </div>
    );
}./components/auditor/PaymentVerificationList.tsx
export default function PaymentVerificationList({ documents }: { documents: any[] }) {
  return (
    <div className="bg-white p-4 shadow rounded">
      <h3 className="font-bold mb-3">Supporting Documents (PoP)</h3>
      <ul className="divide-y">
        {documents.map((doc) => (
          <li key={doc.id} className="py-2 flex justify-between items-center">
            <span>{doc.name}</span>
            <a href={doc.url} target="_blank" className="text-blue-600 underline text-sm">View File</a>
          </li>
        ))}
        {documents.length === 0 && <p className="text-gray-400">No documents uploaded.</p>}
      </ul>
    </div>
  );
}./components/ReconciliationTable.tsx
"use client";
import React from "react";

export type ReconciliationRow = {
  label: string;
  supervisorValue: string | number;
  auditorValue?: string | number;
};

export default function ReconciliationTable({
  rows,
}: {
  rows: ReconciliationRow[];
}) {
  return (
    <table className="w-full table-auto border-collapse">
      <thead>
        <tr>
          <th className="border px-2 py-1">Item</th>
          <th className="border px-2 py-1">Supervisor</th>
          <th className="border px-2 py-1">Auditor</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.label}>
            <td className="border px-2 py-1 font-medium">{r.label}</td>
            <td className="border px-2 py-1">{r.supervisorValue}</td>
            <td className="border px-2 py-1">{r.auditorValue ?? "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
./components/DocumentList.tsx
import { Document, User } from "@prisma/client";
import { FileText, Eye, Download, User as UserIcon, Calendar } from "lucide-react";
import Link from "next/link";

interface DocumentListProps {
  /** * Expects the Document model from Prisma, 
   * optionally joined with the User who uploaded it 
   */
  docs: (Document & { uploadedBy?: User | null })[];
  viewMode: "auditor" | "supervisor";
}

export default function DocumentList({ docs, viewMode }: DocumentListProps) {
  // Empty State
  if (docs.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
        <div className="bg-slate-100 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3">
          <FileText className="h-6 w-6 text-slate-400" />
        </div>
        <p className="text-slate-500 font-semibold">No documents found</p>
        <p className="text-slate-400 text-sm">Upload evidence to see it listed here.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {docs.map((doc) => (
        <div 
          key={doc.id} 
          className="group flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-blue-300 hover:shadow-md transition-all"
        >
          {/* File Info Section */}
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold text-slate-900 leading-tight">{doc.filename}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded text-slate-500">
                  {doc.category.replace('_', ' ')}
                </span>
                
                {doc.uploadedBy && (
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <UserIcon className="h-3 w-3" /> {doc.uploadedBy.name || 'Staff'}
                  </span>
                )}

                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {doc.createdAt.toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <Link
              href={viewMode === "auditor" 
                ? `/auditor/verify-document/${doc.id}` 
                : `/supervisor/my-documents/${doc.id}`}
              className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              title="View Details"
            >
              <Eye className="h-5 w-5" />
            </Link>
            
            <a
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
              title="Download File"
            >
              <Download className="h-5 w-5" />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}./components/DistrictTableClient.tsx
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
}./components/UserProfileCard.tsx
import { User } from "@prisma/client";
import { User as UserIcon, Mail, Shield, Calendar, MapPin } from "lucide-react";

export default function UserProfileCard({ user }: { user: any }) {
  return (
    <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-slate-200">
      <div className="bg-slate-50 p-6 border-b border-slate-100 flex items-center gap-4">
        <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
          <UserIcon size={32} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{user.name || "User"}</h2>
          <p className="text-sm text-slate-500">{user.email}</p>
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between py-2 border-b border-slate-50">
          <span className="text-slate-500 text-sm flex items-center gap-2">
            <Shield size={16} /> Role
          </span>
          <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-black uppercase">
            {user.role}
          </span>
        </div>

        {user.ecdCenterId && (
          <div className="flex items-center justify-between py-2 border-b border-slate-50">
            <span className="text-slate-500 text-sm flex items-center gap-2">
              <MapPin size={16} /> Center ID
            </span>
            <span className="text-slate-900 font-mono text-sm">{user.ecdCenterId}</span>
          </div>
        )}

        <div className="flex items-center justify-between py-2">
          <span className="text-slate-500 text-sm flex items-center gap-2">
            <Calendar size={16} /> Joined
          </span>
          <span className="text-slate-900 text-sm">
            {new Date(user.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
          </span>
        </div>
      </div>
    </div>
  );
}./components/auth/sign-out-button.tsx
"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function SignOutButton() {
    const router = useRouter();

    const handleSignOut = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push("/login");
                    router.refresh();
                },
            },
        });
    };

    return (
        <button 
            onClick={handleSignOut}
            style={{ padding: "0.5rem 1rem", backgroundColor: "#ef4444", color: "white", borderRadius: "4px", border: "none", cursor: "pointer" }}
        >
            Sign Out
        </button>
    );
}./components/supervisor/findings-list.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle, MessageSquare, Send } from "lucide-react";

interface Finding {
  id: string;
  content: string;
  severity: string;
  status: string;
  comments: string[];
  report: {
    month: number | string; // Accept both to satisfy the compiler;
    year: number;
  };
}

export function FindingsList({ initialFindings }: { initialFindings: Finding[] }) {
  const [findings, setFindings] = useState(initialFindings);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleResolve = async (id: string) => {
    if (!comment.trim()) return alert("Please explain how you fixed this.");
    
    setLoading(true);
    try {
      const res = await fetch(`/api/supervisor/findings/${id}/resolve`, {
        method: "PATCH",
        body: JSON.stringify({ comment }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Failed to resolve");

      // Remove from the local list since it's no longer "Action Required"
      setFindings(findings.filter((f) => f.id !== id));
      setResolvingId(null);
      setComment("");
      router.refresh();
    } catch (err) {
      alert("Error resolving finding. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (findings.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
        <CheckCircle className="mx-auto h-12 w-12 text-green-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">All Clear!</h3>
        <p className="text-gray-500">No outstanding audit findings for your center.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {findings.map((finding) => (
        <div key={finding.id} className="bg-white border rounded-xl shadow-sm overflow-hidden">
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  finding.severity === 'HIGH' || finding.severity === 'CRITICAL' 
                  ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                }`}>
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">
                    {finding.report.month} {finding.report.year} Report Issue
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">{finding.content}</p>
                </div>
              </div>
              <span className="text-xs font-bold uppercase px-2 py-1 rounded bg-gray-100 text-gray-500">
                {finding.severity}
              </span>
            </div>

            {/* Comment History (If any) */}
            {finding.comments.length > 0 && (
              <div className="mt-4 bg-gray-50 p-3 rounded-lg space-y-2">
                {finding.comments.map((c, i) => (
                  <p key={i} className="text-xs text-gray-500 italic flex gap-2">
                    <MessageSquare size={14} /> {c}
                  </p>
                ))}
              </div>
            )}

            {/* Action Area */}
            <div className="mt-6 flex justify-end">
              {resolvingId === finding.id ? (
                <div className="w-full space-y-3">
                  <textarea
                    className="w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Describe the correction (e.g., 'Corrected the math in the attendance section' or 'Uploaded missing slip')..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                  />
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => setResolvingId(null)}
                      className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleResolve(finding.id)}
                      disabled={loading}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? "Saving..." : <><Send size={16} /> Mark as Resolved</>}
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setResolvingId(finding.id)}
                  className="text-sm font-bold text-blue-600 hover:text-blue-800 underline underline-offset-4"
                >
                  Respond to Finding
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}./components/DocumentUpload.tsx
"use client";
import React, { useEffect, useState } from "react";

export default function DocumentUpload({ centerId }: { centerId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState("");
  const [filename, setFilename] = useState("");
  const [category, setCategory] = useState("OTHER");
  const [comment, setComment] = useState("");
  const [presignAvailable, setPresignAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // probe presign availability
    fetch("/api/uploads/presign", { method: "POST" })
      .then((r) => {
        if (!r.ok) throw new Error("no presign");
        return r.json();
      })
      .then(() => setPresignAvailable(true))
      .catch(() => setPresignAvailable(false));
  }, []);

  async function handleUpload() {
    setMessage(null);
    if (!filename && !file) {
      setMessage("Please select a file or provide a filename and URL.");
      return;
    }
    if (!fileUrl) {
      setMessage("Please provide a public file URL (or configure S3 presign).\n(For now enter an uploaded file URL)");
      return;
    }

    setLoading(true);
    try {
      const body = {
        filename: filename || (file ? file.name : "unnamed"),
        url: fileUrl,
        category,
        ecdCenterId: centerId,
        comment,
      };

      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }
      setMessage("Document recorded successfully");
      setFile(null);
      setFileUrl("");
      setFilename("");
      setComment("");
    } catch (err: any) {
      setMessage(String(err.message || err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border p-4 rounded">
      <h3 className="font-semibold mb-2">Upload Supporting Document</h3>
      <div className="mb-2">
        <label className="block">File (select file to auto-fill name)</label>
        <input
          type="file"
          onChange={(e) => {
            const f = e.target.files ? e.target.files[0] : null;
            setFile(f);
            if (f) {
              setFilename(f.name);
            }
          }}
        />
      </div>

      <div className="mb-2">
        <label className="block">Filename</label>
        <input value={filename} onChange={(e) => setFilename(e.target.value)} className="border p-1 w-full" />
      </div>

      <div className="mb-2">
        <label className="block">File URL</label>
        <input
          value={fileUrl}
          onChange={(e) => setFileUrl(e.target.value)}
          placeholder={presignAvailable ? "Upload will use presigned URL (not configured)" : "Enter public file URL"}
          className="border p-1 w-full"
        />
      </div>

      <div className="mb-2">
        <label className="block">Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="border p-1 w-full">
          <option value="FOOD">FOOD</option>
          <option value="SALARIES">SALARIES</option>
          <option value="OVERHEADS">OVERHEADS</option>
          <option value="BANK_STATEMENT">BANK_STATEMENT</option>
          <option value="FINANCIAL_REPORT">FINANCIAL_REPORT</option>
          <option value="AFFIDAVIT">AFFIDAVIT</option>
          <option value="OTHER">OTHER</option>
        </select>
      </div>

      <div className="mb-2">
        <label className="block">Comment (optional, max 1000 chars)</label>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="border p-1 w-full" />
      </div>

      <div className="flex gap-2">
        <button onClick={handleUpload} disabled={loading} className="bg-blue-600 text-white px-3 py-1 rounded">
          {loading ? "Uploading..." : "Record Document"}
        </button>
        <button onClick={() => { setFile(null); setFileUrl(""); setFilename(""); setComment(""); }} className="px-3 py-1 border rounded">
          Reset
        </button>
      </div>

      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
}
./components/ReportList.tsx
"use client";
import Link from "next/link";
import React from "react";

export type ReportSummary = {
  id: string;
  year: number;
  month: number;
  status: string;
};

export default function ReportList({ reports }: { reports: ReportSummary[] }) {
  return (
    <table className="w-full table-auto border-collapse">
      <thead>
        <tr>
          <th className="border px-2 py-1">Year</th>
          <th className="border px-2 py-1">Month</th>
          <th className="border px-2 py-1">Status</th>
          <th className="border px-2 py-1">Action</th>
        </tr>
      </thead>
      <tbody>
        {reports.map((r) => (
          <tr key={r.id}>
            <td className="border px-2 py-1">{r.year}</td>
            <td className="border px-2 py-1">{r.month}</td>
            <td className="border px-2 py-1">{r.status}</td>
            <td className="border px-2 py-1">
              <Link href={`/reports/auditor/${r.id}`}>View</Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
./components/RegisterForm.tsx
"use client";

import { Role } from "@prisma/client";
import { useState } from "react";

interface RegisterFormProps {
  email: string;
  token: string;
  role: Role;
  provinceId: string | null;
  districtId: string | null;
  ecdCenterId: string | null;
  districtName?: string;
  provinceName?: string;
}

export default function RegisterForm({
  email,
  token,
  role,
  provinceId,
  districtId,
  ecdCenterId,
  districtName,
  provinceName,
}: RegisterFormProps) {
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          name,
          token,
          email,
          role,
          provinceId, // Required for Provincial and Auditor
          districtId, // Required for Auditor
          ecdCenterId, // Required for Supervisor
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to complete registration");
      }

      window.location.href = "/login?registered=true";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md p-6 bg-white shadow-md rounded-lg border border-gray-200">
      <div className="space-y-1 mb-6">
        <h2 className="text-xl font-bold text-gray-800">Account Activation</h2>
        <p className="text-sm text-gray-500">Please provide your details to activate your Tinyiko account.</p>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
          {error}
        </div>
      )}

      <div className="space-y-3 p-4 bg-slate-50 rounded-md border border-slate-200">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Role</label>
            <p className="text-sm font-semibold text-slate-700">{role}</p>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Email</label>
            <p className="text-sm font-medium text-slate-600 truncate">{email}</p>
          </div>
        </div>
        
        <div className="pt-2 border-t border-slate-200">
          <label className="text-[10px] uppercase tracking-wider text-blue-600 font-bold">Jurisdiction</label>
          <p className="text-sm font-bold text-slate-800">
            {districtName || "Provincial Office"} 
            {provinceName && <span className="text-slate-500 font-normal"> — {provinceName}</span>}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
          <input
            type="text"
            placeholder="e.g. Sipho Kumalo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-slate-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Create Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-slate-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            required
            minLength={8}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full p-2 rounded text-white font-semibold shadow-sm transition-all ${
          loading ? "bg-slate-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"
        }`}
      >
        {loading ? "Activating..." : "Activate Account"}
      </button>
    </form>
  );
}./tsconfig.json
{
  "compilerOptions": {
    "types": ["node", "next"], // <-- added "next" so Next.js types resolve
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true, 
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"],
      "@kinderz/db": ["../../packages/db/index.ts"] // <-- added alias for local db package
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
./actions/ecd.ts
"use server";

import { prisma } from "@kinderz/db";
import { auth } from "@/lib/betterAuth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

/**
 * Server Action to register a new ECD Center.
 * Adjusted to match the verified Prisma Model for EcdCenter.
 */
export async function createEcdCenter(data: {
  name: string;
  basNumber?: string;
  registrationLevel?: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // 1. Security Check: Only Auditors (or Admins) should be creating center records
  if (!session || (session.user.role !== "AUDITOR" && session.user.role !== "ADMIN")) {
    throw new Error("Unauthorized: You do not have permission to register centers.");
  }

  // 2. District Assignment: Use the Auditor's districtId from their session
  const districtId = session.user.districtId;

  if (!districtId) {
    return { 
      success: false, 
      error: "Your account is not assigned to a district. Please contact your administrator." 
    };
  }

  try {
    // 3. Database Insertion
    await prisma.ecdCenter.create({
      data: {
        name: data.name,
        basNumber: data.basNumber,
        registrationLevel: data.registrationLevel,
        districtId: districtId,
        // fundingStatus defaults to APPROVED per your model
      },
    });

    // 4. Cache Invalidation: Refresh the Auditor dashboard to show the new center
    revalidatePath("/auditor");
    
    return { success: true };
  } catch (error) {
    console.error("ECD Creation Error:", error);
    return { 
      success: false, 
      error: "An error occurred while saving the center. Ensure the BAS number is unique if applicable." 
    };
  }
}

/**
 * Optional: Fetch centers for the current Auditor's district
 */
export async function getDistrictCenters() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user.districtId) return [];

  return await prisma.ecdCenter.findMany({
    where: { districtId: session.user.districtId },
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { children: true, staff: true }
      }
    }
  });
}./actions/invite.ts
"use server";

import { prisma } from "@kinderz/db"; 
import { Role } from "@prisma/client";
import * as crypto from "node:crypto"; // Secure token generation
import { revalidatePath } from "next/cache";

export async function createInvite(data: {
  email: string;
  role: Role;
  provinceId?: string;
  districtId?: string;
}) {
  try {
    const emailLower = data.email.toLowerCase();

    // 1. Check if a User with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: emailLower }
    });
    if (existingUser) {
      return { success: false, error: "A user with this email already exists." };
    }

    // 2. Rule Enforcement: Check if District/Province already has an assigned role
    // This prevents double-assigning auditors to the same district (Rule 2)
    if (data.districtId && data.role === "AUDITOR") {
      const existingAuditor = await prisma.user.findFirst({
        where: { 
          districtId: data.districtId,
          role: "AUDITOR" 
        }
      });
      if (existingAuditor) {
        return { success: false, error: "This district already has an assigned Auditor." };
      }
    }

    // 3. Generate a secure random token
    const token = crypto.randomBytes(32).toString("hex");
    
    // 4. Set expiry to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // 5. Create the invite record
    // We use 'upsert' or delete existing pending invites for the same email 
    // to keep the database clean
    await prisma.invite.deleteMany({
      where: { email: emailLower }
    });

    const invite = await prisma.invite.create({
      data: {
        email: emailLower,
        role: data.role,
        provinceId: data.provinceId || null,
        districtId: data.districtId || null,
        token: token,
        expiresAt: expiresAt,
      },
    });

    // 6. Construct Link 
    // Uses the Environment variable for the domain (e.g., tinyiko.com or localhost)
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/register?token=${token}`;

    // 7. Refresh the UI
    // This ensures the District Card instantly shows 'Pending' or updates the list
    revalidatePath("/provincial/districts"); 
    
    // In a real production app, you would call an email service here (e.g., Resend)
    // For now, we return the link so you can manually copy/paste it for testing
    return { success: true, link: inviteLink };

  } catch (error) {
    console.error("Invite Error:", error);
    return { success: false, error: "Failed to create invite. Please try again." };
  }
} ./actions/register.ts
"use server";

import { prisma } from "@kinderz/db";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";

export type RegisterActionResponse = {
  success?: boolean;
  error?: string;
};

export async function registerUser(formData: FormData): Promise<RegisterActionResponse> {
  try {
    const name = formData.get("name") as string;
    const password = formData.get("password") as string;
    const token = formData.get("token") as string;

    if (!name || !password || !token) {
      return { error: "All fields are required." };
    }

    const invite = await prisma.invite.findUnique({
      where: { token, used: false },
    });

    if (!invite || (invite.expiresAt && invite.expiresAt < new Date())) {
      return { error: "Invalid or expired invitation token." };
    }

    const hashedPassword = await hash(password, 12);

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: invite.email.toLowerCase().trim(),
          name: name,
          password: hashedPassword, 
          role: invite.role,
          provinceId: invite.provinceId,
          districtId: invite.districtId,
          ecdCenterId: invite.ecdCenterId,
          isActive: true,
          emailVerified: true, 
        },
      });

      await tx.account.create({
        data: {
          userId: user.id,
          accountId: user.id, 
          providerId: "credential",
          password: hashedPassword,
        },
      });

      await tx.invite.update({
        where: { id: invite.id },
        data: { used: true },
      });
    });

    revalidatePath("/");
    return { success: true };

  } catch (error: any) {
    console.error("Registration Error:", error);
    if (error.code === 'P2002') {
      return { error: "This email or role assignment is already taken." };
    }
    return { error: "Failed to create account. Please try again." };
  }
}./lib/auth-client.ts
import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    // Using your specific GitHub Codespaces URL
    baseURL: "https://zany-umbrella-pjq645v6jvq62769g-3000.app.github.dev",
    plugins: [
        adminClient() 
    ],
    // This maps your custom Prisma fields so they are 
    // accessible on the client-side session object.
    metadata: {
        role: "string",
        ecdCenterId: "string",
        districtId: "string",
        provinceId: "string"
    },
    fetchOptions: {
        onError(context) {
            console.error("Auth Client Error:", context.error);
        }
    }
});./lib/report-utils.ts
/**
 * Maps a fiscal quarter number to its constituent months.
 * Fiscal Year Start: April 1st (Q1: Apr-Jun)
 */
export function getMonthsForQuarter(quarter: number): number[] {
  switch (quarter) {
    case 1: return [4, 5, 6];    // Apr, May, Jun
    case 2: return [7, 8, 9];    // Jul, Aug, Sep
    case 3: return [10, 11, 12]; // Oct, Nov, Dec
    case 4: return [1, 2, 3];    // Jan, Feb, Mar (Next calendar year)
    default: return [];
  }
}

/**
 * Returns a short string name for a month number (1-12).
 */
export function getMonthName(monthNum: number): string {
  const date = new Date();
  // monthNum is 1-based, Date constructor expects 0-based
  date.setMonth(monthNum - 1); 
  return date.toLocaleString('en-US', { month: 'short' });
}

/**
 * Determines the correct calendar year for a specific month 
 * based on the Fiscal Year and Quarter.
 */
export function getCalendarYearForMonth(fiscalYear: number, quarter: number): number {
  // If it's Q4 (Jan-Mar), the calendar year is Fiscal Year + 1
  return quarter === 4 ? fiscalYear + 1 : fiscalYear;
}./lib/auth-types.ts
// apps/web/lib/auth-types.ts
import { auth } from "./betterAuth"; 

export type Session = typeof auth.$Infer.Session;
// In 1.x, the User type is accessed via Session["user"]
export type User = typeof auth.$Infer.Session["user"];./lib/get-session.ts
import { auth } from "@/lib/betterAuth";
import { headers } from "next/headers";
import { prisma } from "@kinderz/db";

/**
 * Enhanced session type that includes role, jurisdiction, and status checks.
 * This enriches the basic Better-Auth session with database-driven permissions.
 */
export interface EnrichedSession {
    user: {
        id: string;
        email: string;
        role: string; // ADMIN, PROVINCIAL, SUPERVISOR, AUDITOR, ECD_USER
        ecdCenterId: string | null; // Jurisdiction: which center this user belongs to
        districtId: string | null; // Jurisdiction: which district this user belongs to
        provinceId: string | null; // Jurisdiction: which province this user belongs to
        isActive: boolean; // false = blocked from all access
        isFrozen: boolean; // false = account temporarily locked
        banned: boolean; // false = account permanently locked
    };
    expiresAt: number;
}

/**
 * getSession()
 * 1. Fetch session from Better-Auth
 * 2. Query user record from DB to get role, jurisdictions, status
 * 3. Return null if user is banned/frozen/inactive (immediate blocklist)
 * 4. Return enriched session with role + jurisdiction for guards
 */
export async function getSession(): Promise<EnrichedSession | null> {
    return await auth.api.getSession({
        headers: await headers()
        }).then(async (session) => {
            // If no session, return null immediately
            if (!session?.user?.id) return null;

            // Query Prisma to get full user record including role, jurisdictions, status
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: {
                    id: true,
                    email: true,
                    role: true,
                    ecdCenterId: true,
                    districtId: true,
                    provinceId: true,
                    isActive: true,
                    isFrozen: true,
                    banned: true,
                },
            });

            // User not found in DB (should not happen, but be safe)
            if (!user) return null;

            // REJECT: User is banned (permanent block)
            if (user.banned) return null;

            // REJECT: User is frozen (temporary block)
            if (user.isFrozen) return null;

            // REJECT: User is marked inactive (administrative hold)
            if (!user.isActive) return null;

            // Return enriched session with role, jurisdictions, and status snapshot
            return {
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role, // Now includes ADMIN, PROVINCIAL, etc.
                    ecdCenterId: user.ecdCenterId, // null for Admin/Provincial; set for SUPERVISOR/ECD_USER
                    districtId: user.districtId, // null for non-Auditor; set for AUDITOR
                    provinceId: user.provinceId, // null for non-Provincial; set for PROVINCIAL
                    isActive: user.isActive,
                    isFrozen: user.isFrozen,
                    banned: user.banned,
                },
                // auth.api.getSession() returns { session: { expiresAt: Date }, user: {...} }
                // Convert to numeric ms timestamp for easier comparisons in guards
                expiresAt: session?.session?.expiresAt
                    ? new Date(session.session.expiresAt).getTime()
                    : Date.now(),
            };
    });
}  ./lib/betterAuth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@kinderz/db"; 
import { admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { hash, compare } from "bcryptjs";

const adapterConfig = {
  provider: "postgresql" as const,     
};

export const auth = betterAuth({
  database: prismaAdapter(prisma, adapterConfig),

  baseURL: "https://zany-umbrella-pjq645v6jvq62769g-3000.app.github.dev",

  secret: process.env.BETTER_AUTH_SECRET!,

  advanced: {
    useSecureCookies: true, 
    trustHost: true,       
  },

  trustedOrigins: [
    "https://zany-umbrella-pjq645v6jvq62769g-3000.app.github.dev",
    "https://localhost:3000",
    "http://localhost:3000"
  ],

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    password: {
      hash: async (password: string) => {
        return await hash(password, 12);
      },
      verify: async ({ password, hash }: { password: string, hash: string }) => {
        return await compare(password, hash);
      },
    },
  },

  user: {
    additionalFields: {
      // ADDED: provinceId to resolve TS errors in layout/pages
      provinceId: {
        type: "string",
        required: false,
      },
      role: {
        type: "string",
        required: false,
        defaultValue: "ECD_USER", 
        input: false,
      },
      ecdCenterId: {
        type: "string",
        required: false,
      },
      districtId: {
        type: "string",
        required: false,
      }
    },
  },

  plugins: [
    admin({
      defaultRole: "ECD_USER", 
    }), 
    nextCookies(), 
  ],
});./lib/validations/monthly-report.ts
import { z } from "zod";

export const monthlyReportSchema = z.object({
  year: z.number().int(),
  month: z.number().int().min(1).max(12),
  days: z.number().int().default(22), // Days the center was open
  
  // Financial fields from the Supervisor's receipts
  salariesExpense: z.coerce.number().min(0),
  foodExpense: z.coerce.number().min(0),
  overheadsExpense: z.coerce.number().min(0),


  // Operational stats
  attendanceCount: z.number().int().min(0),
  childrenFunded: z.number().int().min(0),
  
  notes: z.string().optional(),
  status: z.enum(["DRAFT", "SUBMITTED"]).default("DRAFT"),
});./lib/api-guards.ts
/**
 * API Guards: Role-based and jurisdiction-based access control for endpoints
 * Used in /api routes to enforce multi-tenancy, role restrictions, and status checks
 */

// Import the enriched session helper and its TypeScript type.
// getSession() returns an EnrichedSession (or null) which includes role, jurisdiction, and status flags.
import { getSession, EnrichedSession } from "@/lib/get-session";
import { prisma } from "@kinderz/db";
// -------------------------
// Guard 1: requireSession
// -------------------------
// Purpose: Ensure the request is authenticated and the user is in good standing.
// - Calls getSession() to fetch the session and user snapshot from the DB.
// - Throws ApiError(401) when the user is not authenticated or blocked.
export async function requireSession(): Promise<EnrichedSession> {
  // Retrieve enriched session (may be null)
  const session = await getSession();

  // If no session, user is not authenticated
  if (!session) {
    // 401 Unauthorized for unauthenticated or blocked users
    throw new ApiError(401, "Unauthorized: Please log in");
  }

  // Return the enriched session for downstream guards or handlers
  return session; 
}

// -------------------------
// Guard 2: requireRole
// -------------------------
// Purpose: Ensure the current user has one of the allowed roles to perform an action.
// Usage example: requireRole(session, ["SUPERVISOR", "ADMIN"])
export function requireRole(session: EnrichedSession, allowedRoles: string[]): void {
  // If the user's role is not in the allowed list, block with 403 Forbidden
  if (!allowedRoles.includes(session.user.role)) {
    throw new ApiError(
      403,
      `Forbidden: This action requires one of [${allowedRoles.join(", ")}]. You are ${session.user.role}`
    );
  }
}

// -------------------------
// Guard 3: requireCenterAccess
// -------------------------
// Purpose: Ensure that the user can access data for a specific ECD center.
// Rules implemented here:
// - ADMIN: full access
// - PROVINCIAL: broad access (province-level enforcement happens in queries)
// - SUPERVISOR/ECD_USER: may only access their assigned center
// - AUDITOR: handled separately (district-level checks should be applied in DB queries) 
// -------------------------
// Guard 3: requireCenterAccess
// -------------------------
/**
 * Purpose: Ensure the user can access data for a specific ECD center.
 * Note: This is now ASYNC because Auditors require a DB lookup to verify the center's district.
 */
export async function requireCenterAccess(
  session: EnrichedSession,
  targetCenterId: string
): Promise<void> {
  // 1. ADMIN & PROVINCIAL bypass
  if (session.user.role === "ADMIN" || session.user.role === "PROVINCIAL") return;

  // 2. Supervisor or ECD user: enforce same-center restriction
  if (session.user.role === "SUPERVISOR" || session.user.role === "ECD_USER") {
    if (session.user.ecdCenterId !== targetCenterId) {
      throw new ApiError(403, `Forbidden: You do not have access to center ${targetCenterId}`);
    }
    return;
  }

  // 3. AUDITOR: Verify the center belongs to their assigned district
  if (session.user.role === "AUDITOR") {
    // If auditor has no district assigned, deny by default
    if (!session.user.districtId) {
      throw new ApiError(403, "Forbidden: Auditor has no assigned district.");
    }

    const center = await prisma.ecdCenter.findUnique({
      where: { id: targetCenterId },
      select: { districtId: true }
    });

    if (!center) {
      throw new ApiError(404, "Center not found.");
    }

    if (center.districtId !== session.user.districtId) {
      throw new ApiError(403, "Forbidden: This center is outside your assigned district.");
    }
    return;
  }

  // Fallback for undefined roles
  throw new ApiError(403, "Forbidden: Insufficient permissions to access center data.");
}

// -------------------------
// Guard 4: requireProvinceAccess
// -------------------------
// Purpose: Ensure the user can access a specific Province.
// Rules implemented here:
// - ADMIN: full access to all provinces
// - PROVINCIAL: must be assigned to the target province (cross-province access prevented)
// - Other roles: should not call this guard; deny by omission
export function requireProvinceAccess(
  session: EnrichedSession,
  targetProvinceId: string
): void {
  // ADMIN bypass
  if (session.user.role === "ADMIN") return;

  // PROVINCIAL: must be assigned to the target province
  if (session.user.role === "PROVINCIAL") {
    if (session.user.provinceId !== targetProvinceId) {
      throw new ApiError(403, `Forbidden: You do not have access to province ${targetProvinceId}`);
    }
    return; // allowed
  }

  // Other roles (SUPERVISOR, ECD_USER, AUDITOR) should not call this guard
  throw new ApiError(403, "Forbidden: Insufficient privileges for province access");
}

// -------------------------
// Guard 5: requireDistrictAccess 
// -------------------------
// Purpose: Ensure the user can access a specific District.
// Rules implemented here:
// - ADMIN: full access
// - PROVINCIAL: bypass here (province-level scoping enforced elsewhere)
// - AUDITOR: must match assigned districtId
export function requireDistrictAccess(
  session: EnrichedSession,
  targetDistrictId: string 
): void {
  // ADMIN bypass
  if (session.user.role === "ADMIN") return;

  // PROVINCIAL bypass for district-level checks
  if (session.user.role === "PROVINCIAL") return;

  // AUDITOR: must be assigned to the target district
  if (session.user.role === "AUDITOR") {
    if (session.user.districtId !== targetDistrictId) {
      throw new ApiError(403, `Forbidden: You do not have access to district ${targetDistrictId}`);
    }
    return; // allowed
  }
 
  // Other roles (SUPERVISOR, ECD_USER) should not call this guard; if they do, deny by omission.
  throw new ApiError(403, "Forbidden: Insufficient privileges for district access");
}

// -------------------------
// Guard 6: isReportLocked
// -------------------------
// Purpose: Ensure a monthly report is not locked preventing supervisor edits.
// - status: the report's current status (DRAFT, SUBMITTED, LATE, REVIEWED, APPROVED)
// - allowedStatuses: which statuses permit editing (default: only DRAFT)
// Used to prevent double edits: once SUBMITTED, supervisor cannot modify until auditor flags CORRECTIONS_REQUIRED
export function isReportLocked(
  status: string,
  allowedStatuses: string[] = ["DRAFT"]
): void {
  if (!allowedStatuses.includes(status)) {
    throw new ApiError(403, `Report is locked. Current status: ${status}. Editing only allowed in [${allowedStatuses.join(", ")}]`);
  }
}

// -------------------------
// Guard 7: preventSelfReview 
// -------------------------
// Purpose: Prevent a user from reviewing their own upload (conflict of interest).
// - uploadedById: the user who uploaded the resource
// - reviewedById: the user attempting to review
export function preventSelfReview(uploadedById: string, reviewedById: string): void {
  if (uploadedById === reviewedById) {
    throw new ApiError(403, "Conflict of Interest: You cannot review your own submissions");
  }
}

// -------------------------
// ApiError: Structured API error
// -------------------------
// A small Error subclass that carries an HTTP status for consistent handling in routes.
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError"; 
  }
}

// -------------------------
// errorResponse helper
// -------------------------
// Convert ApiError or unknown exceptions into Response objects usable in Next API routes.
export function errorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Log unexpected errors and return generic 500
  console.error("[API Error]", error);
  return new Response(JSON.stringify({ error: "Internal Server Error" }), {
    status: 500,
    headers: { "Content-Type": "application/json" },
  });
}
./lib/services/reports.ts
// import { prisma } from "@kinderz/db";

// export async function compileQuarterlyData(centerId: string, year: number, month: number) {
//   const quarter = Math.ceil(month / 3);
//   const startMonth = (quarter - 1) * 3 + 1;
//   const monthsInQuarter = [startMonth, startMonth + 1, startMonth + 2];

//   // 1. Fetch all 3 monthly reports for this specific quarter
//   const months = await prisma.monthlyReport.findMany({
//     where: {
//       ecdCenterId: centerId,
//       year: year,
//       month: { in: monthsInQuarter },
//       status: "SUBMITTED"
//     }
//   });

//   // 2. Only proceed to compile if the Supervisor has submitted all 3 months
//   if (months.length === 3) {
//     // Sum up the key totals for the Auditor
//     const totalExpenses = months.reduce((acc, m) => acc + Number(m.totalExpenditure), 0);
    
//     // We also want to sum up or average the attendance for the Auditor's high-level view
//     const totalAttendance = months.reduce((acc, m) => acc + (m.attendanceCount || 0), 0);

//     return await prisma.quarterlyReport.upsert({
//       where: {
//         ecdCenterId_year_quarter: {
//           ecdCenterId: centerId,
//           year: year,
//           quarter: quarter,
//         }
//       },
//       update: { 
//         totalExpenses, 
//         status: "SUBMITTED",
//         notes: `Auto-compiled from months: ${monthsInQuarter.join(", ")}`
//       },
//       create: {
//         ecdCenterId: centerId,
//         year,
//         quarter,
//         totalExpenses,
//         status: "SUBMITTED",
//         createdById: months[0].submittedById, // Crediting the original supervisor
//       }
//     });
//   }
  
//   return null; // Not ready for compilation yet
// }



import { prisma } from "@kinderz/db";

export async function compileQuarterlyData(centerId: string, year: number, month: number) {
  // Map months to SA Financial Quarters (Month 4 = April = Q1)
  const quarterMap: Record<number, { q: number; months: number[] }> = {
    4: { q: 1, months: [4, 5, 6] }, 5: { q: 1, months: [4, 5, 6] }, 6: { q: 1, months: [4, 5, 6] },
    7: { q: 2, months: [7, 8, 9] }, 8: { q: 2, months: [7, 8, 9] }, 9: { q: 2, months: [7, 8, 9] },
    10: { q: 3, months: [10, 11, 12] }, 11: { q: 3, months: [10, 11, 12] }, 12: { q: 3, months: [10, 11, 12] },
    1: { q: 4, months: [1, 2, 3] }, 2: { q: 4, months: [1, 2, 3] }, 3: { q: 4, months: [1, 2, 3] },
  };

  const { q: quarter, months: monthsInQuarter } = quarterMap[month];

  const months = await prisma.monthlyReport.findMany({
    where: {
      ecdCenterId: centerId,
      year: year,
      month: { in: monthsInQuarter },
      status: "SUBMITTED"
    }
  });

  if (months.length === 3) {
    const totalExpenses = months.reduce((acc, m) => acc + Number(m.totalExpenditure), 0);
    
    return await prisma.quarterlyReport.upsert({
      where: {
        ecdCenterId_year_quarter: { ecdCenterId: centerId, year, quarter }
      },
      update: { totalExpenses, status: "SUBMITTED" },
      create: {
        ecdCenterId: centerId,
        year,
        quarter,
        totalExpenses,
        status: "SUBMITTED",
        createdById: months[0].submittedById
      }
    });
  }
  return null;
}./package.json
{
  "name": "web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@kinderz/db": "^0.0.1",
    "bcryptjs": "^3.0.3",
    "better-auth": "^1.4.7",
    "lucide-react": "^1.7.0",
    "next": "14.2.35",
    "react": "^18",
    "react-dom": "^18",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/node": "^20.19.33",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "eslint": "^8",
    "eslint-config-next": "14.2.35",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "ts-node": "^10.9.2",
    "tsx": "^4.21.0",
    "typescript": "^5.9.3"
  }
}
./tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};
export default config;
./next-env.d.ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/building-your-application/configuring/typescript for more information.
./middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/get-session";

/**
 * Mapping of roles to their primary landing pages.
 */
const ROLE_ROUTES = {
  ADMIN: "/admin",
  PROVINCIAL: "/provincial",
  AUDITOR: "/auditor",
  SUPERVISOR: "/dashboard",
  ECD_USER: "/dashboard",
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. PUBLIC & STATIC EXEMPTIONS
  // These routes are accessible to everyone (auth not required)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/register") || 
    pathname === "/login" ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  // 2. GET SESSION DIRECTLY
  // Direct import avoids the "fetch failed" loop often seen in containerized dev environments.
  const session = await getSession();

  // 3. UNAUTHENTICATED REDIRECT
  // If no user is logged in, and they try to access a protected route, send to login.
  if (!session || !session.user) {
    const isProtectedRoute = Object.values(ROLE_ROUTES).some((route) =>
      pathname.startsWith(route)
    );

    if (isProtectedRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // Cast the role to ensure TypeScript recognizes it as a key of our route mapping
  const userRole = session.user.role as keyof typeof ROLE_ROUTES;

  // 4. ROLE-BASED ACCESS CONTROL (RBAC)
  // Ensure users can only stay in the folder assigned to their role.
  const isUnauthorizedAccess = (folder: string, allowedRole: string) => 
    pathname.startsWith(folder) && userRole !== allowedRole;

  if (
    isUnauthorizedAccess("/admin", "ADMIN") ||
    isUnauthorizedAccess("/provincial", "PROVINCIAL") ||
    isUnauthorizedAccess("/auditor", "AUDITOR")
  ) {
    // Redirect to their actual role's home or a safe fallback
    const targetPath = ROLE_ROUTES[userRole] || "/dashboard";
    return NextResponse.redirect(new URL(targetPath, request.url));
  }

  // 5. PREVENT LOGGED-IN USERS FROM VISITING LOGIN PAGE
  // If they are already authenticated, send them to their dashboard.
  if (pathname === "/login") {
    const targetPath = ROLE_ROUTES[userRole] || "/dashboard";
    return NextResponse.redirect(new URL(targetPath, request.url));
  }

  return NextResponse.next();
}

/**
 * Matcher ensures middleware only runs on actual page routes, 
 * skipping static assets for performance.
 */
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};./scripts/testLocking.ts
/**
 * Test script: Monthly Report Locking Workflow
 * 
 * Verifies that the status field and locking logic work:
 * 1. New reports are created with status = DRAFT
 * 2. Only reports in DRAFT can be submitted (transitioned to SUBMITTED)
 * 3. The isReportLocked guard prevents invalid transitions
 * 
 * This test uses direct Prisma queries to isolate the locking logic
 * from any authentication issues. Once auth works, the endpoints
 * verified in this test will enforce the same rules.
 * 
 * Run: npx tsx scripts/testLocking.ts
 */

import { prisma } from "@kinderz/db";

async function main() {
  console.log("🔐 Testing Report Locking Logic (via Prisma)...\n");

  // 1. Set up test data
  let province = await prisma.province.findFirst({ where: { name: "LockTestProvince" } });
  if (!province) {
    province = await prisma.province.create({ data: { name: "LockTestProvince" } });
  }

  let district = await prisma.district.findFirst({ where: { name: "LockTestDistrict" } });
  if (!district) {
    district = await prisma.district.create({
      data: { name: "LockTestDistrict", provinceId: province.id },
    });
  }

  let center = await prisma.ecdCenter.findFirst({
    where: { name: "LockTestCenter" },
  });
  if (!center) {
    center = await prisma.ecdCenter.create({
      data: { name: "LockTestCenter", districtId: district.id },
    });
  }

  let supervisor = await prisma.user.findFirst({
    where: { email: "locktest@example.com" },
  });
  if (!supervisor) {
    supervisor = await prisma.user.create({
      data: {
        email: "locktest@example.com",
        password: "test",
        role: "SUPERVISOR",
        ecdCenterId: center.id,
      },
    });
  }

  console.log(
    `✓ Test data ready: supervisor=${supervisor.id}, center=${center.id}\n`
  );

  // 2. Create a report (should default to DRAFT)
  console.log("1️⃣  Creating report (should be DRAFT)...");
  const report = await prisma.monthlyReport.create({
    data: {
      year: 2026,
      month: 3,
      ecdCenterId: center.id,
      submittedById: supervisor.id,
      allocation: "5000",
      totalExpenditure: "500",
      allocations: {
        create: [{ category: "FOOD", amount: "500", date: new Date() }],
      },
    },
  });
  console.log(
    `   ✓ Created report ${report.id} with status: "${report.status}"`
  );
  if (report.status !== "DRAFT") {
    throw new Error(`Expected DRAFT, got ${report.status}`);
  }
  if (report.submittedAt !== null) {
    throw new Error("submittedAt should be null for DRAFT reports");
  }
  console.log();

  // 3. Update report to SUBMITTED (simulating the submit endpoint)
  console.log("2️⃣  Submitting report (DRAFT → SUBMITTED)...");
  const submitted = await prisma.monthlyReport.update({
    where: { id: report.id },
    data: {
      status: "SUBMITTED",
      submittedAt: new Date(),
    },
  });
  console.log(
    `   ✓ Submitted report with new status: "${submitted.status}"`
  );
  if (submitted.status !== "SUBMITTED") {
    throw new Error(`Expected SUBMITTED, got ${submitted.status}`);
  }
  if (submitted.submittedAt === null) {
    throw new Error("submittedAt should be set for SUBMITTED reports");
  }
  console.log();

  // 4. Verify the locking guard logic (isReportLocked)
  console.log("3️⃣  Testing isReportLocked guard...");
  // Import guard for testing
  const { isReportLocked } = await import("@/lib/api-guards");

  try {
    // Should NOT throw: DRAFT is in allowedStatuses
    isReportLocked("DRAFT", ["DRAFT"]);
    console.log("   ✓ DRAFT status allowed for editing");
  } catch (e) {
    throw new Error("DRAFT should be allowed for editing");
  }

  try {
    // Should throw: SUBMITTED is not in allowedStatuses
    isReportLocked("SUBMITTED", ["DRAFT"]);
    throw new Error("SUBMITTED should NOT be allowed for editing");
  } catch (e) {
    if (e instanceof Error && e.message.includes("locked")) {
      console.log("   ✓ SUBMITTED status correctly locked for editing");
    } else {
      throw e;
    }
  }

  console.log();
  console.log("✅ All locking tests passed!\n");
  console.log("Summary:");
  console.log("  • New reports are created as DRAFT");
  console.log("  • DRAFT reports can transition to SUBMITTED");
  console.log("  • SUBMITTED reports are locked (cannot edit)");
  console.log(
    "\nNext: These guards are enforced in the API endpoints. Once auth works,"
  );
  console.log("supervisors won't be able to submit again or edit after SUBMITTED.");
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});

./scripts/createTestUser.ts
import { prisma } from "@kinderz/db";
import bcrypt from "bcryptjs";

async function main() {
  const user = await prisma.user.create({
    data: {
      email: "test@example.com",
      password: await bcrypt.hash("test1234", 10),
      name: "Test User",
      role: "ECD_USER",
      isActive: true,
    },
  });

  console.log("✅ Test user created:", user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
./scripts/testLogin.ts


async function main() {
  const res = await fetch("http://localhost:3000/api/auth/sign-in", {
      method: "POST",
          headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                    email: "test@example.com",
                          password: "test1234",
                              }),
                                });

                                  const data = await res.json();
                                    console.log("Login response:", data);
                                    }

                                    main();
                                    ./app/databaseCheck/page.tsx
import { prisma } from "@kinderz/db";

export default async function Page() {
  // Minimal test: count users table or any model
  let count = 0;
  try {
    count = await prisma.user.count();
    console.log("User count:", count);
  } catch (err) {
    console.error("Prisma DB connection error:", err);
  }

  return <div>Hello — Users in DB: {count}</div>;
}
./app/layout.tsx
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Tinyiko | ECD Management System",
  description: "Financial and administrative management for Early Childhood Development centers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Wrapping the entire app in the SessionProvider 
            allows any component to use the useSession() hook. */}
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}./app/api/monthly-reports/route.ts
// import { prisma } from "@kinderz/db";
// import type { DocumentCategory } from "@prisma/client";
// import {
//   requireSession,
//   requireRole,
//   requireCenterAccess,
//   errorResponse,
//   ApiError,
// } from "@/lib/api-guards";

// // Input types used for validation and clarity
// // category is narrowed to the Prisma-generated enum
// // Amount/date are also typed appropriately
// // We'll still validate on receipt to protect against bad JSON.

// type AllocationInput = {
//   category: DocumentCategory;
//   amount: number | string;
//   date: string; // ISO date string
// };

// export async function POST(req: Request) {
//   try {
//     // 1. Authentication & authorization
//     const session = await requireSession();
//     requireRole(session, ["SUPERVISOR", "ECD_USER"]);

//     // 2. Parse payload
//     const body = await req.json();
//     const {
//       year,
//       month,
//       ecdCenterId,
//       allocation,
//       salariesExpense = 0,
//       foodExpense = 0,
//       overheadsExpense = 0,
//       otherExpense = 0,
//       // we don't trust the incoming JSON, so coerce into the correct type
//       allocations: rawAllocations,
//       attendanceCount,
//       childrenFunded,
//       notes,
//       signatureUrl,
//     } = body; 

//     const allocations: AllocationInput[] = Array.isArray(rawAllocations)
//       ? // perform basic runtime check on each element
//         rawAllocations.map((a) => {
//           // ensure category is one of the enum values, otherwise default to OTHER
//           const cat = a.category as DocumentCategory;
//           const allowed: DocumentCategory[] = [
//             "FOOD",
//             "SALARIES",
//             "OVERHEADS",
//             "BANK_STATEMENT",
//             "FINANCIAL_REPORT",
//             "AFFIDAVIT",
//             "OTHER",
//           ];
//           return {
//             category: allowed.includes(cat) ? cat : "OTHER",
//             amount: a.amount,
//             date: a.date,
//           };
//         })
//       : [];

//     // 3. Basic validation
//     if (
//       year === undefined ||
//       month === undefined ||
//       !ecdCenterId ||
//       allocation === undefined
//     ) {
//       throw new ApiError(400, "Missing required fields");
//     }
//     if (month < 1 || month > 12) {
//       throw new ApiError(400, "Month must be between 1 and 12");
//     }

//     // 4. Enforce center-level access
//     // also load center to verify funding status
//     const center = await prisma.ecdCenter.findUnique({ where: { id: ecdCenterId } });
//     if (!center) {
//       throw new ApiError(404, "ECD center not found");
//     }
//     if (center.fundingStatus === "DISCONTINUED") {
//       throw new ApiError(403, "Center is closed");
//     }
//     requireCenterAccess(session, ecdCenterId);

//     // OPTIONAL: prevent ECD_USERs from calling via desktop/web client by checking user-agent
//     if (session.user.role === "ECD_USER") {
//       const ua = req.headers.get("user-agent") || "";
//       const isWeb = /Mozilla|Chrome|Safari/i.test(ua);
//       if (isWeb) {
//         throw new ApiError(403, "ECD users must use mobile app");
//       }
//     }

//     // 5. Compute totals and perform server-side sanity checks
//     // const totalExpenditure = allocations.reduce(
//     //   (sum: number, a: AllocationInput) => sum + parseFloat(String(a.amount)),
//     //   0
//     // );

//     // 5. Compute totals and perform server-side sanity checks
// const totalExpenditure = allocations.reduce(
//   (sum: number, a: AllocationInput) => sum + parseFloat(String(a.amount)),
//   0
// );

//     // 6. Create report in DRAFT status, allowing supervisor to edit before final submission
//     // status: "DRAFT" means the supervisor can still modify this report.
//     // When they click "Submit", the status moves to "SUBMITTED" and locks further edits.
//     const report = await prisma.monthlyReport.create({
//       data: {
//         year,
//         month,
//         ecdCenterId,
//         submittedById: session.user.id,
//         allocation: allocation.toString(),
//         totalExpenditure: totalExpenditure.toString(),
//         salariesExpense: salariesExpense?.toString(),
//         foodExpense: foodExpense?.toString(),
//         overheadsExpense: overheadsExpense?.toString(),
//         otherExpense: otherExpense?.toString(),
//         attendanceCount,
//         childrenFunded,
//         notes,
//         signatureUrl,
//         status: "DRAFT", // New reports start in DRAFT; supervisor can edit freely
//         // submittedAt remains null until the supervisor explicitly submits (status -> SUBMITTED)
//         allocations: {
//           create: allocations.map((a: AllocationInput) => ({
//             category: a.category,
//             amount: a.amount.toString(),
//             date: new Date(a.date),
//           })),
//         },
//       },
//     });

//     return new Response(JSON.stringify(report), {
//       status: 201,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (error) {
//     return errorResponse(error);
//   }
// }







// second file; 
// export async function POST(req: Request) {
//   try {
//     const session = await getSession();

//     // 1. Guard: Check Authentication & Role
//     if (!session || session.user.role !== "SUPERVISOR") {
//       return new NextResponse("Unauthorized: Only supervisors can submit reports.", { status: 401 });
//     }

//     // 2. Parse & Validate Body
//     const body = await req.json();
//     const validation = monthlyReportSchema.safeParse(body);

//     if (!validation.success) {
//       return NextResponse.json({ 
//         error: "Invalid report data", 
//         details: validation.error.format() 
//       }, { status: 400 });
//     }

//     const data = validation.data;
//     const { centerId, totalExpenditure } = body; // These are extra fields from your form

//     if (!centerId) {
//       return new NextResponse("Center ID is required", { status: 400 });
//     }

//     // 3. Database Operation
//     // We use an upsert or create depending on if a report for this month already exists
//     const report = await prisma.monthlyReport.create({
//       data: {
//         centerId,
//         year: data.year,
//         month: data.month,
//         daysOpen: data.days,
        
//         // Expenses
//         salariesExpense: data.salariesExpense,
//         foodExpense: data.foodExpense,
//         overheadsExpense: data.overheadsExpense,
        
//         // Metadata
//         status: data.status || "SUBMITTED",
//         notes: data.notes || "",
        
//         // Storing the calculated total for quick audit views
//         totalExpenses: totalExpenditure,
        
//         // Tracking who created it
//         createdBy: session.user.id,
//       },
//     });

//     return NextResponse.json(report, { status: 201 });
//   } catch (error: any) {
//     console.error("[MONTHLY_REPORT_POST]", error);
    
//     // Check for unique constraint (e.g., if a report for this month/year already exists)
//     if (error.code === 'P2002') {
//       return new NextResponse("A report for this month and year already exists.", { status: 409 });
//     }

//     return new NextResponse("Internal Server Error", { status: 500 });
//   }
// }






import { NextResponse } from "next/server";
import { prisma } from "@kinderz/db";
import { monthlyReportSchema } from "@/lib/validations/monthly-report";
import { 
  requireSession, 
  requireRole, 
  requireCenterAccess, 
  errorResponse, 
  ApiError 
} from "@/lib/api-guards";

export async function POST(req: Request) {
  try {
    // 1. High-Security Guards (From File 1)
    const session = await requireSession();
    requireRole(session, ["SUPERVISOR", "ECD_USER"]);

    // 2. Schema Validation (From File 2)
    const body = await req.json();
    const validation = monthlyReportSchema.safeParse(body);

    if (!validation.success) {
      throw new ApiError(400, "Invalid data structure");
    }

    const data = validation.data;
    const { ecdCenterId, totalExpenditure } = body;

    // 3. Center Access Check (Crucial for South African NPO compliance)
    const center = await prisma.ecdCenter.findUnique({ where: { id: ecdCenterId } });
    if (!center || center.fundingStatus === "DISCONTINUED") {
      throw new ApiError(403, "Center is inactive or not found");
    }
    requireCenterAccess(session, ecdCenterId);

    // 4. Create as DRAFT (Allows supervisor to fix mistakes)
    const report = await prisma.monthlyReport.create({
      data: {
        ecdCenterId,
        year: data.year,
        month: data.month,
        days: data.days,
        salariesExpense: data.salariesExpense.toString(),
        foodExpense: data.foodExpense.toString(),
        overheadsExpense: data.overheadsExpense.toString(),
        totalExpenditure: totalExpenditure.toString(),
        allocation: body.allocation, // From the form or fetched
        status: "DRAFT", 
        submittedById: session.user.id,

        attendanceCount: data.attendanceCount,
        childrenFunded: data.childrenFunded,
        notes: data.notes,
    



      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    // Uses your helper from File 1 to keep responses consistent
    return errorResponse(error);
  }
}





./app/api/invites/route.ts
/**
 * @file apps/web/app/api/invites/route.ts
 * @description Centralized Invitation API. 
 * Handles creation, validation (GET), and consumption (PATCH) of invites.
 * Enforces the Provincial/District/Center hierarchy.
 */

import { prisma } from "@kinderz/db";
import { requireSession, requireRole, ApiError, errorResponse } from "@/lib/api-guards";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    // 1. Authenticate the user and ensure they have invitation privileges
    const session = await requireSession();
    requireRole(session, ["ADMIN", "PROVINCIAL", "SUPERVISOR"]);

    // 2. Extract and sanitize payload
    const body = await req.json();
    const { email, role, provinceId, districtId, ecdCenterId } = body;
    const cleanEmail = email?.toLowerCase().trim();

    if (!cleanEmail || !role) throw new ApiError(400, "Email and role are required");

    // 3. Hierarchical Constraint Logic
    // -------------------------------------------------------------------------
    
    if (role === "PROVINCIAL") {
      if (!provinceId) throw new ApiError(400, "provinceId required for PROVINCIAL invites");
      // Prevent a Provincial from creating another Provincial in a different province
      if (session.user.role === "PROVINCIAL" && session.user.provinceId !== provinceId) {
        throw new ApiError(403, "Cannot invite PROVINCIAL outside your province");
      }
    } 
    
    else if (role === "AUDITOR") {
      if (!districtId) throw new ApiError(400, "districtId required for AUDITOR invites");
      const district = await prisma.district.findUnique({ where: { id: districtId } });
      if (!district) throw new ApiError(404, "District not found");
      // Prevent Provincial from inviting an Auditor to a district they don't oversee
      if (session.user.role === "PROVINCIAL" && district.provinceId !== session.user.provinceId) {
        throw new ApiError(403, "Cannot invite AUDITOR outside your province");
      }
    } 
    
    else if (role === "SUPERVISOR" || role === "ECD_USER") {
      if (!ecdCenterId) throw new ApiError(400, "ecdCenterId required for Center-based invites");
      const center = await prisma.ecdCenter.findUnique({
        where: { id: ecdCenterId },
        include: { district: true },
      });
      if (!center) throw new ApiError(404, "ECD center not found");
      
      // Enforce Supervisor scope
      if (session.user.role === "SUPERVISOR" && center.id !== session.user.ecdCenterId) {
        throw new ApiError(403, "Can only invite for your own center");
      }
      // Enforce Provincial scope
      if (session.user.role === "PROVINCIAL" && center.district.provinceId !== session.user.provinceId) {
        throw new ApiError(403, "Cannot invite for center outside your province");
      }
    }

    // 4. Generate Security Token and Expiration (7 days)
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // 5. Save to Database
    const invite = await prisma.invite.create({
      data: { 
        email: cleanEmail, 
        role, 
        provinceId, 
        districtId, 
        ecdCenterId, 
        token, 
        expiresAt 
      },
    });

    // 6. Return the invite object + a generated link for the UI to display/copy
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/signup?token=${token}`;
    
    return NextResponse.json({ ...invite, inviteLink }, { status: 201 });

  } catch (err) {
    return errorResponse(err);
  }
}

/**
 * GET /api/invites?token=xyz
 * Public endpoint used by the Signup page to verify the invite exists and is valid.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    if (!token) throw new ApiError(400, "Token is required");

    const invite = await prisma.invite.findUnique({ where: { token } });
    
    // Check if valid, unused, and not expired
    if (!invite || invite.used || invite.expiresAt < new Date()) {
      throw new ApiError(404, "Invite not found, already used, or expired");
    }

    return NextResponse.json(invite, { status: 200 });
  } catch (err) {
    return errorResponse(err);
  }
}

/**
 * PATCH /api/invites
 * Private endpoint called during user registration to "burn" the token.
 */
export async function PATCH(req: Request) {
  try {
    const { token } = await req.json();
    if (!token) throw new ApiError(400, "Token is required");

    const invite = await prisma.invite.update({
      where: { token },
      data: { used: true },
    });

    return NextResponse.json(invite, { status: 200 });
  } catch (err) {
    return errorResponse(err);
  }
}./app/api/attendance/route.ts
import { auth } from "@/lib/betterAuth";
import { prisma } from "@kinderz/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const attendanceSchema = z.object({
  date: z.string(), // "YYYY-MM-DD"
  records: z.array(   
    z.object({
      childId: z.string(),
      status: z.enum(["PRESENT", "ABSENT", "SICK"]),
      notes: z.string().optional(),
    })
  ),
});

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  const user = session?.user;
  const role = user?.role;
  const ecdCenterId = user?.ecdCenterId;

  // Strict Role Check - Ensure session exists and user is assigned to a center
  if (!session || !user || role !== "ECD_USER" || !ecdCenterId) {
    return NextResponse.json(
      { error: "Unauthorized: Only ECD Users can mark attendance" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { date, records } = attendanceSchema.parse(body);
    
    // Ensure the date is handled as a UTC midnight date to avoid timezone shifts
    const attendanceDate = new Date(date);

    const results = await prisma.$transaction(
      records.map((record) =>
        prisma.attendance.upsert({
          where: {
            childId_date: {
              childId: record.childId,
              date: attendanceDate,
            },
          },
          update: {
            status: record.status, // Directly saving the string enum
            notes: record.notes ?? "",
            markedById: user.id,
          },
          create: {
            childId: record.childId,
            date: attendanceDate,
            status: record.status,
            notes: record.notes ?? "",
            ecdCenterId: ecdCenterId,
            markedById: user.id,
          },
        })
      )
    );

    return NextResponse.json({ success: true, count: results.length });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Attendance Sync Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}./app/api/children/route.ts
import { auth } from "@/lib/betterAuth";
import { prisma } from "@kinderz/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  
  const ecdCenterId = session?.user?.ecdCenterId;
  const role = session?.user?.role;

  // Allow both roles to SEE the children (Read-only)
  if (!session || !ecdCenterId || !["ECD_USER", "SUPERVISOR"].includes(role || "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const children = await prisma.child.findMany({
      where: { ecdCenterId: ecdCenterId },
      orderBy: { fullName: 'asc' }, // Ensure 'name' matches your schema field!
    });

    return NextResponse.json(children);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch children" }, { status: 500 });
  }
}./app/api/documents/route.ts
import { prisma } from "@kinderz/db";
import {
  requireSession,
  requireRole,
  requireCenterAccess,
  errorResponse,
  ApiError,
} from "@/lib/api-guards";

// generic document upload endpoint used by mobile/web supervisory roles
export async function POST(req: Request) {
  try {
    const session = await requireSession();
    requireRole(session, ["SUPERVISOR", "ECD_USER"]);

    const body = await req.json();
    const { filename, url, category, ecdCenterId, reportId, monthlyReportId, comment } = body;
    if (!filename || !url || !category || !ecdCenterId) {
      throw new ApiError(400, "Missing required fields");
    }
    requireCenterAccess(session, ecdCenterId);

    // Sanitize and validate comment: replace tabs with spaces, trim, enforce max length
    let sanitizedComment: string | undefined = undefined;
    if (comment !== undefined && comment !== null) {
      const asString = String(comment).replace(/\t+/g, " ").trim();
      const MAX_LEN = 1000; // 1k chars max to avoid DB bloat
      if (asString.length > MAX_LEN) {
        throw new ApiError(400, `Comment is too long (max ${MAX_LEN} characters)`);
      }
      sanitizedComment = asString || undefined;
    }

    const record = await prisma.document.create({
      data: {
        filename,
        url,
        category,
        ecdCenterId,
        reportId: reportId || undefined,
        monthlyReportId: monthlyReportId || undefined,
        comment: sanitizedComment,
        uploadedById: session.user.id,
      },
    });

    return new Response(JSON.stringify(record), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
./app/register/[token]/page.tsx
import { prisma } from "@kinderz/db";
import { notFound } from "next/navigation";
import RegisterFormClient from "../RegisterFormClient";

export default async function RegisterPage({ params }: { params: { token: string } }) {
  const invite = await prisma.invite.findUnique({
    where: { token: params.token },
  });

  // Security check for invite validity: must exist, not be used, and not be expired
  if (!invite || invite.used || (invite.expiresAt && invite.expiresAt < new Date())) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Complete Registration</h1>
          <p className="text-slate-500 mt-2">
            Joining as <span className="font-semibold text-blue-600">{invite.role}</span>
          </p>
          <p className="text-xs text-slate-400 font-mono mt-1 italic">{invite.email}</p>
        </div>

        <RegisterFormClient 
          email={invite.email} 
          token={invite.token} 
          role={invite.role}
          provinceId={invite.provinceId}    
          districtId={invite.districtId} 
          ecdCenterId={invite.ecdCenterId}   
        />  
      </div>
    </div>
  );
}./app/register/page.tsx
import { prisma } from "@kinderz/db";
import RegisterFormClient from "./RegisterFormClient";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  // Await searchParams in Next.js 14+ for safety
  const token = searchParams?.token;

  // 1. Immediate check if token exists in URL
  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-6">
        <div className="p-10 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-sm">
          <div className="text-3xl mb-4">🎫</div>
          <p className="font-medium text-slate-800">Missing Invitation</p>
          <p className="text-sm mt-1 text-slate-500">Please use the secure link sent to your email to complete registration.</p>
        </div>
      </div>
    );
  }

  // 2. Database validation (Server-side)
  // We fetch the invite and include the District/Province name to show on the UI
  const invite = await prisma.invite.findUnique({
    where: { token, used: false },
  });

  // 3. Handle invalid/expired tokens before loading the form
  if (!invite || invite.expiresAt < new Date()) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
        <div className="bg-white p-8 rounded-2xl border border-red-100 max-w-md text-center shadow-xl">
          <div className="mb-4 text-4xl">⚠️</div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">Invalid or Expired Invite</h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            This invitation link is no longer valid. It may have already been used 
            or the 7-day security window has passed. 
          </p>
          <div className="mt-6 pt-6 border-t border-slate-100">
             <p className="text-xs text-slate-400">Please contact your System Administrator for a new invitation.</p>
          </div>
        </div>
      </div>
    );
  }

  // 4. Load the Client Form if token is valid
  // We pass the context (email/role) so the user doesn't have to re-type their email
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Create Account
        </h2>
        <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-widest border border-blue-100">
          {invite.role} Portal
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-8 shadow-2xl rounded-3xl border border-slate-100">
          <RegisterFormClient 
            token={token} 
            email={invite.email} 
            role={invite.role} 
          />
        </div>
        
        <p className="mt-8 text-center text-xs text-slate-400">
          Secure Registration for Tinyiko &copy; {new Date().getFullYear()}
        </p>
      </div> 
    </div>
  );
}./app/register/RegisterFormClient.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
// Updated to match the renamed server action
import { registerUser, type RegisterActionResponse } from "@/actions/register";

interface Props {
  token: string;
  email: string;
  role: string;
  provinceId?: string | null;
  districtId?: string | null;
  ecdCenterId?: string | null;
}

export default function RegisterFormClient({ token, email, role }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    // Calling the renamed action here
    const result: RegisterActionResponse = await registerUser(formData);

    if (result.success) {
      router.push("/login?registered=true");
    } else {
      setError(result.error || "An unexpected error occurred.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      <div className="p-8 bg-blue-600 text-white">
        <h1 className="text-2xl font-bold tracking-tight">Complete Registration</h1>
        <p className="text-blue-100 text-sm mt-2 font-medium">
          Joining as <span className="underline decoration-blue-300">{role}</span> for {email}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <input type="hidden" name="token" value={token} />
        
        {error && (
          <div className="p-3 text-sm bg-red-50 border border-red-100 text-red-600 rounded-lg font-medium text-center">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
            Full Name
          </label>
          <input
            name="name"
            type="text"
            required
            placeholder="e.g. Sipho Dlamini"
            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-800"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
            Set Password
          </label>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="••••••••"
            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-800"
          />
          <p className="text-[10px] text-slate-400 mt-2 italic text-right">Min. 8 characters</p>
        </div>

        <button
          disabled={loading}
          type="submit"
          className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-blue-600 transition-all disabled:opacity-50 shadow-lg active:scale-[0.98] flex justify-center items-center"
        >
          {loading ? "Finalizing Account..." : "Create Account"}
        </button>
      </form>
    </div>
  );
}./app/login/page.tsx
"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRegistered = searchParams.get("registered") === "true";
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: authError } = await authClient.signIn.email({
      email: email.toLowerCase().trim(),
      password,
      callbackURL: "/dashboard", 
    });

    if (authError) {
      setError(authError.message || "Invalid email or password");
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900">Tinyiko</h1>
          <p className="text-gray-500 mt-2 text-sm">Sign in to manage your ECD Center or Audit</p>
        </div>

        {isRegistered && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl font-medium text-center">
            Account activated! You can now sign in.
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="admin@tinyiko.co.za"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-900 text-white py-4 rounded-xl font-bold hover:bg-blue-800 transition shadow-lg disabled:bg-gray-400"
          >
            {loading ? "Authenticating..." : "Sign In"} 
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <Link href="/" className="text-sm font-medium text-gray-400 hover:text-blue-900">← Back to home</Link>
          <p className="mt-4 text-[11px] text-gray-400 uppercase tracking-tighter">Access restricted to authorized DSD personnel and ECD Supervisors.</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-400">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}./app/dashboard/layout.tsx
import { ReactNode } from "react";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-bold tracking-tighter text-blue-400">TINYIKO</h2>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">ECD Management</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link href="/dashboard" className="block px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
            Overview
          </Link>
          <Link href="/dashboard/reports" className="block px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
            Quarterly Reports
          </Link>
          <Link href="/dashboard/children" className="block px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
            Children Registry
          </Link>
          <Link href="/dashboard/attendance" className="block px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
            Attendance
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Link href="/settings" className="text-sm text-slate-400 hover:text-white">
            Account Settings
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <h1 className="font-semibold text-slate-700">Dashboard</h1>
          <div className="flex items-center gap-4">
             {/* Profile/Logout will go here */}
             <div className="h-8 w-8 rounded-full bg-blue-100 border border-blue-200" />
          </div>
        </header>

        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}./app/dashboard/page.tsx
import { auth } from "@/lib/betterAuth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@kinderz/db";

export default async function DashboardBridge() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const role = session.user.role;

  // 1. Role-Based Redirection
  if (role === "ADMIN") redirect("/admin"); 
  if (role === "PROVINCIAL") redirect("/provincial");
  if (role === "AUDITOR") redirect("/auditor");

  // 2. Data Fetching for SUPERVISOR / ECD_USER
  // Prisma "where" clauses don't like "null". We use "undefined" to skip a filter.
  const centers = await prisma.ecdCenter.findMany({
    where: {
      ...(role === "AUDITOR" ? { districtId: session.user.districtId || undefined } : {}),
      ...(role === "PROVINCIAL" ? { provinceId: session.user.provinceId || undefined } : {}),
      ...(role === "SUPERVISOR" || role === "ECD_USER" 
        ? { id: session.user.ecdCenterId || undefined } 
        : {}),
    },
  });

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome, {session.user.name}</h1>
          <p className="text-slate-500 uppercase text-xs font-bold tracking-widest mt-1">
            Access Level: <span className="text-blue-600">{role}</span>
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {centers.length > 0 ? (
          centers.map((center) => (
            <div key={center.id} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-bold text-slate-800">{center.name}</h2>
              {/* Changed emisNumber to basNumber based on your schema error */}
              <p className="text-sm text-slate-500">BAS: {center.basNumber || "Not Assigned"}</p>
              <div className="mt-4 flex gap-3">
                <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold">
                  View Statements
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 bg-blue-50 border border-blue-100 rounded-2xl text-center">
            <p className="text-blue-800 font-medium">No ECD Centers linked to your account yet.</p>
          </div>
        )}
      </div>  
    </div>
  );
}./app/page.tsx
import { prisma } from "@kinderz/db";

export default async function Page() {
  // Minimal test: count users table or any model
  let count = 0;
  try {
    count = await prisma.user.count();
    console.log("User count:", count);
  } catch (err) {
    console.error("Prisma DB connection error:", err);
  }

  return <div>Hello — Users in DB: {count}</div>;
}
./app/(roles)/auditor/AuditorDashboardClient.tsx
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
}./app/(roles)/auditor/layout.tsx
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getSession } from "@/lib/get-session";
import { LayoutDashboard, FileCheck, Map, ShieldCheck } from "lucide-react";

export default async function AuditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Role Protection: Only AUDITOR role allowed
  if (!session || session.user.role !== "AUDITOR") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation Header */}
      <nav className="border-b bg-slate-900 text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <span className="text-xl font-black tracking-tighter text-blue-400">
              TINYIKO <span className="text-white font-light text-sm tracking-normal ml-1">AUDIT</span>
            </span>
            
            <div className="hidden md:flex items-center gap-6 text-sm font-medium">
              <a href="/auditor/dashboard" className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </a>
              <a href="/auditor/reports" className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                <FileCheck className="h-4 w-4" /> Reviews
              </a>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">District Auditor</p>
              <p className="text-sm font-medium opacity-90">{session.user.email}</p>
            </div>
            <div className="h-8 w-[1px] bg-slate-700 mx-2" />
            <SignOutButton />
          </div>
        </div>
      </nav>

      {/* Audit Context Banner */}
      <div className="bg-blue-600 text-white py-2 px-4 text-center text-xs font-bold uppercase tracking-widest">
        Official Auditor Portal — Fiscal Year 2026/27
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto py-8 px-4">
        {children}
      </main>

      <footer className="border-t bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-xs">
          &copy; 2026 Tinyiko Financial ECD Oversight System. All rights reserved.
        </div>
      </footer>
    </div>
  );
}./app/(roles)/auditor/page.tsx
import { auth } from "@/lib/betterAuth";
import { headers } from "next/headers";
import { prisma } from "@kinderz/db";
import { redirect } from "next/navigation";
import AuditorDashboardClient from "./AuditorDashboardClient";

export default async function AuditorDashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // 1. Security Bouncer
  if (!session || session.user.role !== "AUDITOR") {
    redirect("/login");
  }

  const districtId = session.user.districtId;

  // 2. Handle missing district assignment
  if (!districtId) {
    return (
      <div className="p-6 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg max-w-2xl mx-auto mt-10">
        <h2 className="font-bold text-lg">District Assignment Required</h2>
        <p>Your account is not yet assigned to a specific district. Please contact your Provincial Admin to link your profile to a territory.</p>
      </div>
    );
  }

  // 3. Data Fetching
  const district = await prisma.district.findUnique({
    where: { id: districtId },
    include: {
      _count: { select: { ecdCenters: true } }
    }
  });

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-800">District Auditor Portal</h1>
        <p className="text-slate-500">
          Territory: <span className="font-semibold text-blue-600">{district?.name || "Unknown District"}</span>
        </p>
      </header>

      {/* Hand off interactivity to the Client Component */}
      <AuditorDashboardClient 
        centerCount={district?._count.ecdCenters || 0} 
        districtName={district?.name || "Assigned District"} 
      />
    </div>
  );
}./app/(roles)/provincial/layout.tsx
import { auth } from "@/lib/betterAuth"; 
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ProvincialLayout({ children }: { children: React.ReactNode }) {
  // headers() in Next.js 14 doesn't technically need await, but better-auth handles it fine
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Security Gate: Ensure user is logged in and has the PROVINCIAL role
  if (!session || session.user.role !== "PROVINCIAL") {
    redirect("/login");
  }

  // Define the user object from the session
  // We use the 'any' cast here only if the betterAuth types haven't refreshed in your IDE yet
  const user = session.user as any;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 bg-slate-900 text-white hidden md:block border-r border-slate-800">
        <div className="p-6">
          <h1 className="text-xl font-bold text-white tracking-tight">
            Tinyiko <span className="text-blue-400">Provincial</span>
          </h1>
          <p className="text-[10px] text-slate-400 uppercase mt-1 font-semibold tracking-widest">
            {/* Now correctly accessing the property on the user object */}
            Province Lead Management
          </p>
        </div>
        
        <nav className="mt-4 px-4 space-y-1">
          <Link href="/provincial" className="block px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition">
            Overview
          </Link>
          <Link href="/provincial/districts" className="block px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition">
            Districts
          </Link>
          <Link href="/provincial/centers" className="block px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition">
            ECD Centers
          </Link>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <h2 className="text-sm font-semibold text-slate-600">Provincial Dashboard</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-700">{user.name || "User"}</span>
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white uppercase">
              {user.name?.charAt(0) || "U"}
            </div>
          </div>
        </header>

        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}./app/(roles)/provincial/page.tsx
import { auth } from "@/lib/betterAuth";
import { headers } from "next/headers";
import { prisma } from "@kinderz/db";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import DistrictCard from "@/components/cards/DistrictCard";

export default async function ProvincialDashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // 1. Security Bouncer
  if (!session || !["ADMIN", "PROVINCIAL"].includes(session.user.role || "")) {
    redirect("/login");
  }

  const role = session.user.role;
  const provinceId = session.user.provinceId as string | undefined;

  // Safety check for Provincial users missing an ID
  if (role === "PROVINCIAL" && !provinceId) {
    return (
      <div className="p-6 bg-red-50 text-red-700 border border-red-200 rounded-lg">
        Error: Your account is not linked to a province. Please contact System Admin.
      </div>
    );
  }

  // 2. Data Filters (Type-safe)
  const districtFilter: Prisma.DistrictWhereInput = (role === "ADMIN" || !provinceId) 
    ? {} 
    : { provinceId };

  const centerFilter: Prisma.EcdCenterWhereInput = (role === "ADMIN" || !provinceId) 
    ? {} 
    : { district: { provinceId } };

  const auditorFilter: Prisma.UserWhereInput = (role === "ADMIN" || !provinceId)
    ? { role: "AUDITOR" }
    : { role: "AUDITOR", district: { provinceId } };

  // 3. Parallel Data Fetching
  const [districtCount, centerCount, auditorCount, districts] = await Promise.all([
    prisma.district.count({ where: districtFilter }),
    prisma.ecdCenter.count({ where: centerFilter }),
    prisma.user.count({ where: auditorFilter }),
    prisma.district.findMany({
      where: districtFilter,
      include: {
        // FIXED: Changed 'users' to 'auditors' to match your schema
        auditors: {
          where: { role: "AUDITOR" },
          select: { name: true, email: true }
        }
      },
      orderBy: { name: 'asc' }
    })
  ]);

  return (
    <div className="p-6 space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-800 uppercase tracking-tight">
          {role === "ADMIN" ? "National Overview" : `${provinceId?.replace(/-/g, ' ')} Registry`}
        </h1>
        <p className="text-slate-500">
          {role === "ADMIN" 
            ? "Monitoring all 9 provinces across South Africa." 
            : "Monitoring performance and managing district auditors."}
        </p>
      </header>

      {/* --- STATS SECTION --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium uppercase tracking-tight">Districts</p>
          <p className="text-3xl font-bold text-blue-600">{districtCount}</p>
        </div>

        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium uppercase tracking-tight">Active ECD Centers</p>
          <p className="text-3xl font-bold text-green-600">{centerCount}</p>
        </div>

        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium uppercase tracking-tight">Assigned Auditors</p>
          <p className="text-3xl font-bold text-purple-600">{auditorCount}</p>
        </div>
      </div>

      {/* --- DISTRICT MANAGEMENT SECTION --- */}
      <section className="space-y-4">
        <div className="flex justify-between items-end border-b border-slate-200 pb-2">
          <h2 className="text-xl font-bold text-slate-800">District Oversight</h2>
          <span className="text-sm text-slate-500">{districts.length} Territories</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {districts.map((district) => (
            <DistrictCard 
              key={district.id}
              districtId={district.id}
              name={district.name}
              // FIXED: Changed district.users to district.auditors
              auditor={district.auditors[0] || null}
            />
          ))} 
        </div>
      </section> 
    </div>
  );
} ./app/(roles)/supervisor/layout.tsx
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getSession } from "@/lib/get-session";
import { Home, UploadCloud, AlertCircle, Building2 } from "lucide-react";

export default async function SupervisorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Role Protection: Only SUPERVISOR role allowed
  if (!session || session.user.role !== "SUPERVISOR") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="border-b bg-white p-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg text-white">
                <Building2 className="h-5 w-5" />
              </div>
              <span className="font-bold text-slate-900 text-lg">Tinyiko</span>
            </div>

            <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500">
              <a href="/supervisor/dashboard" className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                <Home className="h-4 w-4" /> My Center
              </a>
              <a href="/supervisor/upload" className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                <UploadCloud className="h-4 w-4" /> Submit Evidence
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right border-r pr-4 hidden sm:block">
              <p className="text-xs font-bold text-slate-400">SUPERVISOR</p>
              <p className="text-sm font-bold text-slate-800">{session.user.email}</p>
              <p className="text-[10px] text-blue-600 font-mono">ID: {session.user.ecdCenterId}</p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </nav>

      {/* Notification Area for Findings */}
      <div className="bg-amber-50 border-b border-amber-100 py-2.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-amber-800 text-xs font-bold uppercase tracking-wide">
          <AlertCircle className="h-4 w-4" />
          Ensure all audit findings are resolved before the end of the month.
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto py-10 px-4">
        {children}
      </main>
    </div>
  );
}./app/(roles)/admin/page.tsx
import { auth } from "@/lib/betterAuth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@kinderz/db";
import InviteUserModal from "@/components/modals/InviteUserModal";

export default async function AdminDashboard() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // Combine your specific provincial logic with general counts
  const [userCount, centerCount, pendingInvites, provincialCount] = await Promise.all([
    prisma.user.count(),
    prisma.ecdCenter.count(),
    prisma.invite.count({ where: { used: false } }),
    prisma.user.count({ where: { role: "PROVINCIAL" } }),
  ]);

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Admin Command Center</h1>
          <p className="text-slate-500 mt-1">Managing the Tinyiko National Network</p>
        </div>
        {/* We use the modal here instead of just a Link */}
        <InviteUserModal openerRole="ADMIN" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Provincials</p>
          <p className="text-4xl font-bold text-blue-600 mt-2">{provincialCount}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Users</p>
          <p className="text-4xl font-bold text-slate-900 mt-2">{userCount}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Centers</p>
          <p className="text-4xl font-bold text-slate-900 mt-2">{centerCount}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pending Invites</p>
          <p className="text-4xl font-bold text-orange-500 mt-2">{pendingInvites}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
        <p className="text-slate-400 italic">National activity logs and audit flags will appear here.</p>
      </div>
    </div>
  );
}