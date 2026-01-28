import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

const ordersData = [
  {
    id: 'ORD-001',
    customer: 'Rajesh Kumar',
    garment: 'Formal Shirt',
    dueDate: '2026-02-05',
    status: 'Cutting',
    amount: '₹450',
    daysLeft: 8,
  },
  {
    id: 'ORD-002',
    customer: 'Priya Singh',
    garment: 'Saree Blouse',
    dueDate: '2026-02-03',
    status: 'Stitching',
    amount: '₹350',
    daysLeft: 6,
  },
  {
    id: 'ORD-003',
    customer: 'Amit Patel',
    garment: 'Trousers',
    dueDate: '2026-02-08',
    status: 'Pending',
    amount: '₹500',
    daysLeft: 11,
  },
  {
    id: 'ORD-004',
    customer: 'Sneha Verma',
    garment: 'Dress',
    dueDate: '2026-02-01',
    status: 'Quality Check',
    amount: '₹600',
    daysLeft: 4,
  },
  {
    id: 'ORD-005',
    customer: 'Vikram Singh',
    garment: 'Kurta',
    dueDate: '2026-02-10',
    status: 'Stitching',
    amount: '₹400',
    daysLeft: 13,
  },
];

const statusColors = {
  'Pending': { badge: 'bg-gray-100 text-gray-800', text: 'gray' },
  'Cutting': { badge: 'bg-blue-100 text-blue-800', text: 'blue' },
  'Stitching': { badge: 'bg-purple-100 text-purple-800', text: 'purple' },
  'Quality Check': { badge: 'bg-orange-100 text-orange-800', text: 'orange' },
  'Ready': { badge: 'bg-emerald-100 text-emerald-800', text: 'emerald' },
};

export function PendingOrdersTable() {
  return (
    <Card className="border border-border">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Recent Orders</CardTitle>
          <Button variant="ghost" size="sm" className="text-primary">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Order ID</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Customer</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Garment</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Due Date</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Amount</th>
                <th className="text-center py-3 px-4 text-muted-foreground font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {ordersData.map((order) => (
                <tr key={order.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 font-semibold text-foreground">{order.id}</td>
                  <td className="py-3 px-4 text-foreground">{order.customer}</td>
                  <td className="py-3 px-4 text-foreground">{order.garment}</td>
                  <td className="py-3 px-4">
                    <Badge 
                      className={`${statusColors[order.status]?.badge} border-0 font-medium`}
                    >
                      {order.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-foreground">
                    <div>
                      <p className="font-medium">{order.dueDate}</p>
                      <p className={`text-xs ${order.daysLeft <= 3 ? 'text-red-600' : 'text-muted-foreground'}`}>
                        {order.daysLeft} days left
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-foreground">{order.amount}</td>
                  <td className="py-3 px-4 text-center">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="inline-flex gap-2 text-primary"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
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
