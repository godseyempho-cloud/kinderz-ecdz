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
}