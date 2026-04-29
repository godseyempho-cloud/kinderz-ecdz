import { prisma } from "@kinderz/db";
import { notFound } from "next/navigation";
import RegisterFormClient from "../RegisterFormClient";

export default async function RegisterPage({ 
  params 
}: { 
  params: { token: string } 
}) {
  const invite = await prisma.invite.findUnique({
    where: { token: params.token },
  });

  // Security check for invite validity
  if (!invite || invite.used || invite.expiresAt < new Date()) {
    return notFound();
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <RegisterFormClient 
        email={invite.email} 
        token={invite.token} 
        role={invite.role}
        // These are passed but current RegisterFormClient props 
        // will need to be updated if you want to use them in the UI
        provinceId={invite.provinceId}   
        districtId={invite.districtId}
        ecdCenterId={invite.ecdCenterId}  
      />
    </div>
  );
}