import { auth } from "@/lib/betterAuth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardBridge() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");   
  }

  const role = session.user.role;         

  // Route based on role
  if (role === "ADMIN") {   
    redirect("/admin"); 
  }

  if (role === "PROVINCIAL") {
    redirect("/provincial");
  }

  // Default fallback for ECD_USER or others
  return (
    <div className="p-8">
      <h1>Welcome, {session.user.name}</h1>
      <p>Your role is: {role}</p>
      <p>We are still setting up your specific dashboard view.</p>
    </div>
  );
}