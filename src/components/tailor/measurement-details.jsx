import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

export default function MeasurementDetails() {
  const measurements = [
    {
      orderId: 'ORD-001',
      customer: 'Raj Kumar',
      garment: 'Shirt',
      chest: '38"',
      waist: '32"',
      length: '28"',
      sleeve: '21"',
    },
    {
      orderId: 'ORD-005',
      customer: 'Priya Singh',
      garment: 'Saree Blouse',
      chest: '34"',
      waist: '28"',
      length: '18"',
      sleeve: '16"',
    },
  ];

  return (
    <Card className="p-6">
      <h2 className="text-lg font-bold text-foreground mb-4">Measurements</h2>
      
      <div className="space-y-4">
        {measurements.map((m) => (
          <div
            key={m.orderId}
            className="p-4 bg-secondary/30 rounded-lg border border-border"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-semibold text-foreground text-sm">
                  {m.customer}
                </p>
                <p className="text-xs text-muted-foreground">
                  {m.orderId} - {m.garment}
                </p>
              </div>
              <Button size="sm" variant="outline" className="w-8 h-8 p-0 bg-transparent">
                <Eye className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Chest:</span>
                <p className="font-semibold text-foreground">{m.chest}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Waist:</span>
                <p className="font-semibold text-foreground">{m.waist}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Length:</span>
                <p className="font-semibold text-foreground">{m.length}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Sleeve:</span>
                <p className="font-semibold text-foreground">{m.sleeve}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
