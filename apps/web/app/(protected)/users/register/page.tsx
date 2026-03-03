import React from "react";
import RegisterForm from "@/components/RegisterForm";

// Server component page that wraps the client-side registration form.  This
// allows the page to perform server-side guards or fetch data if needed.
export default function RegisterUserPage() {
  return (
    <div className="p-8 max-w-lg">
      <h1 className="text-2xl font-bold mb-4">Register User</h1>
      <RegisterForm />
    </div>
  );
}
