import { Card } from '@/components/ui/card';
import { Scissors, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function CutterStats() {
  const stats = [
    {
      title: 'Assigned Orders',
      value: '12',
      icon: Scissors,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      title: 'In Progress',
      value: '5',
      icon: Clock,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
    },
    {
      title: 'Completed Today',
      value: '7',
      icon: CheckCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
    },
    {
      title: 'Pending Fabrics',
      value: '3',
      icon: AlertCircle,
      color: 'text-red-600',
      bg: 'bg-red-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.bg} p-3 rounded-lg`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
