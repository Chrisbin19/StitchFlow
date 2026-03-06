import { Button } from '@/components/ui/button';
import { Bell, Settings, LogOut, Scissors } from 'lucide-react';

export function AdminHeader() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/30 flex-shrink-0">
            <Scissors className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-black text-foreground leading-none">StitchFlow</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">Admin — Team Management</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
          >
            <Bell className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
          >
            <Settings className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
