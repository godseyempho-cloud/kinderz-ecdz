import { auth } from "@/lib/betterAuth";
import { headers } from "next/headers";
import { prisma } from "@kinderz/db";
import { redirect } from "next/navigation";
import AuditorDashboardClient from "./AuditorDashboardClient";

export default async function AuditorDashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // 1. Security Bouncer: Ensure user is an Auditor
  if (!session || session.user.role !== "AUDITOR") {
    redirect("/login");
  }

  // 2. Extract District ID from session (The "Safety Filter")
  const districtId = session.user.districtId;

  // 3. Handle missing district assignment (Safety check for new/unlinked accounts)
  if (!districtId) {
    return (
      <div className="p-8 bg-white min-h-[60vh] flex items-center justify-center">
        <div className="p-8 bg-amber-50 text-amber-800 border border-amber-200 rounded-2xl max-w-md text-center shadow-sm">
          <h2 className="font-bold text-xl mb-2">District Assignment Required</h2>
          <p className="text-sm leading-relaxed">
            Your Auditor profile is not yet linked to a specific district. 
            Please contact your Provincial Administrator to assign you to a territory.
          </p>
        </div>
      </div>
    );
  }

  // 4. Data Fetching: Scoped strictly to the session's districtId
  const district = await prisma.district.findUnique({
    where: { id: districtId },
    include: {
      _count: { 
        select: { ecdCenters: true } 
      }
    }
  });

  // If the district was deleted or ID is invalid in DB
  if (!district) {
    return (
        <div className="p-6 bg-red-50 text-red-800 border border-red-200 rounded-lg max-w-2xl mx-auto mt-10">
          <p>The assigned district records could not be found. Please contact support.</p>
        </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">District Auditor Portal</h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2">
            Managing Territory: 
            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-bold border border-blue-100">
              {district.name}
            </span>
          </p>
        </div>
        
        {/* Quick status badge */}
        <div className="hidden md:block px-4 py-2 bg-green-50 text-green-700 rounded-xl border border-green-100 text-xs font-bold uppercase tracking-widest">
            System Active
        </div>
      </header>

      {/* Hand off data to the Client Component */}
      <AuditorDashboardClient 
        centerCount={district._count.ecdCenters || 0} 
        districtName={district.name} 
      />
    </div>
  );
}