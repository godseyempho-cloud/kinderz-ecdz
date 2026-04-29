"use client";

import { useState } from "react";

interface InviteModalProps {
  districtId: string;
  districtName: string;
  onClose: () => void;
}

export default function InviteAuditorModal({ districtId, districtName, onClose }: InviteModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/invite/auditor", {
        method: "POST",
        body: JSON.stringify({ email, districtId }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (data.success) {
        setInviteLink(data.inviteLink);
      } else {
        alert(data.error || "Failed to send invite");
      }
    } catch (err) {
      alert("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Invite District Auditor</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        <div className="p-6">
          {!inviteLink ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-slate-500">
                Assigning an auditor to <span className="font-semibold text-slate-700">{districtName}</span>.
              </p>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Auditor Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-slate-200 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="auditor@example.com"
                />
              </div>
              <button
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-slate-300"
              >
                {loading ? "Generating Invite..." : "Generate Invite Link"}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-green-50 border border-green-100 rounded-lg">
                <p className="text-sm text-green-700 font-medium italic break-all">{inviteLink}</p>
              </div>
              <p className="text-xs text-slate-500">Copy this link and send it to the auditor.</p>
              <button onClick={onClose} className="w-full border border-slate-200 py-2 rounded-lg text-slate-600 font-medium">
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 