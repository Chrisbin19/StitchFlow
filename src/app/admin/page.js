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


