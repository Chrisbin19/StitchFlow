"use client";

import { Settings, LogOut, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import CutterNotificationBell from "./CutterNotificationBell";

export default function CutterHeader({ userId, userName }) {
  const handleTaskSelect = (task) => {
    console.log("Cutter selected task:", task.id);
  };

  return (
    <header className="border-b border-border bg-card sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/30 flex-shrink-0">
            <Scissors className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-black text-foreground tracking-tight leading-none">StitchFlow</h1>
            <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
              {userName ? `Cutter Dashboard · ${userName}` : "Cutter Dashboard"}
            </p>
          </div>
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
