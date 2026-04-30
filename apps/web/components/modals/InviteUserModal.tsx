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
}