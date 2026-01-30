"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Tailor");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Simulate a successful login for testing purposes
    console.log(`Logging in as: ${role} | Email: ${email}`);
    
    // In the future, this is where you'd re-add authentication logic
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <LoginForm 
        email={email} setEmail={setEmail}
        password={password} setPassword={setPassword}
        role={role} setRole={setRole}
        error={error}
        onSubmit={handleLogin}
      />
    </main>
  );
}