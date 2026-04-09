import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getSession } from "@/lib/get-session";
import { Home, UploadCloud, AlertCircle, Building2 } from "lucide-react";

export default async function SupervisorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Role Protection: Only SUPERVISOR role allowed
  if (!session || session.user.role !== "SUPERVISOR") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="border-b bg-white p-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg text-white">
                <Building2 className="h-5 w-5" />
              </div>
              <span className="font-bold text-slate-900 text-lg">Tinyiko</span>
            </div>

            <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500">
              <a href="/supervisor/dashboard" className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                <Home className="h-4 w-4" /> My Center
              </a>
              <a href="/supervisor/upload" className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                <UploadCloud className="h-4 w-4" /> Submit Evidence
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right border-r pr-4 hidden sm:block">
              <p className="text-xs font-bold text-slate-400">SUPERVISOR</p>
              <p className="text-sm font-bold text-slate-800">{session.user.email}</p>
              <p className="text-[10px] text-blue-600 font-mono">ID: {session.user.ecdCenterId}</p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </nav>

      {/* Notification Area for Findings */}
      <div className="bg-amber-50 border-b border-amber-100 py-2.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-amber-800 text-xs font-bold uppercase tracking-wide">
          <AlertCircle className="h-4 w-4" />
          Ensure all audit findings are resolved before the end of the month.
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto py-10 px-4">
        {children}
      </main>
    </div>
  );
}