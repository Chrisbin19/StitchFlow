import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Eye } from 'lucide-react';

export default function ReceiptHistory() {
  const receipts = [
    {
      id: 'REC-001',
      orderId: 'ORD-001',
      customer: 'Raj Kumar',
      amount: 1000,
      mode: 'Cash',
      date: '2024-02-08',
      time: '10:30 AM',
    },
    {
      id: 'REC-002',
      orderId: 'ORD-005',
      customer: 'Priya Singh',
      amount: 1800,
      mode: 'UPI',
      date: '2024-02-08',
      time: '11:15 AM',
    },
    {
      id: 'REC-003',
      orderId: 'ORD-008',
      customer: 'Anil Patel',
      amount: 2000,
      mode: 'Card',
      date: '2024-02-08',
      time: '02:45 PM',
    },
    {
      id: 'REC-004',
      orderId: 'ORD-012',
      customer: 'Meera Sharma',
      amount: 800,
      mode: 'Cash',
      date: '2024-02-07',
      time: '04:20 PM',
    },
  ];

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold text-foreground mb-4">Receipt History</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-semibold text-foreground">
                Receipt ID
              </th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">
                Order ID
              </th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">
                Customer
              </th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">
                Amount
              </th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">
                Mode
              </th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">
                Date & Time
              </th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {receipts.map((receipt) => (
              <tr
                key={receipt.id}
                className="border-b border-border hover:bg-secondary/30 transition-colors"
              >
                <td className="py-3 px-4 font-medium text-primary">
                  {receipt.id}
                </td>
                <td className="py-3 px-4 text-foreground">{receipt.orderId}</td>
                <td className="py-3 px-4 text-foreground">{receipt.customer}</td>
                <td className="py-3 px-4 font-semibold text-foreground">
                  ₹{receipt.amount}
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 rounded bg-primary/20 text-primary text-xs font-medium">
                    {receipt.mode}
                  </span>
                </td>
                <td className="py-3 px-4 text-foreground text-xs">
                  {receipt.date}
                  <br />
                  {receipt.time}
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="w-8 h-8 p-0 bg-transparent">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="w-8 h-8 p-0 bg-transparent">
                      <Download className="w-4 h-4" />
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
