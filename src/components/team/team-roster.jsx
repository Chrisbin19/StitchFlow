'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Scissors, BedDouble as Needle, DollarSign, Trash2, Edit2 } from 'lucide-react';

export function TeamRoster({ workers, onDeleteWorker }) {
  const getRoleIcon = (role) => {
    switch (role) {
      case 'Cutter':
        return <Scissors className="w-4 h-4" />;
      case 'Tailor':
        return <Needle className="w-4 h-4" />;
      case 'Cashier':
        return <DollarSign className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getRoleBgColor = (role) => {
    switch (role) {
      case 'Cutter':
        return 'bg-orange-500/10 text-orange-700';
      case 'Tailor':
        return 'bg-emerald-500/10 text-emerald-700';
      case 'Cashier':
        return 'bg-blue-500/10 text-blue-700';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (workers.length === 0) {
    return (
      <Card className="border border-border bg-card">
        <CardHeader>
          <CardTitle className="text-primary">Team Roster</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No team members added yet. Add your first staff member below.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border bg-card">
      <CardHeader>
        <CardTitle className="text-primary">Team Roster</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Role</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Active Orders</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {workers.map((worker) => (
                <tr key={worker.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{worker.name}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{worker.email}</td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getRoleBgColor(
                        worker.role
                      )}`}
                    >
                      {getRoleIcon(worker.role)}
                      {worker.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                      {worker.activeOrders}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        worker.status === 'Active'
                          ? 'bg-emerald-500/10 text-emerald-700'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {worker.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => onDeleteWorker(worker.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
