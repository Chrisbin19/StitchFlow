import { Card } from '@/components/ui/card';

export default function TaskProgress() {
  const progressData = [
    { label: 'Pending', count: 3, percentage: 25, color: 'bg-gray-400' },
    { label: 'In Progress', count: 5, percentage: 42, color: 'bg-blue-500' },
    { label: 'Completed', count: 4, percentage: 33, color: 'bg-emerald-500' },
  ];

  const total = progressData.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className="p-6">
      <h2 className="text-lg font-bold text-foreground mb-4">Today's Progress</h2>
      
      <div className="space-y-4">
        {progressData.map((item) => (
          <div key={item.label}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-foreground">
                {item.label}
              </span>
              <span className="text-sm font-bold text-primary">{item.count}</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className={`${item.color} h-2 rounded-full transition-all`}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-foreground">Total Tasks</span>
          <span className="text-xl font-bold text-primary">{total}</span>
        </div>
      </div>
    </Card>
  );
}
