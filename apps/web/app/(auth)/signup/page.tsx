// /**
//  * @file apps/web/app/signup/page.tsx
//  * @description Signup page that consumes invitation tokens to 
//  * automatically link users to Provinces, Districts, or ECD Centers.
//  */

// "use client";

// import { useEffect, useState } from "react";
// import { useSearchParams, useRouter } from "next/navigation";
// import { authClient } from "@/lib/auth-client"; // Your Better-Auth client

// export default function SignupPage() {
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const token = searchParams.get("token");

//   const [invite, setInvite] = useState<any>(null);
//   const [loading, setLoading] = useState(!!token);
//   const [error, setError] = useState("");

//   // 1. If a token exists, verify it immediately on load
//   useEffect(() => {
//     if (token) {
//       fetch(`/api/invites?token=${token}`)
//         .then((res) => res.json())
//         .then((data) => {
//           if (data.error) throw new Error(data.error);
//           setInvite(data);
//           setLoading(false);
//         })
//         .catch((err) => {
//           setError("This invitation is invalid or has expired.");
//           setLoading(false);
//         });
//     }
//   }, [token]);

//   const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     const formData = new FormData(e.currentTarget);
//     const password = formData.get("password") as string;
//     const name = formData.get("name") as string;

//     const { data, error } = await authClient.signUp.email({
//       email: invite.email, // Locked to the invite email
//       password,
//       name,
//       // Pass metadata so Better-Auth knows where to put this user
//       data: {
//         role: invite.role,
//         provinceId: invite.provinceId,
//         districtId: invite.districtId,
//         ecdCenterId: invite.ecdCenterId,
//       },
//     });

//     if (error) {
//       alert(error.message);
//     } else {
//       // 2. BURN THE TOKEN: Mark as used so it can't be reused
//       await fetch("/api/invites", {
//         method: "PATCH",
//         body: JSON.stringify({ token }),
//       });
      
//       router.push("/dashboard");
//     }
//   };

//   if (loading) return <p className="p-10">Verifying invitation...</p>;
//   if (error) return <p className="p-10 text-red-500">{error}</p>;
//   if (!token) return <p className="p-10">Sign up is by invitation only.</p>;

//   return (
//     <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
//       <h1 className="text-xl font-bold mb-4">Complete your Registration</h1>
//       <p className="text-sm text-gray-600 mb-6">
//         Joining as <strong>{invite.role}</strong> for 
//         {invite.ecdCenterId ? " ECD Center" : invite.provinceId ? " Province" : " the System"}.
//       </p>

//       <form onSubmit={handleSignup} className="space-y-4">
//         <div>
//           <label className="block text-sm font-medium">Email (Locked)</label>
//           <input 
//             type="text" 
//             value={invite.email} 
//             disabled 
//             className="w-full p-2 bg-gray-100 border rounded cursor-not-allowed"
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium">Full Name</label>
//           <input name="name" type="text" required className="w-full p-2 border rounded" />
//         </div>
//         <div>
//           <label className="block text-sm font-medium">Password</label>
//           <input name="password" type="password" required className="w-full p-2 border rounded" />
//         </div>
//         <button 
//           type="submit" 
//           className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
//         >
//           Create Account
//         </button>
//       </form>
//     </div>
//   );
// }





"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Link from "next/link"; // For the login button

export default function SignupPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [invite, setInvite] = useState<any>(null);
  const [loading, setLoading] = useState(!!token);
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) {
      fetch(`/api/invites?token=${token}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) throw new Error(data.error);
          setInvite(data);
          setLoading(false);
        })
        .catch(() => {
          setError("This invitation is invalid or has expired.");
          setLoading(false);
        });
    }
  }, [token]);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    // FIX: Properties are passed directly, not inside 'data'
    const { data, error } = await authClient.signUp.email({
      email: invite.email,
      password,
      name,
      role: invite.role,
      provinceId: invite.provinceId,
      districtId: invite.districtId,
      ecdCenterId: invite.ecdCenterId,
    }as any);

    if (error) {
      alert(error.message);
    } else {
      await fetch("/api/invites", {
        method: "PATCH",
        body: JSON.stringify({ token }),
      });
      router.push("/dashboard");
    }
  };

  if (loading) return <p className="p-10 text-center">Verifying invitation...</p>;
  
  if (error || !token) return (
    <div className="max-w-md mx-auto mt-20 p-6 text-center">
      <p className="mb-4 text-red-500">{error || "Sign up is by invitation only."}</p>
      <Link href="/login" className="text-blue-600 hover:underline">Go to Login</Link>
    </div>
  );

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow border border-gray-200">
      <h1 className="text-xl font-bold mb-4">Complete your Registration</h1>
      <p className="text-sm text-gray-600 mb-6">
        Joining as <strong>{invite.role}</strong> for 
        {invite.ecdCenterId ? " ECD Center" : invite.provinceId ? " Province" : " the System"}.
      </p>

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Email (Locked)</label>
          <input 
            type="text" 
            value={invite.email} 
            disabled 
            className="w-full p-2 bg-gray-100 border rounded cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Full Name</label>
          <input name="name" type="text" required className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input name="password" type="password" required className="w-full p-2 border rounded" />
        </div>
        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white p-2 rounded font-semibold hover:bg-blue-700 transition"
        >
          Create Account
        </button>
      </form>

      <div className="mt-6 pt-6 border-t text-center">
        <p className="text-sm text-gray-500 mb-2">Already have an account?</p>
        <Link 
          href="/login" 
          className="inline-block w-full border border-blue-600 text-blue-600 p-2 rounded font-semibold hover:bg-blue-50 transition"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}