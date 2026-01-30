'use client';

import Header from '@/components/cashier/header';
import PaymentStats from '@/components/cashier/payment-stats';
import PendingPaymentsTable from '@/components/cashier/pending-payments-table';
import ReceiptHistory from '@/components/cashier/receipt-history';
import DailyCollection from '@/components/cashier/daily-collection';
import PaymentModes from '@/components/cashier/payment-modes';

export default function CashierDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="p-6">
        <div className="grid gap-6">
          {/* Top Stats */}
          <PaymentStats />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Pending Payments */}
            <div className="lg:col-span-2">
              <PendingPaymentsTable />
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
