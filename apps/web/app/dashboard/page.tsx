import { auth } from "@/lib/betterAuth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@kinderz/db";

export default async function DashboardBridge() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const role = session.user.role;

  // 1. Role-Based Redirection
  if (role === "ADMIN") redirect("/admin"); 
  if (role === "PROVINCIAL") redirect("/provincial");
  if (role === "AUDITOR") redirect("/auditor");

  // 2. Data Fetching for SUPERVISOR / ECD_USER
  // Prisma "where" clauses don't like "null". We use "undefined" to skip a filter.
  const centers = await prisma.ecdCenter.findMany({
    where: {
      ...(role === "AUDITOR" ? { districtId: session.user.districtId || undefined } : {}),
      ...(role === "PROVINCIAL" ? { provinceId: session.user.provinceId || undefined } : {}),
      ...(role === "SUPERVISOR" || role === "ECD_USER" 
        ? { id: session.user.ecdCenterId || undefined } 
        : {}),
    },
  });

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome, {session.user.name}</h1>
          <p className="text-slate-500 uppercase text-xs font-bold tracking-widest mt-1">
            Access Level: <span className="text-blue-600">{role}</span>
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {centers.length > 0 ? (
          centers.map((center) => (
            <div key={center.id} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-bold text-slate-800">{center.name}</h2>
              {/* Changed emisNumber to basNumber based on your schema error */}
              <p className="text-sm text-slate-500">BAS: {center.basNumber || "Not Assigned"}</p>
              <div className="mt-4 flex gap-3">
                <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold">
                  View Statements
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 bg-blue-50 border border-blue-100 rounded-2xl text-center">
            <p className="text-blue-800 font-medium">No ECD Centers linked to your account yet.</p>
          </div>
        )}
      </div>  
    </div>
  );
}