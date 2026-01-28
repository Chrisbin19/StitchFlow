import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Calendar, User } from 'lucide-react';

const deliveriesData = [
  {
    orderId: 'ORD-001',
    customer: 'Rajesh Kumar',
    dueDate: '2026-02-05',
    garment: 'Formal Shirt',
    daysLeft: 8,
    priority: 'normal',
  },
  {
    orderId: 'ORD-002',
    customer: 'Priya Singh',
    dueDate: '2026-02-03',
    garment: 'Saree Blouse',
    daysLeft: 6,
    priority: 'urgent',
  },
  {
    orderId: 'ORD-004',
    customer: 'Sneha Verma',
    dueDate: '2026-02-01',
    garment: 'Dress',
    daysLeft: 4,
    priority: 'urgent',
  },
  {
    orderId: 'ORD-003',
    customer: 'Amit Patel',
    dueDate: '2026-02-08',
    garment: 'Trousers',
    daysLeft: 11,
    priority: 'normal',
  },
];

export function UpcomingDeliveries() {
  return (
    <Card className="border border-border">
      <CardHeader className="border-b border-border">
        <CardTitle className="text-lg">Upcoming Deliveries</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-3">
          {deliveriesData.map((delivery) => (
            <div 
              key={delivery.orderId}
              className={`p-3 rounded-lg border transition-colors ${
                delivery.priority === 'urgent'
                  ? 'border-red-300 bg-red-50 dark:bg-red-950/20'
                  : 'border-border hover:bg-muted/30'
              }`}
            >
              <div className="flex items-start gap-2 mb-2">
                {delivery.priority === 'urgent' && (
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-semibold text-sm text-foreground">
                    {delivery.orderId}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {delivery.garment}
                  </p>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {delivery.customer}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className={`font-medium ${
                    delivery.daysLeft <= 3 
                      ? 'text-red-600' 
                      : 'text-foreground'
                  }`}>
                    {delivery.dueDate}
                  </span>
                  <span className={`ml-auto font-semibold ${
                    delivery.daysLeft <= 3 
                      ? 'text-red-600' 
                      : 'text-muted-foreground'
                  }`}>
                    {delivery.daysLeft}d left
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
