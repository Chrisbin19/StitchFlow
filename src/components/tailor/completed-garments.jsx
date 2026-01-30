import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download } from 'lucide-react';

export default function CompletedGarments() {
  const completed = [
    {
      id: 'TASK-002',
      orderId: 'ORD-002',
      customer: 'Suresh Kumar',
      garment: 'Shirt',
      style: 'Formal',
      completedTime: '09:15 AM',
      quality: 'Excellent',
    },
    {
      id: 'TASK-004',
      orderId: 'ORD-004',
      customer: 'Deepak Singh',
      garment: 'Kurta',
      style: 'Casual',
      completedTime: '11:00 AM',
      quality: 'Good',
    },
    {
      id: 'TASK-006',
      orderId: 'ORD-007',
      customer: 'Kavya Nair',
      garment: 'Dupatta',
      style: 'Printed',
      completedTime: '01:30 PM',
      quality: 'Excellent',
    },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">Ready for QC Today</h2>
        <CheckCircle className="w-6 h-6 text-emerald-600" />
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-semibold text-foreground">
                Task ID
              </th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">
                Order
              </th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">
                Customer
              </th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">
                Garment
              </th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">
                Style
              </th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">
                Time
              </th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">
                Quality
              </th>
            </tr>
          </thead>
          <tbody>
            {completed.map((item) => (
              <tr
                key={item.id}
                className="border-b border-border hover:bg-secondary/30 transition-colors"
              >
                <td className="py-3 px-4 font-medium text-primary">
                  {item.id}
                </td>
                <td className="py-3 px-4 text-foreground">{item.orderId}</td>
                <td className="py-3 px-4 text-foreground">{item.customer}</td>
                <td className="py-3 px-4 text-foreground">{item.garment}</td>
                <td className="py-3 px-4 text-foreground">{item.style}</td>
                <td className="py-3 px-4 text-foreground">{item.completedTime}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.quality === 'Excellent'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {item.quality}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
