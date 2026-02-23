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
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import Link from 'next/link';

const ALLOWED_ROLES = ['Admin', 'Manager'];

export default function Dashboard() {
  const { currentUser, userData, isLoadingUser } = useAuth();
  const router = useRouter();

  // 🔒 ROUTE GUARD: Only Admin and Manager can access
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
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome to StitchFlow
              </h1>
              <p className="text-muted-foreground">
                Manage your tailoring operations efficiently
              </p>
            </div>

            {/* Team Management Button */}
            <Link href="/admin/team">
              <Button
                className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transition-all duration-200 px-6 py-5 text-base font-semibold"
              >
                <Users className="w-5 h-5 mr-2" />
                Manage Team
              </Button>
            </Link>
          </div>
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


