'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

const tasksData = [
  { id: 1, title: 'Cut fabric for ORD-001 (Formal Shirt)', assignedTo: 'Cutter - Ahmed', priority: 'High', dueTime: '2:00 PM', completed: false },
  { id: 2, title: 'Stitch sleeves for ORD-002 (Saree Blouse)', assignedTo: 'Tailor - Fatima', priority: 'High', dueTime: '1:30 PM', completed: false },
  { id: 3, title: 'Quality check ORD-004 (Dress)', assignedTo: 'QC - Hassan', priority: 'Medium', dueTime: '3:00 PM', completed: false },
  { id: 4, title: 'Measure customer for ORD-005 (Kurta)', assignedTo: 'Supervisor - Leila', priority: 'Medium', dueTime: '4:00 PM', completed: true },
  { id: 5, title: 'Iron finished garments ORD-003', assignedTo: 'Helper - Omar', priority: 'Low', dueTime: '5:00 PM', completed: false },
];

const priorityChip = (p) => {
  if (p === 'High') return { bg: 'rgba(220,38,38,0.12)', text: 'var(--adm-red)', br: 'rgba(248,113,113,0.25)', accent: 'var(--adm-red)' };
  if (p === 'Medium') return { bg: 'rgba(217,119,6,0.12)', text: 'var(--adm-amber-c)', br: 'rgba(251,191,36,0.25)', accent: 'var(--adm-amber-c)' };
  return { bg: 'rgba(5,150,105,0.12)', text: 'var(--adm-emerald)', br: 'rgba(16,185,129,0.25)', accent: 'var(--adm-emerald)' };
};

export function TasksList() {
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{
      borderRadius: 14,
      border: '1px solid var(--adm-border)',
      background: 'var(--adm-card)',
      boxShadow: 'var(--adm-shadow)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--adm-border)' }}>
        <h2 className="adm-font-display text-sm font-black uppercase tracking-wide"
          style={{ color: 'var(--adm-text)' }}>Today&apos;s Tasks</h2>
        <button
          className="flex items-center gap-1 text-xs font-semibold"
          style={{ color: 'var(--adm-blue-c)', background: 'transparent', border: 'none', cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
          onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
        >
          View All <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Task rows */}
      <div className="p-4 space-y-2.5">
        {tasksData.map((task) => {
          const chip = priorityChip(task.priority);
          const isHovered = hovered === task.id;
          return (
            <div key={task.id}
              onMouseEnter={() => setHovered(task.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '14px 16px',
                borderRadius: 10,
                border: '1px solid var(--adm-border)',
                background: isHovered ? 'rgba(16,185,129,0.06)' : (task.completed ? 'var(--adm-card-alt)' : 'var(--adm-badge)'),
                borderLeft: isHovered ? `3px solid ${chip.accent}` : '1px solid var(--adm-border)',
                transform: isHovered ? 'translateY(-1px)' : 'translateY(0)',
                boxShadow: isHovered ? 'var(--adm-shadow-d)' : 'none',
                transition: 'background 200ms ease, transform 150ms ease, box-shadow 150ms ease, border 150ms ease',
                cursor: 'default',
              }}
            >
              {/* Checkbox */}
              <div style={{
                width: 16, height: 16, borderRadius: 4, flexShrink: 0, marginTop: 2,
                border: task.completed ? '2px solid var(--adm-emerald)' : '1.5px solid rgba(255,255,255,0.20)',
                background: task.completed ? 'var(--adm-emerald)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {task.completed && (
                  <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                    <polyline points="1.5,4.5 3.5,6.5 7.5,2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-snug"
                      style={{
                        color: task.completed ? 'var(--adm-text-xs)' : 'var(--adm-text)',
                        textDecoration: task.completed ? 'line-through' : 'none'
                      }}>
                      {task.title}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--adm-text-sm)' }}>
                      {task.assignedTo}
                    </p>
                  </div>
                  {/* Priority chip */}
                  <span className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: chip.bg, color: chip.text, border: `1px solid ${chip.br}` }}>
                    {task.priority}
                  </span>
                </div>
                <p className="text-[11px] mt-1.5" style={{ color: 'var(--adm-text-xs)' }}>
                  Due: {task.dueTime}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
