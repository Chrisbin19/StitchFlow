'use client';

import { useState } from 'react';
import { Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import CashierNotificationBell from './CashierNotificationBell';
import PaymentCollectionDialog from './PaymentCollectionDialog';

export default function CashierHeader() {
  const [selectedOrder, setSelectedOrder] = useState(null);

  return (
    <>
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">StitchFlow</h1>
            <p className="text-sm text-muted-foreground">Cashier Dashboard</p>
          </div>

          <div className="flex items-center gap-3">
            <CashierNotificationBell onCollect={(order) => setSelectedOrder(order)} />
            <Link href="/cashier/profile">
              <Button variant="outline" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="icon" className="text-destructive bg-transparent">
                <LogOut className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Payment Collection Dialog — triggered by notification click */}
      <PaymentCollectionDialog
        order={selectedOrder}
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </>
  );
}
