import { getSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import RegisterForm from "@/components/RegisterForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function AdminRegisterPage() {
  const session = await getSession();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/admin/users" className="flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">
        <ArrowLeft size={16} /> Back to Users
      </Link>
      
      <div className="bg-white border rounded-2xl p-8 shadow-sm">
        <h1 className="text-2xl font-black text-slate-900 mb-2">Create Account</h1>
        <p className="text-slate-500 mb-8">Set up credentials for a new ECD Center Supervisor or Provincial Auditor.</p>
        
        <RegisterForm />
      </div>
    </div>
  );
}