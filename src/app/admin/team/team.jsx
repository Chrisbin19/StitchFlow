'use client';

import { useState } from 'react';
import Header from '@/components/admin/header';
import TeamStats from '@/components/admin/team-stats';
import { TeamRoster } from '@/components/admin/team-roster';
import { AddStaffForm } from '@/components/admin/add-staff-form';

export default function AdminTeamPage() {
  const [workers, setWorkers] = useState([
    {
      id: 1,
      name: 'Arjun Patel',
      email: 'arjun.patel@stitchflow.com',
      role: 'Cutter',
      status: 'Active',
      activeOrders: 8,
      joinedDate: '2025-01-15',
    },
    {
      id: 2,
      name: 'Priya Sharma',
      email: 'priya.sharma@stitchflow.com',
      role: 'Tailor',
      status: 'Active',
      activeOrders: 12,
      joinedDate: '2025-02-01',
    },
    {
      id: 3,
      name: 'Vikram Singh',
      email: 'vikram.singh@stitchflow.com',
      role: 'Cutter',
      status: 'Active',
      activeOrders: 6,
      joinedDate: '2025-01-20',
    },
    {
      id: 4,
      name: 'Neha Gupta',
      email: 'neha.gupta@stitchflow.com',
      role: 'Cashier',
      status: 'Active',
      activeOrders: 15,
      joinedDate: '2025-01-10',
    },
    {
      id: 5,
      name: 'Ramesh Kumar',
      email: 'ramesh.kumar@stitchflow.com',
      role: 'Tailor',
      status: 'Active',
      activeOrders: 10,
      joinedDate: '2025-02-05',
    },
  ]);

  const handleAddStaff = (newStaff) => {
    setWorkers((prev) => [newStaff, ...prev]);
  };

  const handleDeleteWorker = (id) => {
    setWorkers((prev) => prev.filter((worker) => worker.id !== id));
  };

  const totalOrders = workers.reduce((sum, worker) => sum + worker.activeOrders, 0);
  const cutters = workers.filter((w) => w.role === 'Cutter').length;
  const tailors = workers.filter((w) => w.role === 'Tailor').length;
  const cashiers = workers.filter((w) => w.role === 'Cashier').length;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="p-6">
        <div className="grid gap-6">
          {/* Page Title */}
          <div>
            <h1 className="text-4xl font-bold text-primary">Team Management</h1>
            <p className="text-muted-foreground mt-2">Manage your staff, assign roles, and monitor team workload</p>
          </div>

          {/* Team Statistics */}
          <TeamStats
            totalWorkers={workers.length}
            cutters={cutters}
            tailors={tailors}
            cashiers={cashiers}
            totalOrders={totalOrders}
          />

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Add Staff Form */}
            <div className="lg:col-span-1">
              <AddStaffForm onAddStaff={handleAddStaff} />
            </div>

            {/* Right Column - Team Roster */}
            <div className="lg:col-span-2">
              <TeamRoster workers={workers} onDeleteWorker={handleDeleteWorker} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
