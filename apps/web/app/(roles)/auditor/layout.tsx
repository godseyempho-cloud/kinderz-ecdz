import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getSession } from "@/lib/get-session";
import { LayoutDashboard, FileCheck, Map, ShieldCheck } from "lucide-react";

export default async function AuditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Role Protection: Only AUDITOR role allowed
  if (!session || session.user.role !== "AUDITOR") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation Header */}
      <nav className="border-b bg-slate-900 text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <span className="text-xl font-black tracking-tighter text-blue-400">
              TINYIKO <span className="text-white font-light text-sm tracking-normal ml-1">AUDIT</span>
            </span>
            
            <div className="hidden md:flex items-center gap-6 text-sm font-medium">
              <a href="/auditor/dashboard" className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </a>
              <a href="/auditor/reports" className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                <FileCheck className="h-4 w-4" /> Reviews
              </a>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">District Auditor</p>
              <p className="text-sm font-medium opacity-90">{session.user.email}</p>
            </div>
            <div className="h-8 w-[1px] bg-slate-700 mx-2" />
            <SignOutButton />
          </div>
        </div>
      </nav>

      {/* Audit Context Banner */}
      <div className="bg-blue-600 text-white py-2 px-4 text-center text-xs font-bold uppercase tracking-widest">
        Official Auditor Portal — Fiscal Year 2026/27
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto py-8 px-4">
        {children}
      </main>

      <footer className="border-t bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-xs">
          &copy; 2026 Tinyiko Financial ECD Oversight System. All rights reserved.
        </div>
      </footer>
    </div>
  );
}