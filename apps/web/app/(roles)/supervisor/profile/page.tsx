import { getSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import UserProfileCard from "@/components/UserProfileCard";

export default async function SupervisorProfilePage() {
  const session = await getSession();
  if (!session || session.user.role !== "SUPERVISOR") redirect("/login");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-black text-slate-900">Center Profile</h1>
      <UserProfileCard user={session.user} />
    </div>
  );
}