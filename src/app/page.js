"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Tailor"); // Default role
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // The AuthContext login function returns {success, role} and handles localStorage
      const result = await login(email, password);

      // Check if login was successful
      if (!result || !result.success) {
        setError(result?.error || "Authentication failed. Please try again.");
        setLoading(false);
        return;
      }

      // Verify the database role matches the dropdown selection
      if (result.role !== role) {
        setError(`Access Denied: Your account is not registered as a "${role}".`);
        setLoading(false);
        return;
      }

      // Get user ID from localStorage (already set by AuthContext)
      const userId = localStorage.getItem('stitch_user_id');

      if (!userId) {
        setError("User ID not found. Please contact support.");
        setLoading(false);
        return;
      }

      console.log(`Login successful: ${result.role} user`);

      // ROLE-BASED REDIRECT LOGIC
      switch (result.role) {
        case "Admin":
          router.push("/admin");
          break;
        case "Tailor":
          router.push(`/tailor/${userId}`);
          break;
        case "Cutter":
          router.push(`/cutter/${userId}`);
          break;
        case "Manager":
          router.push("/admin");
          break;
        case "Cashier":
          router.push("/cashier");
          break;
        default:
          router.push("/dashboard");
      }

    } catch (err) {
      console.error("Login Error:", err);
      // Friendly error messages
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
        setError("Incorrect email or password.");
      } else {
        setError("Failed to sign in. Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <LoginForm
        email={email} setEmail={setEmail}
        password={password} setPassword={setPassword}
        role={role} setRole={setRole}
        error={error}
        onSubmit={handleLogin}
        loading={loading}
      />
    </main>
  );
}
