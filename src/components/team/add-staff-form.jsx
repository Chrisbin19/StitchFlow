"use client";

import { useState } from "react";
import { UserPlus, Loader2, AlertCircle, CheckCircle2, Mail, Lock, ShieldCheck, ChevronDown } from "lucide-react";

// Firebase Imports
import { db, app as mainApp } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { initializeApp, getApp, deleteApp } from "firebase/app";

export function AddStaffForm({ onAddStaff }) {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'Tailor' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  // Password strength calculator (0-4)
  const getPwdStrength = (pwd) => {
    let s = 0;
    if (pwd.length > 5) s += 1;
    if (pwd.length > 8) s += 1;
    if (/[A-Z]/.test(pwd)) s += 1;
    if (/[0-9]/.test(pwd)) s += 1;
    return s;
  };
  const strength = formData.password ? getPwdStrength(formData.password) : 0;
  const strLabels = ["Weak", "Weak", "Fair", "Good", "Strong"];
  const strCols = ["var(--adm-border)", "var(--adm-red)", "var(--adm-amber-c)", "var(--adm-blue-c)", "var(--adm-emerald)"];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Required';
    if (!formData.email.trim()) newErrors.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';

    if (!formData.password) newErrors.password = 'Required';
    else if (formData.password.length < 6) newErrors.password = 'Min 6 characters';

    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    setGeneralError("");
  };

  const createSecondaryUser = async (email, password) => {
    let secondaryApp;
    try {
      try { secondaryApp = getApp("SecondaryApp"); }
      catch (e) { secondaryApp = initializeApp(mainApp.options, "SecondaryApp"); }
      const secondaryAuth = getAuth(secondaryApp);
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      await signOut(secondaryAuth);
      return userCredential.user.uid;
    } finally {
      if (secondaryApp) deleteApp(secondaryApp).catch(() => null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true); setGeneralError(""); setSuccess(false);
    try {
      const uid = await createSecondaryUser(formData.email, formData.password);
      const newStaffData = {
        uid: uid, name: formData.name, email: formData.email,
        role: formData.role, status: 'Active', activeTasks: 0, joinedDate: serverTimestamp(),
      };
      await setDoc(doc(db, "users", uid), newStaffData);
      if (onAddStaff) onAddStaff({ id: uid, ...newStaffData });

      setSuccess(true);
      setFormData({ name: '', email: '', password: '', confirmPassword: '', role: 'Tailor' });
      setTimeout(() => setSuccess(false), 4000);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') setGeneralError("Email already registered.");
      else setGeneralError("Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: 'var(--adm-card)', borderRadius: 14,
      border: '1px solid var(--adm-border)', boxShadow: 'var(--adm-shadow)',
      overflow: 'hidden'
    }}>
      <div className="px-6 py-5 flex items-center gap-3"
        style={{
          background: 'var(--adm-card)', // Reacts to html[data-theme='dark'] tint overrides via css if needed. (Dark spec: header tint rgba(124,58,237,0.12) which we'll handle implicitly or just statically below)
          backgroundColor: 'rgba(124,58,237,0.06)',
          borderBottom: '1px solid var(--adm-border)'
        }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'var(--adm-violet-bg)', color: 'var(--adm-violet-c)' }}>
          <UserPlus className="w-4 h-4" />
        </div>
        <h2 className="adm-font-display text-[1.15rem] font-bold" style={{ color: 'var(--adm-violet-c)' }}>
          Add New Staff Member
        </h2>
      </div>

      <div className="p-6">
        {success && (
          <div className="mb-5 p-3 rounded-lg flex items-center gap-2 text-sm"
            style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--adm-emerald)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <CheckCircle2 className="w-4 h-4" /> Account created successfully!
          </div>
        )}
        {generalError && (
          <div className="mb-5 p-3 rounded-lg flex items-center gap-2 text-sm"
            style={{ background: 'rgba(220,38,38,0.1)', color: 'var(--adm-red)', border: '1px solid rgba(220,38,38,0.2)' }}>
            <AlertCircle className="w-4 h-4" /> {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          <div>
            <div className="flex items-center gap-2 mb-3">
              <UserPlus className="w-3.5 h-3.5" style={{ color: 'var(--adm-text-xs)' }} />
              <span style={{ fontSize: '0.70rem', letterSpacing: '0.12em', color: 'var(--adm-text-xs)' }} className="uppercase font-bold">Identity</span>
            </div>
            <div style={{ height: 1, background: 'var(--adm-border)', marginBottom: 16 }} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[0.78rem] font-medium mb-1.5" style={{ color: 'var(--adm-text-md)' }}>Full Name</label>
                <div className="relative">
                  <UserPlus className="absolute left-3.5 top-3 w-4 h-4" style={{ color: 'var(--adm-text-xs)' }} />
                  <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="First & Last Name"
                    style={{
                      width: '100%', padding: '10px 14px 10px 38px', borderRadius: 8, fontSize: '0.875rem',
                      background: 'var(--adm-input-bg)', border: `1.5px solid ${errors.name ? 'var(--adm-red)' : 'var(--adm-border)'}`,
                      color: 'var(--adm-text)', outline: 'none', transition: 'all 200ms ease'
                    }}
                    onFocus={e => { e.target.style.borderColor = 'var(--adm-violet-c)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.12)'; }}
                    onBlur={e => { e.target.style.borderColor = errors.name ? 'var(--adm-red)' : 'var(--adm-border)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[0.78rem] font-medium mb-1.5" style={{ color: 'var(--adm-text-md)' }}>Role Assignment</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-[14px] w-2 h-2 rounded-full"
                    style={{ background: formData.role === 'Tailor' ? 'var(--adm-emerald)' : formData.role === 'Cutter' ? 'var(--adm-orange-c)' : formData.role === 'Cashier' ? 'var(--adm-violet-c)' : 'var(--adm-blue-c)' }} />
                  <select name="role" value={formData.role} onChange={handleChange}
                    style={{
                      width: '100%', padding: '10px 14px 10px 32px', borderRadius: 8, fontSize: '0.875rem',
                      background: 'var(--adm-input-bg)', border: '1.5px solid var(--adm-border)', appearance: 'none',
                      color: 'var(--adm-text)', outline: 'none', transition: 'all 200ms ease'
                    }}
                    onFocus={e => { e.target.style.borderColor = 'var(--adm-violet-c)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.12)'; }}
                    onBlur={e => { e.target.style.borderColor = 'var(--adm-border)'; e.target.style.boxShadow = 'none'; }}>
                    <option value="Tailor">Tailor</option>
                    <option value="Cutter">Cutter</option>
                    <option value="Cashier">Cashier</option>
                    <option value="Manager">Manager</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-3 w-4 h-4 pointer-events-none" style={{ color: 'var(--adm-text-xs)' }} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[0.78rem] font-medium mb-1.5" style={{ color: 'var(--adm-text-md)' }}>Email ID (Login)</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4" style={{ color: 'var(--adm-text-xs)' }} />
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="staff@stitchflow.com"
                  style={{
                    width: '100%', padding: '10px 14px 10px 38px', borderRadius: 8, fontSize: '0.875rem',
                    background: 'var(--adm-input-bg)', border: `1.5px solid ${errors.email ? 'var(--adm-red)' : 'var(--adm-border)'}`,
                    color: 'var(--adm-text)', outline: 'none', transition: 'all 200ms ease'
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--adm-violet-c)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = errors.email ? 'var(--adm-red)' : 'var(--adm-border)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              {errors.email && <p className="text-xs mt-1" style={{ color: 'var(--adm-red)' }}>{errors.email}</p>}
            </div>
          </div>

          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[0.78rem] font-medium mb-1.5" style={{ color: 'var(--adm-text-md)' }}>Temporary Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4" style={{ color: 'var(--adm-text-xs)' }} />
                  <input type={showPwd ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="Min 6 chars"
                    style={{
                      width: '100%', padding: '10px 38px 10px 38px', borderRadius: 8, fontSize: '0.875rem',
                      background: 'var(--adm-input-bg)', border: `1.5px solid ${errors.password ? 'var(--adm-red)' : 'var(--adm-border)'}`,
                      color: 'var(--adm-text)', outline: 'none', transition: 'all 200ms ease'
                    }}
                    onFocus={e => { e.target.style.borderColor = 'var(--adm-violet-c)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.12)'; }}
                    onBlur={e => { e.target.style.borderColor = errors.password ? 'var(--adm-red)' : 'var(--adm-border)'; e.target.style.boxShadow = 'none'; }}
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3.5 top-3 pointer focus:outline-none" style={{ color: 'var(--adm-text-xs)' }}>
                    {showPwd ? <UserPlus className="w-4 h-4" /> : <Loader2 className="w-4 h-4" /> /* Simplified for generic block icon */}
                  </button>
                </div>

                {/* Strength Bar */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 h-1 w-full rounded overflow-hidden" style={{ background: 'var(--adm-border)' }}>
                      <div style={{ width: '25%', background: strength >= 1 ? strCols[strength] : 'transparent', transition: 'background 300ms' }} />
                      <div style={{ width: '25%', background: strength >= 2 ? strCols[strength] : 'transparent', transition: 'background 300ms' }} />
                      <div style={{ width: '25%', background: strength >= 3 ? strCols[strength] : 'transparent', transition: 'background 300ms' }} />
                      <div style={{ width: '25%', background: strength >= 4 ? strCols[strength] : 'transparent', transition: 'background 300ms' }} />
                    </div>
                    <p className="text-[10px] tracking-wide mt-1 font-bold" style={{ color: strCols[strength] }}>{strLabels[strength]} Password</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[0.78rem] font-medium mb-1.5" style={{ color: 'var(--adm-text-md)' }}>Confirm Password</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3.5 top-3 w-4 h-4" style={{ color: 'var(--adm-text-xs)' }} />
                  <input type={showPwd ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Repeat password"
                    style={{
                      width: '100%', padding: '10px 14px 10px 38px', borderRadius: 8, fontSize: '0.875rem',
                      background: 'var(--adm-input-bg)', border: `1.5px solid ${errors.confirmPassword ? 'var(--adm-red)' : 'var(--adm-border)'}`,
                      color: 'var(--adm-text)', outline: 'none', transition: 'all 200ms ease'
                    }}
                    onFocus={e => { e.target.style.borderColor = 'var(--adm-violet-c)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.12)'; }}
                    onBlur={e => { e.target.style.borderColor = errors.confirmPassword ? 'var(--adm-red)' : 'var(--adm-border)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                {errors.confirmPassword && <p className="text-xs mt-1" style={{ color: 'var(--adm-red)' }}>{errors.confirmPassword}</p>}
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 adm-font-display transition-transform hover:scale-[1.01]"
            style={{
              padding: '14px', borderRadius: 999,
              background: 'linear-gradient(135deg, var(--adm-violet-c) 0%, #6D28D9 100%)',
              color: 'white', border: 'none', boxShadow: '0 4px 14px rgba(124,58,237,0.3)',
              fontSize: '1rem', cursor: loading ? 'wait' : 'pointer'
            }}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
            {loading ? 'Creating...' : 'Add Staff Member'}
          </button>

        </form>
      </div>
    </div>
  );
}