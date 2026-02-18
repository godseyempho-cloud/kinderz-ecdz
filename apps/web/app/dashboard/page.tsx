import { getSession } from "@/lib/get-session";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const session = await getSession();

    // 1. Redirect if not logged in
    if (!session) {
        redirect("/login");
    }

    // 2. Role-based protection (optional)
    if (session.user.role !== "ADMIN" && session.user.role !== "ECD_USER") {
        return <div>Access Denied: You do not have the required permissions.</div>;
    }

    return (
        <main className="p-8">
            <h1>Welcome back, {session.user.name}</h1>
            <p>Your Role: <strong>{session.user.role}</strong></p>
            {/* Your ECD dashboard content here */}
        </main>
    );
}