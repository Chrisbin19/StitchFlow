import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import Link from 'next/link';
import NotificationBell from '@/components/admin/NotificationBell';
import { ThemeToggle } from '@/components/theme-toggle'; // Adjust path if necessary

export function Header() {
  return (
    <header className="border-b border-border bg-card sticky top-0 z-40 w-full backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* LEFT: BRANDING */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200">
            <span className="text-white font-bold text-lg">SF</span>
          </div>
          <div className="hidden md:block">
            <h2 className="text-xl font-bold text-foreground tracking-tight">StitchFlow</h2>
            <p className="text-xs text-muted-foreground font-medium">Tailoring Management OS</p>
          </div>
        </div>

        {/* RIGHT: ACTIONS */}
        <div className="flex items-center gap-2">
          
          {/* 1. NOTIFICATIONS (The Control Center) */}
          <div className="mr-1">
             <NotificationBell />
          </div>
          
          {/* 2. THEME TOGGLE (Sun/Moon Morph) */}
          <ThemeToggle />
          
          {/* 3. LOGOUT (Safety Valve) */}
          <Link href="/">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </Link>

        </div>
      </div>
    </header>
  );
}