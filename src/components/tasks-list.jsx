import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

const tasksData = [
  {
    id: 1,
    title: 'Cut fabric for ORD-001 (Formal Shirt)',
    assignedTo: 'Cutter - Ahmed',
    priority: 'High',
    dueTime: '2:00 PM',
    completed: false,
  },
  {
    id: 2,
    title: 'Stitch sleeves for ORD-002 (Saree Blouse)',
    assignedTo: 'Tailor - Fatima',
    priority: 'High',
    dueTime: '1:30 PM',
    completed: false,
  },
  {
    id: 3,
    title: 'Quality check ORD-004 (Dress)',
    assignedTo: 'QC - Hassan',
    priority: 'Medium',
    dueTime: '3:00 PM',
    completed: false,
  },
  {
    id: 4,
    title: 'Measure customer for ORD-005 (Kurta)',
    assignedTo: 'Supervisor - Leila',
    priority: 'Medium',
    dueTime: '4:00 PM',
    completed: true,
  },
  {
    id: 5,
    title: 'Iron finished garments ORD-003',
    assignedTo: 'Helper - Omar',
    priority: 'Low',
    dueTime: '5:00 PM',
    completed: false,
  },
];

export function TasksList() {
  return (
    <Card className="border border-border">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Today's Tasks</CardTitle>
          <Button variant="ghost" size="sm" className="text-primary">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-3">
          {tasksData.map((task) => (
            <div
              key={task.id}
              className={`flex items-start gap-3 p-3 rounded-lg border border-border transition-colors hover:bg-muted/30 ${
                task.completed ? 'bg-muted/20' : 'bg-card'
              }`}
            >
              <Checkbox 
                checked={task.completed} 
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className={`font-medium text-sm ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {task.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {task.assignedTo}
                    </p>
                  </div>
                  <Badge 
                    variant="secondary"
                    className={`text-xs whitespace-nowrap ${
                      task.priority === 'High' 
                        ? 'bg-red-100 text-red-800 border-0' 
                        : task.priority === 'Medium'
                        ? 'bg-yellow-100 text-yellow-800 border-0'
                        : 'bg-emerald-100 text-emerald-800 border-0'
                    }`}
                  >
                    {task.priority}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Due: {task.dueTime}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
