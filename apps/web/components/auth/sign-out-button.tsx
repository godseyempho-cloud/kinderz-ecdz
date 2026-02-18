"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function SignOutButton() {
    const router = useRouter();

    const handleSignOut = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push("/login");
                    router.refresh();
                },
            },
        });
    };

    return (
        <button 
            onClick={handleSignOut}
            style={{ padding: "0.5rem 1rem", backgroundColor: "#ef4444", color: "white", borderRadius: "4px", border: "none", cursor: "pointer" }}
        >
            Sign Out
        </button>
    );
}