// export default function LoginPage() {
//   return (
//     <form method="post" action="/api/auth/sign-in">
//       {/* Email input */}
//       <input name="email" type="email" placeholder="Email" />

//       {/* Password input */}
//       <input name="password" type="password" placeholder="Password" />

//       {/* Submit */}
//       <button type="submit">Sign in</button>
//     </form>
//   );
// }


// "use client";

// export default function LoginPage() {
//   async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
//     e.preventDefault();

//     const form = e.currentTarget;
//     const email = (form.elements.namedItem("email") as HTMLInputElement).value;
//     const password = (form.elements.namedItem("password") as HTMLInputElement).value;

//     await fetch("/api/auth/sign-in", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email, password }),
//     });
//   }

//   return (
//     <form onSubmit={handleSubmit}>
//       <input name="email" type="email" placeholder="Email" />
//       <input name="password" type="password" placeholder="Password" />
//       <button type="submit">Sign in</button>
//     </form>
//   );
// }


// "use client";

// import { useState } from "react";

// export default function LoginPage() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();

//     const res = await fetch("/api/auth/sign-in", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         email,
//         password,
//       }),
//     });

//     if (!res.ok) {
//       alert("Invalid credentials");
//       return;
//     }

//     // success → session cookie is now set
//     window.location.href = "/";
//   }

//   return (
//     <form onSubmit={handleSubmit}>
//       <input
//         type="email"
//         placeholder="Email"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//         required
//       />

//       <input
//         type="password"
//         placeholder="Password"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//         required
//       />

//       <button type="submit">Sign in</button>
//     </form>
//   );
// }










//SIGN-UP CODE NOT LOGIN

// "use client";

// import { useState } from "react";
// import { authClient } from "@/lib/auth-client";

// export default function SignUp() {
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [name, setName] = useState("");
//     const [loading, setLoading] = useState(false);

//     const handleSignUp = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setLoading(true);

//         const { data, error } = await authClient.signUp.email({
//             email,
//             password,
//             name,
//             callbackURL: "/dashboard", // Where to go after success
//         });

//         if (error) {
//             alert(error.message || "Something went wrong");
//         } else {
//             console.log("User created:", data);
//         }
//         setLoading(false);
//     };

//     return (
//         <div style={{ maxWidth: "400px", margin: "auto", padding: "2rem" }}>
//             <h2>Create an Account</h2>
//             <form onSubmit={handleSignUp} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
//                 <input 
//                     type="text" placeholder="Name" required 
//                     onChange={(e) => setName(e.target.value)} 
//                 />
//                 <input 
//                     type="email" placeholder="Email" required 
//                     onChange={(e) => setEmail(e.target.value)} 
//                 />
//                 <input 
//                     type="password" placeholder="Password" required 
//                     onChange={(e) => setPassword(e.target.value)} 
//                 />
//                 <button type="submit" disabled={loading}>
//                     {loading ? "Creating account..." : "Sign Up"}
//                 </button>
//             </form>
//         </div>
//     );
// }


"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await authClient.signIn.email({
            email,
            password,
            callbackURL: "/dashboard",
        });

        if (error) {
            alert(error.message || "Invalid credentials");
        } else {
            router.push("/dashboard");
            router.refresh(); // Forces the server to re-check the session
        }
        setLoading(false);
    };

    return (
        <div style={{ maxWidth: "400px", margin: "auto", padding: "2rem" }}>
            <h2>Login to Kinderz-ECD</h2>
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <input 
                    type="email" placeholder="Email" required 
                    onChange={(e) => setEmail(e.target.value)} 
                />
                <input 
                    type="password" placeholder="Password" required 
                    onChange={(e) => setPassword(e.target.value)} 
                />
                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
}



