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

  // 1. Security Bouncer (Strict Role Check)
  if (!session || !["ADMIN", "PROVINCIAL"].includes(session.user.role || "")) {
    redirect("/login");
  }

  const role = session.user.role;
  // Derive Province directly from the secure session to prevent URL tampering
  const provinceId = session.user.provinceId;

  // Safety check: Provincial users MUST have an assigned province
  if (role === "PROVINCIAL" && !provinceId) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="bg-red-50 text-red-700 p-8 rounded-2xl border border-red-100 max-w-md text-center shadow-sm">
          <h2 className="font-bold text-xl mb-2">Province Unassigned</h2>
          <p className="text-sm leading-relaxed">
            Your Provincial Administrator account is not yet linked to a specific South African province. 
            Please contact the National System Admin to resolve this.
          </p>
        </div>
      </div>
    );
  }

  // 2. Data Filters: FORCE province scoping for non-admins
  // For ADMIN, these filters become empty objects (fetching all national data)
  const districtFilter: Prisma.DistrictWhereInput = role === "ADMIN" 
    ? {} 
    : { provinceId: provinceId as string };

  const centerFilter: Prisma.EcdCenterWhereInput = role === "ADMIN" 
    ? {} 
    : { district: { provinceId: provinceId as string } };

  const auditorFilter: Prisma.UserWhereInput = role === "ADMIN"
    ? { role: "AUDITOR" }
    : { role: "AUDITOR", district: { provinceId: provinceId as string } };

  // 3. Parallel Data Fetching for Performance
  const [districtCount, centerCount, auditorCount, districts] = await Promise.all([
    prisma.district.count({ where: districtFilter }),
    prisma.ecdCenter.count({ where: centerFilter }),
    prisma.user.count({ where: auditorFilter }),
    prisma.district.findMany({
      where: districtFilter,
      include: {
        auditors: {
          where: { role: "AUDITOR" },
          select: { name: true, email: true }
        }
      },
      orderBy: { name: 'asc' }
    })
  ]);

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <header>
        <div className="flex items-center gap-3 mb-1">
           <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse" />
           <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
             {role === "ADMIN" ? "National Portal" : "Provincial Portal"}
           </span>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 uppercase tracking-tight">
          {role === "ADMIN" ? "South Africa Registry" : `${provinceId?.replace(/-/g, ' ')} Registry`}
        </h1>
        <p className="text-slate-500 mt-2 text-lg">
          {role === "ADMIN" 
            ? "Aggregated oversight of all 9 provinces." 
            : `Managing performance and territories within ${provinceId?.replace(/-/g, ' ')}.`}
        </p>
      </header>

      {/* --- STATS SECTION --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Districts</p>
          <p className="text-4xl font-bold text-slate-900 mt-1">{districtCount}</p>
        </div>

        <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Active Centers</p>
          <p className="text-4xl font-bold text-green-600 mt-1">{centerCount}</p>
        </div>

        <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Assigned Auditors</p>
          <p className="text-4xl font-bold text-purple-600 mt-1">{auditorCount}</p>
        </div>
      </div>

      {/* --- DISTRICT MANAGEMENT SECTION --- */}
      <section className="space-y-6 pt-4">
        <div className="flex justify-between items-end border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">District Oversight</h2>
            <p className="text-sm text-slate-500">Monitor and assign auditors to specific territories.</p>
          </div>
          <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-sm font-bold">
            {districts.length} Regions
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {districts.map((district) => (
            <DistrictCard 
              key={district.id}
              districtId={district.id}
              name={district.name}
              auditor={district.auditors[0] || null}
            />
          ))} 
        </div>

        {districts.length === 0 && (
          <div className="p-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-center">
            <p className="text-slate-500">No districts found for this region.</p>
          </div>
        )}
      </section> 
    </div>
  );
}