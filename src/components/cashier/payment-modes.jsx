import { Card } from '@/components/ui/card';

export default function PaymentModes() {
  const modes = [
    { name: 'Cash', count: 8, icon: '💵' },
    { name: 'UPI', count: 5, icon: '📱' },
    { name: 'Card', count: 2, icon: '🏦' },
    { name: 'Cheque', count: 0, icon: '📋' },
  ];

  return (
    <Card className="p-6">
      <h2 className="text-lg font-bold text-foreground mb-4">Payment Methods</h2>
      
      <div className="space-y-3">
        {modes.map((mode) => (
          <div
            key={mode.name}
            className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{mode.icon}</span>
              <span className="font-medium text-foreground">{mode.name}</span>
            </div>
            <span className="text-sm font-bold text-primary">{mode.count}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
