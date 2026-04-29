import { auth } from "@/lib/betterAuth"; 
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ProvincialLayout({ children }: { children: React.ReactNode }) {
  // headers() in Next.js 14 doesn't technically need await, but better-auth handles it fine
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Security Gate: Ensure user is logged in and has the PROVINCIAL role
  if (!session || session.user.role !== "PROVINCIAL") {
    redirect("/login");
  }

  // Define the user object from the session
  // We use the 'any' cast here only if the betterAuth types haven't refreshed in your IDE yet
  const user = session.user as any;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 bg-slate-900 text-white hidden md:block border-r border-slate-800">
        <div className="p-6">
          <h1 className="text-xl font-bold text-white tracking-tight">
            Tinyiko <span className="text-blue-400">Provincial</span>
          </h1>
          <p className="text-[10px] text-slate-400 uppercase mt-1 font-semibold tracking-widest">
            {/* Now correctly accessing the property on the user object */}
            Province Lead Management
          </p>
        </div>
        
        <nav className="mt-4 px-4 space-y-1">
          <Link href="/provincial" className="block px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition">
            Overview
          </Link>
          <Link href="/provincial/districts" className="block px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition">
            Districts
          </Link>
          <Link href="/provincial/centers" className="block px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition">
            ECD Centers
          </Link>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <h2 className="text-sm font-semibold text-slate-600">Provincial Dashboard</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-700">{user.name || "User"}</span>
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white uppercase">
              {user.name?.charAt(0) || "U"}
            </div>
          </div>
        </header>

        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}