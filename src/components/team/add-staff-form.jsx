'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

// Firebase Imports
import { db, app as mainApp } from "@/firebase"; // Import main app to get config
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { initializeApp, getApp, deleteApp } from "firebase/app";

export function AddStaffForm({ onAddStaff }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Tailor',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // To block multiple clicks
  const [success, setSuccess] = useState(false);
  const [generalError, setGeneralError] = useState("");

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear specific error when user types
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    setGeneralError("");
  };

  const createSecondaryUser = async (email, password) => {
    // 1. Create a secondary app instance so we don't log out the Admin
    let secondaryApp;
    try {
        // Try to retrieve existing or create new
        try {
            secondaryApp = getApp("SecondaryApp");
        } catch (e) {
            secondaryApp = initializeApp(mainApp.options, "SecondaryApp");
        }
        
        const secondaryAuth = getAuth(secondaryApp);
        
        // 2. Create the user in Authentication
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
        const newUser = userCredential.user;

        // 3. Sign out immediately from the secondary app to keep things clean
        await signOut(secondaryAuth);
        
        // 4. Return the new UID (Important: We need this to link Firestore)
        return newUser.uid;

    } finally {
        // 5. Cleanup: Delete the secondary app instance
        if (secondaryApp) {
           // We don't strictly await this to speed up UI
           deleteApp(secondaryApp).catch(console.error);
        }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setGeneralError("");
    setSuccess(false);

    try {
      // Step A: Create User in Firebase Auth (The "Invisible" way)
      const uid = await createSecondaryUser(formData.email, formData.password);

      // Step B: Create User Profile in Firestore
      // We use setDoc with the UID so Auth and Database IDs match perfectly
      const newStaffData = {
        uid: uid, // Explicit link
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: 'Active',
        activeTasks: 0, // Workload tracking starts at 0
        joinedDate: serverTimestamp(),
      };

      await setDoc(doc(db, "users", uid), newStaffData);

      // Step C: Update UI
      if (onAddStaff) onAddStaff({ id: uid, ...newStaffData });

      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'Tailor',
      });

      // Auto-hide success message
      setTimeout(() => setSuccess(false), 4000);

    } catch (error) {
      console.error("Staff Creation Error:", error);
      if (error.code === 'auth/email-already-in-use') {
        setGeneralError("This email is already registered.");
      } else {
        setGeneralError("Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border border-indigo-100 bg-white shadow-sm">
      <CardHeader className="pb-4 border-b border-gray-50 bg-gray-50/50">
        <CardTitle className="text-indigo-900 flex items-center gap-2 text-lg">
          <div className="p-2 bg-indigo-100 rounded-lg">
             <UserPlus className="w-5 h-5 text-indigo-600" />
          </div>
          Add New Staff Member
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-6">
        {success && (
          <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-5 h-5" />
            <p className="font-medium">Staff account created successfully!</p>
          </div>
        )}

        {generalError && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-5 h-5" />
            <p className="font-medium">{generalError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Row 1: Name & Role */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ex: Suresh Kumar"
                className={`w-full px-4 py-2.5 rounded-lg bg-gray-50 border text-sm transition-all outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 ${
                  errors.name ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-indigo-500'
                }`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
               <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Role Assignment</label>
               <select
                 name="role"
                 value={formData.role}
                 onChange={handleChange}
                 className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
               >
                 <option value="Tailor">Tailor</option>
                 <option value="Cutter">Cutter</option>
                 <option value="Cashier">Cashier</option>
                 <option value="Manager">Shop Manager</option>
               </select>
            </div>
          </div>

          {/* Row 2: Email */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email ID (Login)</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="staff@stitchflow.com"
              className={`w-full px-4 py-2.5 rounded-lg bg-gray-50 border text-sm transition-all outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 ${
                errors.email ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-indigo-500'
              }`}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          {/* Row 3: Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Temporary Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 6 characters"
                className={`w-full px-4 py-2.5 rounded-lg bg-gray-50 border text-sm transition-all outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 ${
                  errors.password ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-indigo-500'
                }`}
              />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat password"
                className={`w-full px-4 py-2.5 rounded-lg bg-gray-50 border text-sm transition-all outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 ${
                  errors.confirmPassword ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-indigo-500'
                }`}
              />
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-6 shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Creating Account...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" /> Create Staff Account
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}