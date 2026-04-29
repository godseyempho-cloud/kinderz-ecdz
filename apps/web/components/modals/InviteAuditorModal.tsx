"use client"; // Interactive component for browser use

import { useState } from "react";
import { createInvite } from "@/actions/invite"; // Server action for DB logic

interface InviteModalProps {
  districtId: string; // District slug from seed
  districtName: string; // Human-readable name
  onClose: () => void; // Closes modal
}

export default function InviteAuditorModal({ districtId, districtName, onClose }: InviteModalProps) {
  const [email, setEmail] = useState(""); // Track input
  const [loading, setLoading] = useState(false); // Loading state for button
  const [isSuccess, setIsSuccess] = useState(false); // Success state UI toggle

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); // Prevent browser reload
    setLoading(true);

    const result = await createInvite({
      email,
      role: "AUDITOR",
      districtId: districtId, // Link invite to this specific territory
    });

    setLoading(true); // Keep loading true until UI updates
    if (result.success) {
      setIsSuccess(true); // Show success screen
    } else {
      setLoading(false);
      alert(result.error || "Failed to send invite"); // Basic error handling
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl transition-all">
        {!isSuccess ? (
          <>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Invite Auditor</h2>
            <p className="text-sm text-slate-500 mb-6">
              Assigning a new official for <strong>{districtName}</strong>.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1 tracking-wider">
                  Email Address
                </label>
                <input 
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="auditor@gov.za"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition shadow-sm"
                >
                  {loading ? "Sending..." : "Send Invite"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Invite Sent!</h2>
            <p className="text-sm text-slate-500 mb-6">Instructions have been sent to <br/><strong>{email}</strong></p>
            <button 
              onClick={onClose}
              className="w-full py-2 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-900 transition"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}