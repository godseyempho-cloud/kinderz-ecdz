import { auth } from "@/lib/betterAuth";
import { headers } from "next/headers";
import { prisma } from "@kinderz/db";
import { redirect } from "next/navigation";
import AuditorDashboardClient from "./AuditorDashboardClient";

export default async function AuditorDashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // 1. Security Bouncer
  if (!session || session.user.role !== "AUDITOR") {
    redirect("/login");
  }

  const districtId = session.user.districtId;

  // 2. Handle missing district assignment
  if (!districtId) {
    return (
      <div className="p-6 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg max-w-2xl mx-auto mt-10">
        <h2 className="font-bold text-lg">District Assignment Required</h2>
        <p>Your account is not yet assigned to a specific district. Please contact your Provincial Admin to link your profile to a territory.</p>
      </div>
    );
  }

  // 3. Data Fetching
  const district = await prisma.district.findUnique({
    where: { id: districtId },
    include: {
      _count: { select: { ecdCenters: true } }
    }
  });

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-800">District Auditor Portal</h1>
        <p className="text-slate-500">
          Territory: <span className="font-semibold text-blue-600">{district?.name || "Unknown District"}</span>
        </p>
      </header>

      {/* Hand off interactivity to the Client Component */}
      <AuditorDashboardClient 
        centerCount={district?._count.ecdCenters || 0} 
        districtName={district?.name || "Assigned District"} 
      />
    </div>
  );
}