import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const paymentsData = [
  {
    orderId: 'ORD-001',
    customer: 'Rajesh Kumar',
    total: '₹450',
    paid: '₹225',
    remaining: '₹225',
    status: 'Partial',
  },
  {
    orderId: 'ORD-002',
    customer: 'Priya Singh',
    total: '₹350',
    paid: '₹0',
    remaining: '₹350',
    status: 'Pending',
  },
  {
    orderId: 'ORD-003',
    customer: 'Amit Patel',
    total: '₹500',
    paid: '₹500',
    remaining: '₹0',
    status: 'Paid',
  },
  {
    orderId: 'ORD-004',
    customer: 'Sneha Verma',
    total: '₹600',
    paid: '₹0',
    remaining: '₹600',
    status: 'Pending',
  },
];

export function PaymentOverview() {
  return (
    <Card className="border border-border">
      <CardHeader className="border-b border-border">
        <CardTitle className="text-lg">Payment Status</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-3">
          {paymentsData.map((payment) => (
            <div key={payment.orderId} className="p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-sm text-foreground">
                    {payment.orderId}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {payment.customer}
                  </p>
                </div>
                <Badge 
                  className={`text-xs border-0 ${
                    payment.status === 'Paid' 
                      ? 'bg-emerald-100 text-emerald-800'
                      : payment.status === 'Partial'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {payment.status}
                </Badge>
              </div>
              <div className="bg-muted/30 rounded p-2 mb-2">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-muted-foreground">Total: {payment.total}</span>
                  <span className="text-foreground font-medium">{payment.paid} / {payment.total}</span>
                </div>
                <div className="w-full bg-border rounded-full h-1.5">
                  <div 
                    className="bg-primary rounded-full h-1.5"
                    style={{
                      width: `${(parseFloat(payment.paid.replace('₹', '')) / parseFloat(payment.total.replace('₹', ''))) * 100}%`
                    }}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Remaining: <span className="font-semibold text-foreground">{payment.remaining}</span>
              </p>
            </div>
          ))}
        </div>
        <Button className="w-full mt-4 bg-primary hover:bg-primary/90">
          View All Payments
        </Button>
      </CardContent>
    </Card>
  );
}
