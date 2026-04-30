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
}