import { auth } from "@/lib/betterAuth";
import { headers } from "next/headers";
import { prisma } from "@kinderz/db";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import DistrictCard from "@/components/cards/DistrictCard";

export default async function ProvincialDashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // 1. Security Bouncer
  if (!session || !["ADMIN", "PROVINCIAL"].includes(session.user.role || "")) {
    redirect("/login");
  }

  const role = session.user.role;
  const provinceId = session.user.provinceId as string | undefined;

  // Safety check for Provincial users missing an ID
  if (role === "PROVINCIAL" && !provinceId) {
    return (
      <div className="p-6 bg-red-50 text-red-700 border border-red-200 rounded-lg">
        Error: Your account is not linked to a province. Please contact System Admin.
      </div>
    );
  }

  // 2. Data Filters (Type-safe)
  const districtFilter: Prisma.DistrictWhereInput = (role === "ADMIN" || !provinceId) 
    ? {} 
    : { provinceId };

  const centerFilter: Prisma.EcdCenterWhereInput = (role === "ADMIN" || !provinceId) 
    ? {} 
    : { district: { provinceId } };

  const auditorFilter: Prisma.UserWhereInput = (role === "ADMIN" || !provinceId)
    ? { role: "AUDITOR" }
    : { role: "AUDITOR", district: { provinceId } };

  // 3. Parallel Data Fetching
  const [districtCount, centerCount, auditorCount, districts] = await Promise.all([
    prisma.district.count({ where: districtFilter }),
    prisma.ecdCenter.count({ where: centerFilter }),
    prisma.user.count({ where: auditorFilter }),
    prisma.district.findMany({
      where: districtFilter,
      include: {
        // FIXED: Changed 'users' to 'auditors' to match your schema
        auditors: {
          where: { role: "AUDITOR" },
          select: { name: true, email: true }
        }
      },
      orderBy: { name: 'asc' }
    })
  ]);

  return (
    <div className="p-6 space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-800 uppercase tracking-tight">
          {role === "ADMIN" ? "National Overview" : `${provinceId?.replace(/-/g, ' ')} Registry`}
        </h1>
        <p className="text-slate-500">
          {role === "ADMIN" 
            ? "Monitoring all 9 provinces across South Africa." 
            : "Monitoring performance and managing district auditors."}
        </p>
      </header>

      {/* --- STATS SECTION --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium uppercase tracking-tight">Districts</p>
          <p className="text-3xl font-bold text-blue-600">{districtCount}</p>
        </div>

        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium uppercase tracking-tight">Active ECD Centers</p>
          <p className="text-3xl font-bold text-green-600">{centerCount}</p>
        </div>

        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium uppercase tracking-tight">Assigned Auditors</p>
          <p className="text-3xl font-bold text-purple-600">{auditorCount}</p>
        </div>
      </div>

      {/* --- DISTRICT MANAGEMENT SECTION --- */}
      <section className="space-y-4">
        <div className="flex justify-between items-end border-b border-slate-200 pb-2">
          <h2 className="text-xl font-bold text-slate-800">District Oversight</h2>
          <span className="text-sm text-slate-500">{districts.length} Territories</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {districts.map((district) => (
            <DistrictCard 
              key={district.id}
              districtId={district.id}
              name={district.name}
              // FIXED: Changed district.users to district.auditors
              auditor={district.auditors[0] || null}
            />
          ))} 
        </div>
      </section> 
    </div>
  );
} 