import { auth } from "@/lib/betterAuth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/auth/sign-out-button";


export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Layer 2 Security: Server-side session check
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // If the user is not authenticated, kick them back to the public Entryway
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
            <span className="text-sm text-gray-500">{session.user.email}</span>
            {/* We will add a logout button here in the next step */}
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