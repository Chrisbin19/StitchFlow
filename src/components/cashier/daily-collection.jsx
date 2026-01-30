import { Card } from '@/components/ui/card';
import { IndianRupee, TrendingUp } from 'lucide-react';

export default function DailyCollection() {
  const collections = [
    { label: 'Cash', amount: 25000, percentage: 55 },
    { label: 'UPI', amount: 15000, percentage: 33 },
    { label: 'Card', amount: 5320, percentage: 12 },
  ];

  return (
    <Card className="p-6">
      <h2 className="text-lg font-bold text-foreground mb-4">Daily Collection</h2>
      
      <div className="space-y-4">
        {collections.map((collection) => (
          <div key={collection.label}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-foreground">
                {collection.label}
              </span>
              <span className="text-sm font-bold text-primary">
                ₹{collection.amount.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${collection.percentage}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {collection.percentage}%
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-foreground">Total Today</span>
          <span className="text-xl font-bold text-primary">₹45,320</span>
        </div>
      </div>
    </Card>
  );
}
