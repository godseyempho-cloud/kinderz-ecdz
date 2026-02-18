import { auth } from "@/lib/betterAuth";
import { headers } from "next/headers";

export default async function ProfilePage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const user = session!.user;

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
            
            <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
                <div className="p-6 space-y-4">
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500 font-medium">Full Name</span>
                        <span className="text-gray-900">{user.name}</span>
                    </div>
                    
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500 font-medium">Email Address</span>
                        <span className="text-gray-900">{user.email}</span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500 font-medium">Account Role</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-bold">
                            {user.role}
                        </span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500 font-medium">Member Since</span>
                        <span className="text-gray-900">
                            {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </div>
            
            <p className="mt-4 text-sm text-gray-400 text-center">
                User ID: {user.id}
            </p>
        </div>
    );
}