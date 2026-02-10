import { auth } from "@/lib/betterAuth";
import { headers } from "next/headers";

/**
 * Server Component
 * Runs on the server for every request to /protected
 */
export default async function ProtectedPage() {
  // Call the better-auth get-session API
  const session = await auth.api.getSession({
    headers: headers(), // cookies are included here automatically
  });

  // Block unauthenticated users
  if (!session) {
    return <div>Access denied</div>;
  }

  // Authenticated user
  return <div>Welcome, {session.user.email}</div>;
}
