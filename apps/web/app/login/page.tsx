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


"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/auth/better-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!res.ok) {
      alert("Invalid credentials");
      return;
    }

    // success → session cookie is now set
    window.location.href = "/";
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button type="submit">Sign in</button>
    </form>
  );
}

