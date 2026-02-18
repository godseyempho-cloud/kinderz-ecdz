

"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function SignUp() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { data, error } = await authClient.signUp.email({
            email,
            password,
            name,
            callbackURL: "/dashboard", // Where to go after success
        });

        if (error) {
            alert(error.message || "Something went wrong");
        } else {
            console.log("User created:", data);
        }
        setLoading(false);
    };

    return (
        <div style={{ maxWidth: "400px", margin: "auto", padding: "2rem" }}>
            <h2>Create an Account</h2>
            <form onSubmit={handleSignUp} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <input 
                    type="text" placeholder="Name" required 
                    onChange={(e) => setName(e.target.value)} 
                />
                <input 
                    type="email" placeholder="Email" required 
                    onChange={(e) => setEmail(e.target.value)} 
                />
                <input 
                    type="password" placeholder="Password" required 
                    onChange={(e) => setPassword(e.target.value)} 
                />
                <button type="submit" disabled={loading}>
                    {loading ? "Creating account..." : "Sign Up"}
                </button>
            </form>
        </div>
    );
}
