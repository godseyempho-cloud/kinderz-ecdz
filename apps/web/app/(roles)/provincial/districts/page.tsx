import { auth } from "@/lib/betterAuth";
import { headers } from "next/headers";
import { prisma } from "@kinderz/db";
import { redirect } from "next/navigation";
import DistrictTableClient from "@/components/DistrictTableClient";
import { Prisma } from "@prisma/client";

export default async function ProvincialDistrictsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/login");

  const role = session.user.role;
  const provinceId = session.user.provinceId as string | undefined;

  // Gatekeeper: Admin or Provincial with an ID
  const canAccess = role === "ADMIN" || (role === "PROVINCIAL" && provinceId);
  if (!canAccess) redirect("/dashboard");

  // Type-safe where clause to satisfy Prisma's StringFilter
  const whereClause: Prisma.DistrictWhereInput = (role === "ADMIN" || !provinceId)
    ? {}
    : { provinceId };

  const [districts, invites] = await Promise.all([
    prisma.district.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { ecdCenters: true, auditors: true },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.invite.findMany({
      where: { 
        ...(role === "ADMIN" || !provinceId ? {} : { provinceId }),
        role: "AUDITOR", 
        used: false 
      },
      orderBy: { createdAt: "desc" }
    })
  ]);

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {role === "ADMIN" ? "National District Registry" : "District Management"}
          </h1>
          <p className="text-sm text-slate-500">
            {role === "ADMIN" 
              ? "Viewing all districts across South Africa." 
              : "Manage districts and view auditor coverage for your province."}
          </p>
        </div>
      </header>
      
      <DistrictTableClient 
        initialDistricts={districts as any} 
        initialInvites={invites as any} 
      />
    </div>
  );
}