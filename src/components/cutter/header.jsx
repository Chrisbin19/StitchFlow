import { Bell, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
export default function CutterHeader() {
  return (
    <header className="border-b border-border bg-card sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">StitchFlow</h1>
          <p className="text-sm text-muted-foreground">Cutter Dashboard</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon">
            <Bell className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="icon">
            <Settings className="w-5 h-5" />
          </Button>
          <Link href="/">
          <Button variant="outline" size="icon" className="text-destructive bg-transparent">
            <LogOut className="w-5 h-5" />
          </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
