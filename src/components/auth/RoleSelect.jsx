"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Banknote, Scissors, Shirt } from "lucide-react";

const roles = [
  { id: "Admin", label: "Admin", sublabel: "Management", icon: ShieldCheck, color: "indigo" },
  { id: "Supervisor/Manager", label: "Manager", sublabel: "Supervisor", icon: ShieldCheck, color: "violet" },
  { id: "Cashier", label: "Cashier", sublabel: "Payments", icon: Banknote, color: "emerald" },
  { id: "Cutter", label: "Cutter", sublabel: "Cutting", icon: Scissors, color: "orange" },
  { id: "Tailor", label: "Tailor", sublabel: "Stitching", icon: Shirt, color: "sky" },
];

const colorMap = {
  indigo: {
    selected: "border-indigo-500 bg-indigo-50 shadow-indigo-100",
    icon: "text-indigo-600 bg-indigo-100",
    text: "text-indigo-700",
  },
  violet: {
    selected: "border-violet-500 bg-violet-50 shadow-violet-100",
    icon: "text-violet-600 bg-violet-100",
    text: "text-violet-700",
  },
  emerald: {
    selected: "border-emerald-500 bg-emerald-50 shadow-emerald-100",
    icon: "text-emerald-600 bg-emerald-100",
    text: "text-emerald-700",
  },
  orange: {
    selected: "border-orange-500 bg-orange-50 shadow-orange-100",
    icon: "text-orange-600 bg-orange-100",
    text: "text-orange-700",
  },
  sky: {
    selected: "border-sky-500 bg-sky-50 shadow-sky-100",
    icon: "text-sky-600 bg-sky-100",
    text: "text-sky-700",
  },
};

export default function RoleSelect({ value, onChange }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
        Select Your Role
      </label>
      <div className="grid grid-cols-5 gap-2">
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = value === role.id;
          const colors = colorMap[role.color];

          return (
            <motion.button
              key={role.id}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => onChange(role.id)}
              className={`
                relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer
                ${isSelected
                  ? `${colors.selected} shadow-md border-2`
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }
              `}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isSelected ? colors.icon : "bg-gray-100 text-gray-400"}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className={`text-[10px] font-bold leading-tight text-center ${isSelected ? colors.text : "text-gray-500"}`}>
                {role.label}
              </span>
              {isSelected && (
                <motion.div
                  layoutId="roleIndicator"
                  className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full"
                  style={{ backgroundColor: `var(--color-${role.color}-500, #6366f1)` }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}