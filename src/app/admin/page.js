'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/header';
import { StatsCards } from '@/components/stats-cards';
import { PendingOrdersTable } from '@/components/pending-orders-table';
import { TasksList } from '@/components/tasks-list';
import { PaymentOverview } from '@/components/payment-overview';
import { UpcomingDeliveries } from '@/components/upcoming-deliveries';
import { Users } from 'lucide-react';
import Link from 'next/link';

const ALLOWED_ROLES = ['Admin', 'Manager'];

const ShimmerStyle = () => (
  <style>{`
    @keyframes adm-shimmer {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    .adm-btn-shimmer:hover {
      background-image: linear-gradient(90deg,#7C3AED 0%,#a78bfa 40%,#7C3AED 100%);
      background-size: 200% auto;
      animation: adm-shimmer 1.6s linear infinite;
    }
  `}</style>
);

export default function Dashboard() {
  const { currentUser, userData, isLoadingUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoadingUser) return;
    if (!currentUser || !ALLOWED_ROLES.includes(userData?.role)) {
      router.push('/');
    }
  }, [currentUser, userData, isLoadingUser, router]);

  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--adm-bg)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500 mx-auto" />
          <p className="mt-3 text-sm" style={{ color: 'var(--adm-text-sm)' }}>Verifying access…</p>
        </div>
      </div>
    );
  }

  if (!currentUser || !ALLOWED_ROLES.includes(userData?.role)) return null;

  return (
    <>
      <ShimmerStyle />
      <div className="min-h-screen adm-page adm-font-body" style={{ background: 'var(--adm-bg)' }}>
        <Header />

        <main className="max-w-7xl mx-auto px-6 py-8">

          {/* ── Hero welcome ── */}
          <div className="flex items-center justify-between flex-wrap gap-4 mb-3">
            <div>
              <h1 className="adm-font-display font-black leading-tight"
                style={{ fontSize: '2.2rem', color: 'var(--adm-text)', letterSpacing: '-0.02em' }}>
                Welcome to StitchFlow
              </h1>
              <p className="text-base mt-1" style={{ color: 'var(--adm-text-sm)' }}>
                Manage your tailoring operations efficiently
              </p>
            </div>

            <Link href="/admin/team">
              <button
                className="adm-btn-shimmer inline-flex items-center gap-2 px-5 py-2.5 font-bold text-sm text-white"
                style={{
                  borderRadius: 999, background: 'var(--adm-violet-c)',
                  border: 'none', cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(124,58,237,0.30)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(124,58,237,0.40)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(124,58,237,0.30)'; }}
              >
                <Users className="w-4 h-4" />
                Manage Team
              </button>
            </Link>
          </div>

          {/* Warm divider */}
          <div className="mb-7 mt-5" style={{ height: 1, background: 'var(--adm-border)' }} />

          {/* ── Stat cards ── */}
          <StatsCards />

          {/* ── Main grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-7">
            <div className="lg:col-span-2 space-y-6">
              <PendingOrdersTable />
              <TasksList />
            </div>
            <div className="space-y-6">
              <PaymentOverview />
              <UpcomingDeliveries />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
