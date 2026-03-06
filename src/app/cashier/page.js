'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/cashier/header';
import PaymentStats from '@/components/cashier/payment-stats';
import PendingPaymentsTable from '@/components/cashier/pending-payments-table';
import DeliveryQueue from '@/components/cashier/DeliveryQueue';
import ReceiptHistory from '@/components/cashier/receipt-history';
import DailyCollection from '@/components/cashier/daily-collection';
import PaymentModes from '@/components/cashier/payment-modes';

const ALLOWED_ROLES = ['Cashier'];

export default function CashierDashboard() {
  const { currentUser, userData, isLoadingUser } = useAuth();
  const router = useRouter();

  // 🔒 ROUTE GUARD: Only Cashier can access
  useEffect(() => {
    if (isLoadingUser) return;
    if (!currentUser || !ALLOWED_ROLES.includes(userData?.role)) {
      router.push('/');
    }
  }, [currentUser, userData, isLoadingUser, router]);

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!currentUser || !ALLOWED_ROLES.includes(userData?.role)) {
    return null;
  }

  return (
    <div className="min-h-screen cf-page font-body" style={{ background: 'var(--cf-bg)' }}>
      <Header />

      <main className="p-6">
        <div className="grid gap-6">
          {/* Top Stats */}
          <PaymentStats />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Pending Payments & Delivery Queue */}
            <div className="lg:col-span-2 space-y-6">
              <PendingPaymentsTable />
              <DeliveryQueue />
            </div>

            {/* Right Column - Payment Modes and Daily Collection */}
            <div className="flex flex-col gap-6">
              <PaymentModes />
              <DailyCollection />
            </div>
          </div>

          {/* Receipt History */}
          <ReceiptHistory />
        </div>
      </main>
    </div>
  );
}
