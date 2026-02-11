import { Card, CardContent } from '@/components/ui/card';
import { Users, Scissors, BedDouble as Needle, CreditCard, TrendingUp } from 'lucide-react';

export function TeamStats({ totalWorkers, cutters, tailors, cashiers, totalOrders }) {

  const statsData = [
    {
      title: 'Total Team Members',
      value: totalWorkers,
      subtitle: 'Active staff',
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Cutters',
      value: cutters,
      subtitle: 'Cutting team',
      icon: Scissors,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Tailors',
      value: tailors,
      subtitle: 'Stitching team',
      icon: Needle,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Cashiers',
      value: cashiers,
      subtitle: 'Payment team',
      icon: CreditCard,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Total Active Orders',
      value: totalOrders,
      subtitle: 'Across all staff',
      icon: TrendingUp,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className="border border-border bg-card hover:shadow-lg transition-shadow"
          >
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default TeamStats;
