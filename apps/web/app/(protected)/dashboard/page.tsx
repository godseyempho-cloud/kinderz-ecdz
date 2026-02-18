import { auth } from "@/lib/betterAuth";
import { headers } from "next/headers";

export default async function DashboardPage() {
    // We fetch the session just to get user details
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    // We can safely assume session exists because the Layout handled the guard!
    const user = session!.user; 

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">ECD Dashboard</h1>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <p className="text-gray-600">Welcome back,</p>
                <h2 className="text-xl font-semibold text-blue-600">{user.name}</h2>
                
                <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded">
                        <span className="block text-xs text-gray-400 uppercase">Role</span>
                        <span className="font-mono font-bold">{user.role}</span>
                    </div>
                    <div className="p-4 bg-gray-50 rounded">
                        <span className="block text-xs text-gray-400 uppercase">Status</span>
                        <span className="text-green-600 font-bold">Authenticated</span>
                    </div>
                </div>
            </div>
        </div>
    );
}