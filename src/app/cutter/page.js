'use client';

import Header from '@/components/cutter/header';
import CutterStats from '@/components/cutter/cutter-stats';
import AssignedOrdersTable from '@/components/cutter/assigned-orders-table';
import FabricRackInfo from '@/components/cutter/fabric-rack-info';
import TaskProgress from '@/components/cutter/task-progress';
import CompletedTasks from '@/components/cutter/completed-tasks';

export default function CutterDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="p-6">
        <div className="grid gap-6">
          {/* Top Stats */}
          <CutterStats />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Assigned Orders */}
            <div className="lg:col-span-2">
              <AssignedOrdersTable />
            </div>

            {/* Right Column - Fabric and Progress */}
            <div className="flex flex-col gap-6">
              <FabricRackInfo />
              <TaskProgress />
            </div>
          </div>

          {/* Completed Tasks */}
          <CompletedTasks />
        </div>
      </main>
    </div>
  );
}
