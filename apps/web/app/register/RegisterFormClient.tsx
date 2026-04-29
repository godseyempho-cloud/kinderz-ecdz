"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerAuditor, type RegisterActionResponse } from "@/actions/register";

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
    const result: RegisterActionResponse = await registerAuditor(formData);

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
}