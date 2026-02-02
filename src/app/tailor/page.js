'use client';

import Header from '@/components/tailor/header';
import TailorStats from '@/components/tailor/tailor-stats';
import AssignedGarmentsTable from '@/components/tailor/assigned-garments-table';
import MeasurementDetails from '@/components/tailor/measurement-details';
import WorkProgress from '@/components/tailor/work-progress';
import CompletedGarments from '@/components/tailor/completed-garments';


export default function TailorDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="p-6">
        <div className="grid gap-6">
          {/* Top Stats */}
          <TailorStats />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Assigned Garments */}
            <div className="lg:col-span-2">
              <AssignedGarmentsTable />
            </div>

            {/* Right Column - Measurements and Progress */}
            <div className="flex flex-col gap-6">
              <MeasurementDetails />
              <WorkProgress />
            </div>
          </div>

          {/* Completed Garments */}
          <CompletedGarments />
        </div>
      </main>
    </div>
  );
}
