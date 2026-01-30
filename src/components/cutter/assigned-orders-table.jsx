import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, CheckCircle } from 'lucide-react';

export default function AssignedOrdersTable() {
  const orders = [
    {
      id: 'ORD-001',
      customer: 'Raj Kumar',
      garment: 'Shirt',
      fabric: 'Cotton Blue',
      rackNo: 'R-12-A',
      quantity: 2,
      dueDate: '2024-02-15',
      status: 'In Progress',
      progress: 60,
    },
    {
      id: 'ORD-005',
      customer: 'Priya Singh',
      garment: 'Saree Blouse',
      fabric: 'Silk Red',
      rackNo: 'R-08-B',
      quantity: 1,
      dueDate: '2024-02-10',
      status: 'Pending',
      progress: 0,
    },
    {
      id: 'ORD-008',
      customer: 'Anil Patel',
      garment: 'Kurta',
      fabric: 'Linen White',
      rackNo: 'R-15-C',
      quantity: 3,
      dueDate: '2024-02-20',
      status: 'In Progress',
      progress: 40,
    },
    {
      id: 'ORD-012',
      customer: 'Meera Sharma',
      garment: 'Dupatta',
      fabric: 'Chiffon Maroon',
      rackNo: 'R-05-A',
      quantity: 1,
      dueDate: '2024-02-18',
      status: 'Completed',
      progress: 100,
    },
    {
      id: 'ORD-015',
      customer: 'Vikram Reddy',
      garment: 'Shirt',
      fabric: 'Cotton White',
      rackNo: 'R-12-B',
      quantity: 2,
      dueDate: '2024-02-25',
      status: 'In Progress',
      progress: 75,
    },
  ];

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold text-foreground mb-4">Assigned Orders</h2>
      
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
                Fabric
              </th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">
                Rack No.
              </th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">
                Qty
              </th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">
                Progress
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
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-border hover:bg-secondary/30 transition-colors"
              >
                <td className="py-3 px-4">
                  <Checkbox />
                </td>
                <td className="py-3 px-4 font-medium text-primary">
                  {order.id}
                </td>
                <td className="py-3 px-4 text-foreground">{order.customer}</td>
                <td className="py-3 px-4 text-foreground">{order.garment}</td>
                <td className="py-3 px-4 text-foreground text-sm">
                  {order.fabric}
                </td>
                <td className="py-3 px-4 text-foreground font-medium">
                  {order.rackNo}
                </td>
                <td className="py-3 px-4 text-center font-semibold">
                  {order.quantity}
                </td>
                <td className="py-3 px-4">
                  <div className="w-16 bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${order.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {order.progress}%
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-9 h-9 p-0 bg-transparent"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {order.status !== 'Completed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-9 h-9 p-0 bg-transparent"
                        title="Mark Complete"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}
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
