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
}