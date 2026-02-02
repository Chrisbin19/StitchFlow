'use client';

import { Header } from '@/components/header';
import { StatsCards } from '@/components/stats-cards';
import { PendingOrdersTable } from '@/components/pending-orders-table';
import { TasksList } from '@/components/tasks-list';
import { PaymentOverview } from '@/components/payment-overview';
import { UpcomingDeliveries } from '@/components/upcoming-deliveries';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome to StitchFlow
          </h1>
          <p className="text-muted-foreground">
            Manage your tailoring operations efficiently
          </p>
        </div>

        {/* Stats Cards */}
        <StatsCards />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Left Column - Pending Orders and Tasks */}
          <div className="lg:col-span-2 space-y-6">
            <PendingOrdersTable />
            <TasksList />
          </div>

          {/* Right Column - Summaries */}
          <div className="space-y-6">
            <PaymentOverview />
            <UpcomingDeliveries />
          </div>
        </div>
      </main>
    </div>
  );
}


/*
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import { useAuth } from "@/context/AuthContext"; // Import your auth hook
import { doc, getDoc } from "firebase/firestore"; // Import Firestore tools
import { db } from "@/firebase"; // Import your database config

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Tailor"); // Default role
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // To show loading state
  
  const { login } = useAuth(); // Get the actual login function
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true); // Start loading

    try {
      // 1. Firebase Authentication (Check Email & Password)
      const userCredential = await login(email, password);
      const user = userCredential.user;

      // 2. Database Role Verification (Security Check)
      // Check if this user actually has the role they selected in the dropdown
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Verify the database role matches the dropdown selection
        if (userData.role !== role) {
           setError(`Access Denied: Your account is not registered as a "${role}".`);
           setLoading(false);
           return; 
        }

        console.log(`Login successful: ${user.email} as ${role}`);

        // 3. ROLE-BASED REDIRECT LOGIC
        // Redirect to specific pages based on the role
        switch(role) {
          case "Admin":
            router.push("/admin/dashboard");
            break;
          case "Tailor":
            router.push("/tailor/orders");
            break;
          case "Cutter":
             router.push("/cutter/tasks");
             break;
          case "Manager":
             router.push("/manager/overview");
             break;
          default:
             router.push("/dashboard"); // Fallback for others
        }
        
      } else {
        setError("User profile not found. Please contact Admin.");
        setLoading(false);
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
        // You can pass 'loading' to your form to disable the button while spinning
        loading={loading} 
      />
    </main>
  );
}

*/