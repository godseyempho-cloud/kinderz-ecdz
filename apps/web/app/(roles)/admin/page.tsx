import { prisma } from "@kinderz/db";
import Link from "next/link";

export default async function AdminDashboard() {
  // Fetch high-level stats for the Admin
  const provincialCount = await prisma.user.count({
    where: { role: "PROVINCIAL" },
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">Admin Command Center</h1>
          <p className="text-gray-500">Managing the Tinyiko National Network</p>
        </div>
        <Link 
          href="/admin/invites"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-md"
        >
          Invite New Provincial
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-400 text-sm font-medium uppercase">Active Provincials</h3>
          <p className="text-4xl font-bold text-blue-600 mt-2">{provincialCount}</p>
          <p className="text-xs text-gray-400 mt-4 italic">1 per province max (Rule 2)</p>
        </div>
        
        {/* Placeholder for future stats */}
        <div className="bg-gray-50 p-6 rounded-xl border border-dashed border-gray-300 flex items-center justify-center">
          <p className="text-gray-400 text-sm">National Audit Stats (Coming Soon)</p>
        </div>
      </div>
    </div>
  );
}