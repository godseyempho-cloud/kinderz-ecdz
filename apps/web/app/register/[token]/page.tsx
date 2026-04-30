import { prisma } from "@kinderz/db";
import { notFound } from "next/navigation";
import RegisterFormClient from "../RegisterFormClient";

export default async function RegisterPage({ params }: { params: { token: string } }) {
  const invite = await prisma.invite.findUnique({
    where: { token: params.token },
  });

  // Security check for invite validity: must exist, not be used, and not be expired
  if (!invite || invite.used || (invite.expiresAt && invite.expiresAt < new Date())) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Complete Registration</h1>
          <p className="text-slate-500 mt-2">
            Joining as <span className="font-semibold text-blue-600">{invite.role}</span>
          </p>
          <p className="text-xs text-slate-400 font-mono mt-1 italic">{invite.email}</p>
        </div>

        <RegisterFormClient 
          email={invite.email} 
          token={invite.token} 
          role={invite.role}
          provinceId={invite.provinceId}    
          districtId={invite.districtId} 
          ecdCenterId={invite.ecdCenterId}   
        />  
      </div>
    </div>
  );
}