import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, Eye as Eye2, CreditCard } from 'lucide-react';

export default function PendingPaymentsTable() {
  const pendingPayments = [
    {
      id: 'ORD-001',
      customer: 'Raj Kumar',
      garment: 'Shirt & Trouser',
      totalAmount: 2500,
      paid: 1000,
      pending: 1500,
      status: 'Partial',
      dueDate: '2024-02-15',
    },
    {
      id: 'ORD-005',
      customer: 'Priya Singh',
      garment: 'Saree Blouse',
      totalAmount: 1800,
      paid: 0,
      pending: 1800,
      status: 'Pending',
      dueDate: '2024-02-10',
    },
    {
      id: 'ORD-008',
      customer: 'Anil Patel',
      garment: 'Kurta & Pajama',
      totalAmount: 3200,
      paid: 2000,
      pending: 1200,
      status: 'Partial',
      dueDate: '2024-02-20',
    },
    {
      id: 'ORD-012',
      customer: 'Meera Sharma',
      garment: 'Dupatta',
      totalAmount: 800,
      paid: 0,
      pending: 800,
      status: 'Pending',
      dueDate: '2024-02-18',
    },
    {
      id: 'ORD-015',
      customer: 'Vikram Reddy',
      garment: 'Shirt',
      totalAmount: 1500,
      paid: 750,
      pending: 750,
      status: 'Partial',
      dueDate: '2024-02-25',
    },
  ];

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold text-foreground mb-4">Pending Payments</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-semibold text-foreground">
                <Checkbox />
              </th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">
                Order ID
              </th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">
                Customer
              </th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">
                Garment
              </th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">
                Total
              </th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">
                Paid
              </th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">
                Pending
              </th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">
                Status
              </th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {pendingPayments.map((payment) => (
              <tr
                key={payment.id}
                className="border-b border-border hover:bg-secondary/30 transition-colors"
              >
                <td className="py-3 px-4">
                  <Checkbox />
                </td>
                <td className="py-3 px-4 font-medium text-primary">
                  {payment.id}
                </td>
                <td className="py-3 px-4 text-foreground">{payment.customer}</td>
                <td className="py-3 px-4 text-foreground">{payment.garment}</td>
                <td className="py-3 px-4 font-semibold text-foreground">
                  ₹{payment.totalAmount}
                </td>
                <td className="py-3 px-4 text-emerald-600 font-medium">
                  ₹{payment.paid}
                </td>
                <td className="py-3 px-4 text-orange-600 font-medium">
                  ₹{payment.pending}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      payment.status === 'Paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : payment.status === 'Partial'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {payment.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-9 h-9 p-0 bg-transparent"
                      title="Collect Payment"
                    >
                      <CreditCard className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
