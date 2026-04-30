import { auth } from "@/lib/betterAuth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@kinderz/db";
import InviteUserModal from "@/components/modals/InviteUserModal";

export default async function AdminDashboard() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // Combine your specific provincial logic with general counts
  const [userCount, centerCount, pendingInvites, provincialCount] = await Promise.all([
    prisma.user.count(),
    prisma.ecdCenter.count(),
    prisma.invite.count({ where: { used: false } }),
    prisma.user.count({ where: { role: "PROVINCIAL" } }),
  ]);

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Admin Command Center</h1>
          <p className="text-slate-500 mt-1">Managing the Tinyiko National Network</p>
        </div>
        {/* We use the modal here instead of just a Link */}
        <InviteUserModal openerRole="ADMIN" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Provincials</p>
          <p className="text-4xl font-bold text-blue-600 mt-2">{provincialCount}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Users</p>
          <p className="text-4xl font-bold text-slate-900 mt-2">{userCount}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Centers</p>
          <p className="text-4xl font-bold text-slate-900 mt-2">{centerCount}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pending Invites</p>
          <p className="text-4xl font-bold text-orange-500 mt-2">{pendingInvites}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
        <p className="text-slate-400 italic">National activity logs and audit flags will appear here.</p>
      </div>
    </div>
  );
}