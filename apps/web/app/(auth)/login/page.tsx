/**
 * @file apps/web/app/(auth)/login/page.tsx
 * @description Universal login page for all Kinderz-ECD roles.
 * Routes users to their specific dashboard based on their role after authentication.
 */

"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const { data, error } = await authClient.signIn.email({
            email: email.toLowerCase().trim(),
            password,
        });

        if (error) {
            setError(error.message || "Invalid email or password");
            setLoading(false);
        } else {
            // Success! The session is now set. 
            // Better-Auth stores the role in the user object.
            // We redirect to the root dashboard which will handle role-based internal routing.
            router.push("/dashboard");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-blue-900">Kinderz-ECD</h1>
                    <p className="text-gray-600 text-sm">Sign in to manage your ECD Center or Audit</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input
                            type="email"
                            required
                            placeholder="name@example.com"
                            className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            required
                            placeholder="••••••••"
                            className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-900 text-white p-2 rounded font-semibold hover:bg-blue-800 transition disabled:bg-gray-400"
                    >
                        {loading ? "Authenticating..." : "Sign In"}
                    </button>
                </form>

                <div className="mt-6 text-center text-xs text-gray-500">
                    <p>Access restricted to authorized DSD personnel and ECD Supervisors.</p>
                </div>
            </div>
        </div>
    );
}