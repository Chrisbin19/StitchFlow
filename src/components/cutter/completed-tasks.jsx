import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download } from 'lucide-react';

export default function CompletedTasks() {
  const completedTasks = [
    {
      id: 'TASK-001',
      orderId: 'ORD-002',
      garment: 'Shirt',
      fabric: 'Cotton Blue',
      quantity: 2,
      completedTime: '09:30 AM',
      quality: 'Good',
    },
    {
      id: 'TASK-002',
      orderId: 'ORD-006',
      garment: 'Trouser',
      fabric: 'Denim Black',
      quantity: 1,
      completedTime: '10:45 AM',
      quality: 'Good',
    },
    {
      id: 'TASK-003',
      orderId: 'ORD-009',
      garment: 'Kurta',
      fabric: 'Linen White',
      quantity: 3,
      completedTime: '12:15 PM',
      quality: 'Excellent',
    },
    {
      id: 'TASK-004',
      orderId: 'ORD-012',
      garment: 'Dupatta',
      fabric: 'Chiffon Maroon',
      quantity: 1,
      completedTime: '02:00 PM',
      quality: 'Good',
    },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">Completed Today</h2>
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
                Garment
              </th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">
                Fabric
              </th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">
                Qty
              </th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">
                Completed
              </th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">
                Quality
              </th>
            </tr>
          </thead>
          <tbody>
            {completedTasks.map((task) => (
              <tr
                key={task.id}
                className="border-b border-border hover:bg-secondary/30 transition-colors"
              >
                <td className="py-3 px-4 font-medium text-primary">
                  {task.id}
                </td>
                <td className="py-3 px-4 text-foreground">{task.orderId}</td>
                <td className="py-3 px-4 text-foreground">{task.garment}</td>
                <td className="py-3 px-4 text-foreground text-xs">
                  {task.fabric}
                </td>
                <td className="py-3 px-4 text-center font-semibold">
                  {task.quantity}
                </td>
                <td className="py-3 px-4 text-foreground">
                  {task.completedTime}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      task.quality === 'Excellent'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {task.quality}
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
