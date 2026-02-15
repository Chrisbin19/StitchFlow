import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function FabricRackInfo({ userId }) {
  // TODO: Use userId for user-specific fabric rack info
  const racks = [
    { rackNo: 'R-12-A', fabric: 'Cotton Blue', length: '15 m', status: 'Available' },
    { rackNo: 'R-08-B', fabric: 'Silk Red', length: '8 m', status: 'Low Stock' },
    { rackNo: 'R-15-C', fabric: 'Linen White', length: '20 m', status: 'Available' },
    { rackNo: 'R-05-A', fabric: 'Chiffon Maroon', length: '5 m', status: 'Low Stock' },
  ];

  return (
    <Card className="p-6">
      <h2 className="text-lg font-bold text-foreground mb-4">Fabric Rack Info</h2>

      <div className="space-y-3">
        {racks.map((rack) => (
          <div
            key={rack.rackNo}
            className="p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
          >
            <div className="flex justify-between items-start mb-1">
              <div>
                <p className="font-semibold text-foreground text-sm">
                  {rack.rackNo}
                </p>
                <p className="text-xs text-muted-foreground">{rack.fabric}</p>
              </div>
              {rack.status === 'Low Stock' && (
                <AlertCircle className="w-4 h-4 text-orange-600" />
              )}
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">{rack.length}</span>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${rack.status === 'Available'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-orange-100 text-orange-800'
                  }`}
              >
                {rack.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
