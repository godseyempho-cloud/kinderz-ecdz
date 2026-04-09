import { getSession } from "@/lib/get-session";

export default async function ProvincialDashboardPage() {
  const session = await getSession();
  if (!session || session.user.role !== "PROVINCIAL") {
    return <p className="p-8">Access denied</p>;
  }

  // Would fetch data such as counts of submitted reports, status by district, etc.

  return ( 
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Provincial Dashboard</h1>
      <p>Overview stats and links will be displayed here.</p>
    </div>
  );
}
