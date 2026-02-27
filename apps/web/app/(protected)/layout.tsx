import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getSession } from "@/lib/get-session";


export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Layer 2 Security: Enriched session check
  // getSession():
  //   - Returns null if user is banned/frozen/inactive
  //   - Returns enriched session with role, ecdCenterId, districtId
  //   - Queries DB to ensure user status is current
  const session = await getSession();

  // Redirect unauthenticated OR blocked users (banned, frozen, inactive) back to login
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation for all protected pages could go here */}
      <nav className="border-b bg-white p-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <span className="font-bold text-blue-800">Kinderz-ECD System</span>
          <div className="flex items-center gap-4">
            {/* Display user info + role for context */}
            <div className="text-sm text-gray-600">
              <div className="font-semibold">{session.user.email}</div>
              <div className="text-xs text-gray-500">
                Role: <span className="font-mono">{session.user.role}</span>
              </div>
              {/* Show jurisdiction hint for Auditor/Supervisor/ECD_USER */}
              {session.user.ecdCenterId && (
                <div className="text-xs text-gray-500">
                  Center ID: <span className="font-mono">{session.user.ecdCenterId}</span>
                </div>
              )}
            </div>
            <SignOutButton /> 
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4">
        {children}
      </main>
    </div>
  );
}