import { ReactNode } from "react";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-bold tracking-tighter text-blue-400">TINYIKO</h2>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">ECD Management</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link href="/dashboard" className="block px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
            Overview
          </Link>
          <Link href="/dashboard/reports" className="block px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
            Quarterly Reports
          </Link>
          <Link href="/dashboard/children" className="block px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
            Children Registry
          </Link>
          <Link href="/dashboard/attendance" className="block px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
            Attendance
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Link href="/settings" className="text-sm text-slate-400 hover:text-white">
            Account Settings
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <h1 className="font-semibold text-slate-700">Dashboard</h1>
          <div className="flex items-center gap-4">
             {/* Profile/Logout will go here */}
             <div className="h-8 w-8 rounded-full bg-blue-100 border border-blue-200" />
          </div>
        </header>

        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}