"use client";
import React, { useState } from "react";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("ECD_USER");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Failed to register");
      }
      setMessage("User registered successfully");
    } catch (err: any) {
      setMessage(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && <p className="mb-4">{message}</p>}
      <div>
        <label className="block">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-1 w-full"
        /> 
      </div>
      <div>
        <label className="block">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-1 w-full"
        />
      </div>
      <div>
        <label className="block">Role</label>
        <select value={role} onChange={(e) => setRole(e.target.value)} className="border p-1 w-full">
          <option>ADMIN</option>
          <option>PROVINCIAL</option>
          <option>AUDITOR</option>
          <option>SUPERVISOR</option>
          <option>ECD_USER</option>
        </select>
      </div>
      <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
        Create user
      </button>
    </form>
  );
}
