"use client";

import { Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
// 1. Import your new Tailor Notification component
import TailorNotificationBell from "./TailorNotificationBell";

export default function TailorHeader({ userId, userName }) {
  return (
    <header className="border-b border-border bg-card sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">
            StitchFlow
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            {userName
              ? `Tailor Dashboard • Welcome, ${userName}`
              : "Tailor Dashboard"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* 2. Replace the static Bell button with the dynamic component */}
          <TailorNotificationBell
            userId={userId}
            onSelectTask={(task) =>
              console.log("Selected task for stitching:", task)
            }
          />

          <Link href={`/tailor/${userId}/profile`}>
            <Button variant="outline" size="icon" title="Settings">
              <Settings className="w-5 h-5 text-slate-600" />
            </Button>
          </Link>

          <Link href="/">
            <Button
              variant="outline"
              size="icon"
              className="text-destructive hover:bg-destructive/5 border-destructive/20"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
