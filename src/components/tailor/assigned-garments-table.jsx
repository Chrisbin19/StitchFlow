import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, CheckCircle } from 'lucide-react';

export default function AssignedGarmentsTable({ userId }) {
  // TODO: In the future, use userId to filter garments from Firestore
  // Example: where("assignedTo", "==", userId)
  const garments = [
    {
      id: 'TASK-001',
      orderId: 'ORD-001',
      customer: 'Raj Kumar',
      garment: 'Shirt',
      style: 'Formal with pockets',
      dueDate: '2024-02-15',
      status: 'In Progress',
      progress: 75,
    },
    {
      id: 'TASK-003',
      orderId: 'ORD-003',
      customer: 'Suresh Kumar',
      garment: 'Trouser',
      style: 'Casual fit',
      dueDate: '2024-02-12',
      status: 'In Progress',
      progress: 50,
    },
    {
      id: 'TASK-005',
      orderId: 'ORD-005',
      customer: 'Priya Singh',
      garment: 'Saree Blouse',
      style: 'Back design',
      dueDate: '2024-02-10',
      status: 'Pending',
      progress: 0,
    },
    {
      id: 'TASK-007',
      orderId: 'ORD-008',
      customer: 'Anil Patel',
      garment: 'Kurta',
      style: 'With embroidery',
      dueDate: '2024-02-20',
      status: 'Ready for QC',
      progress: 100,
    },
    {
      id: 'TASK-010',
      orderId: 'ORD-015',
      customer: 'Vikram Reddy',
      garment: 'Shirt',
      style: 'Casual',
      dueDate: '2024-02-25',
      status: 'In Progress',
      progress: 40,
    },
  ];

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold text-foreground mb-4">Assigned Garments</h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-semibold text-foreground">
                <Checkbox />
              </th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">
                Task ID
              </th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">
                Customer
              </th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">
                Garment
              </th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">
                Style Details
              </th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">
                Due Date
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
            {garments.map((garment) => (
              <tr
                key={garment.id}
                className="border-b border-border hover:bg-secondary/30 transition-colors"
              >
                <td className="py-3 px-4">
                  <Checkbox />
                </td>
                <td className="py-3 px-4 font-medium text-primary">
                  {garment.id}
                </td>
                <td className="py-3 px-4 text-foreground">{garment.customer}</td>
                <td className="py-3 px-4 text-foreground font-medium">
                  {garment.garment}
                </td>
                <td className="py-3 px-4 text-foreground text-sm">
                  {garment.style}
                </td>
                <td className="py-3 px-4 text-foreground">{garment.dueDate}</td>
                <td className="py-3 px-4">
                  <div className="w-16 bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${garment.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {garment.progress}%
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${garment.status === 'Ready for QC'
                      ? 'bg-emerald-100 text-emerald-800'
                      : garment.status === 'In Progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                      }`}
                  >
                    {garment.status}
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
                    {garment.status !== 'Ready for QC' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-9 h-9 p-0 bg-transparent"
                        title="Mark Ready for QC"
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
