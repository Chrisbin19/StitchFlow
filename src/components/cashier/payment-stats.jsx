import { Card } from '@/components/ui/card';
import { IndianRupee, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

export default function PaymentStats() {
  const stats = [
    {
      title: 'Today Collection',
      value: '₹45,320',
      icon: IndianRupee,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      title: 'Pending Payments',
      value: '₹1,28,450',
      icon: AlertCircle,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
    },
    {
      title: 'Paid Today',
      value: '15',
      icon: CheckCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
    },
    {
      title: 'Monthly Target',
      value: '₹8,50,000',
      icon: TrendingUp,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
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
