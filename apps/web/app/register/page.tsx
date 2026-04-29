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
}