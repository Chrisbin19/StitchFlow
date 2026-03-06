"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AdminHeader } from '@/components/team/header';
import { TeamStats } from '@/components/team/team-stats';
import { TeamRoster } from '@/components/team/team-roster';
import { AddStaffForm } from '@/components/team/add-staff-form';

const ALLOWED_ROLES = ['Admin', 'Manager'];

export default function AdminTeamPage() {
  const { currentUser, userData, isLoadingUser } = useAuth();
  const router = useRouter();

  // ROUTE GUARD: Only Admin and Manager can access
  useEffect(() => {
    if (isLoadingUser) return;
    if (!currentUser || !ALLOWED_ROLES.includes(userData?.role)) {
      router.push('/');
    }
  }, [currentUser, userData, isLoadingUser, router]);

  // Handle loading state
  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--adm-bg)', color: 'var(--adm-text-sm)' }}>
        <p className="adm-font-display font-black tracking-widest uppercase">Verifying access...</p>
      </div>
    );
  }

  if (!currentUser || !ALLOWED_ROLES.includes(userData?.role)) {
    return null; // Should redirect via useEffect
  }

  return (
    <div className="min-h-screen adm-page transition-colors duration-300">
      <AdminHeader />

      <main className="max-w-[1400px] mx-auto px-6 py-8">

        {/* HERO SECTION */}
        <div className="mb-6">
          <h1 className="adm-font-display font-black tracking-tight mb-2" style={{ fontSize: '2.8rem', color: 'var(--adm-text)', lineHeight: 1.1 }}>
            Team Management
          </h1>
          <p className="text-[14px]" style={{ color: 'var(--adm-text-md)' }}>
            Manage your StitchFlow team, track workload, and onboard new staff members
          </p>
        </div>

        {/* Thin warm divider line */}
        <div style={{ height: 1, width: '100%', background: 'linear-gradient(to right, var(--adm-border) 0%, transparent 100%)', marginBottom: 28 }} />

        {/* STAT CARDS */}
        <TeamStats />

        {/* LAYOUT - Two Column */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">

          {/* Add Staff Form - Left Column (roughly 35% ~ 4 cols) */}
          <div className="lg:col-span-5 xl:col-span-4">
            <AddStaffForm />
          </div>

          {/* Team Roster - Right Column (roughly 65% ~ 8 cols) */}
          <div className="lg:col-span-7 xl:col-span-8">
            <TeamRoster />
          </div>

        </div>

      </main>
    </div>
  );
}
