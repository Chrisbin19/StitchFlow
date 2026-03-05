"use client";

import { Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
// 1. Import your newly created notification component
import CutterNotificationBell from "./CutterNotificationBell";

export default function CutterHeader({ userId, userName }) {
  // 2. Define what happens when the cutter clicks a specific task in the bell
  const handleTaskSelect = (task) => {
    console.log("Cutter selected task:", task.id);
    // Optional: You can add logic here to scroll the task into view
    // or open a detailed measurement modal for that specific order.
  };

  return (
    <header className="border-b border-border bg-card sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">
            StitchFlow
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            {userName
              ? `Cutter Dashboard — Welcome, ${userName}`
              : "Cutter Dashboard"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* 3. Replaced the static Button with your Live Notification Component */}
          <CutterNotificationBell onSelectTask={handleTaskSelect} />

          <Link href={`/cutter/${userId}/profile`}>
            <Button variant="outline" size="icon" className="hover:bg-accent">
              <Settings className="w-5 h-5 text-slate-600" />
            </Button>
          </Link>

          <Link href="/">
            <Button
              variant="outline"
              size="icon"
              className="text-destructive bg-transparent hover:bg-destructive/10 border-destructive/20"
              onClick={() => {
                // Clear session on logout
                localStorage.clear();
              }}
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
