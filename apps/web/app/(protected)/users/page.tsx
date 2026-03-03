import { auth } from "@/lib/betterAuth";
import { headers } from "next/headers";
import React from "react";

// User management landing page. Admins can view and navigate to registration or
// edit existing accounts. Actual list retrieval will be implemented later.
export default async function UsersPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "ADMIN") {
    return <p className="p-8">Access denied</p>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">User Administration</h1>
      <p>List of users will appear here.</p>
      <p>
        <a className="text-blue-600" href="/users/register">
          Register new user
        </a>
      </p>
    </div>
  );
}
