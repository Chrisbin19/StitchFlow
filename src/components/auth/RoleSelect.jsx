"use client";

import { AlertCircle, Scissors, Shirt, Banknote } from "lucide-react";

export default function RoleSelect({ value, onChange }) {
  const roles = [
    { id: "Admin", label: "Admin", icon: AlertCircle, color: "#3B82F6" },   // Blue
    { id: "Cashier", label: "Cashier", icon: Banknote, color: "#7C3AED" },    // Violet
    { id: "Cutter", label: "Cutter", icon: Scissors, color: "#F97316" },      // Orange
    { id: "Tailor", label: "Tailor", icon: Shirt, color: "#10B981" },         // Emerald
  ];

  return (
    <div className="flex gap-2 w-full">
      {roles.map((r) => {
        const isSel = value === r.id;

        return (
          <button
            key={r.id}
            type="button"
            onClick={() => onChange(r.id)}
            className="flex-1 h-[72px] rounded-xl flex flex-col items-center justify-center transition-all duration-200 group"
            style={{
              background: isSel ? 'rgba(124,58,237,0.15)' : '#1A2236',
              border: isSel ? '1.5px solid #7C3AED' : '1px solid rgba(255,255,255,0.08)',
              boxShadow: isSel ? '0 0 16px rgba(124,58,237,0.20)' : 'none',
            }}
          >
            <r.icon
              className="w-5 h-5 mb-1.5 transition-colors"
              style={{ color: isSel ? r.color : '#8B95B0' }}
            />
            <span
              className="text-[10px] sm:text-[11px] font-medium transition-colors font-body"
              style={{ color: isSel ? '#FFFFFF' : '#8B95B0' }}
            >
              {r.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}