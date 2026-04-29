import { prisma } from "@kinderz/db";
import { redirect } from "next/navigation";
import { auth } from "@/lib/betterAuth";
import { headers } from "next/headers";

export default async function InviteProvincialPage() {
  // 1. Protect the route - only ADMINS allowed
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // 2. Fetch provinces to populate the dropdown
  const provinces = await prisma.province.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-blue-900">Invite Provincial Representative</h1>
        <p className="text-gray-600 text-sm">
          This will generate a secure link for a user to register as a Provincial Lead.
        </p>
      </div>

      <form action="/api/admin/generate-invite" method="POST" className="space-y-6 bg-white p-6 rounded-xl shadow-sm border">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            South African Province
          </label>
          <select 
            name="provinceId" 
            required 
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Select a province...</option>
            {provinces.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">Limited to one active lead per province.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input 
            type="email" 
            name="email" 
            placeholder="representative@email.co.za"
            required 
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <button 
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Generate & Send Invite
        </button>
      </form>
    </div>
  );
}