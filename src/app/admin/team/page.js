'use client';

import { useState } from 'react';
import { AdminHeader } from '@/components/team/header';
import { TeamStats } from '@/components/team/team-stats';
import { TeamRoster } from '@/components/team/team-roster';
import { AddStaffForm } from '@/components/team/add-staff-form';

export default function AdminTeamPage() {
  const [workers, setWorkers] = useState([
    {
      id: 1,
      name: 'Ravi Kumar',
      email: 'ravi.kumar@stitchflow.com',
      role: 'Cutter',
      status: 'Active',
      activeOrders: 5,
      joinedDate: '2025-06-15',
    },
    {
      id: 2,
      name: 'Priya Sharma',
      email: 'priya.sharma@stitchflow.com',
      role: 'Tailor',
      status: 'Active',
      activeOrders: 8,
      joinedDate: '2025-07-20',
    },
    {
      id: 3,
      name: 'Amit Patel',
      email: 'amit.patel@stitchflow.com',
      role: 'Tailor',
      status: 'Active',
      activeOrders: 6,
      joinedDate: '2025-08-10',
    },
    {
      id: 4,
      name: 'Neha Singh',
      email: 'neha.singh@stitchflow.com',
      role: 'Cashier',
      status: 'Active',
      activeOrders: 0,
      joinedDate: '2025-09-05',
    },
    {
      id: 5,
      name: 'Vikram Reddy',
      email: 'vikram.reddy@stitchflow.com',
      role: 'Cutter',
      status: 'Active',
      activeOrders: 7,
      joinedDate: '2025-09-12',
    },
  ]);

  const handleAddStaff = (newStaff) => {
    setWorkers((prev) => [newStaff, ...prev]);
  };

  const handleDeleteWorker = (id) => {
    setWorkers((prev) => prev.filter((w) => w.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Team Management</h1>
          <p className="text-muted-foreground">
            Manage your StitchFlow team, track workload, and onboard new staff members
          </p>
        </div>

        {/* Team Statistics */}
        <div className="mb-8">
          <TeamStats workers={workers} />
        </div>

        {/* Main Grid - Form and Roster */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Add Staff Form - Left Column */}
          <div className="lg:col-span-1">
            <AddStaffForm onAddStaff={handleAddStaff} />
          </div>

          {/* Team Roster - Right Column */}
          <div className="lg:col-span-2">
            <TeamRoster workers={workers} onDeleteWorker={handleDeleteWorker} />
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-primary mb-4">Team Management Tips</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold mt-0.5">•</span>
              <span>Monitor active orders for each team member to balance workload distribution</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold mt-0.5">•</span>
              <span>Ensure proper role assignment (Cutter, Tailor, Cashier) for efficient workflow</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold mt-0.5">•</span>
              <span>Use strong passwords and secure credentials when adding new staff members</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold mt-0.5">•</span>
              <span>Regularly review team performance and update staff information as needed</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
