import { getSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserPlus, Users, ShieldAlert } from "lucide-react";

export default async function AdminUsersPage() {
  const session = await getSession();

  // Guard: Strictly Admin Only
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900">User Administration</h1>
          <p className="text-slate-500 text-sm">Manage access for Auditors, Supervisors, and Staff.</p>
        </div>
        
        <Link 
          href="/admin/register" 
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors"
        >
          <UserPlus size={18} /> Register New User
        </Link>
      </div>

      <div className="bg-white border rounded-2xl p-12 text-center border-dashed border-slate-300">
        <Users className="mx-auto h-12 w-12 text-slate-300 mb-4" />
        <h2 className="text-lg font-bold text-slate-900">No users listed yet</h2>
        <p className="text-slate-500 max-w-xs mx-auto mt-2">
          Start by registering your first District Auditor or Center Supervisor.
        </p>
      </div>
    </div>
  );
}