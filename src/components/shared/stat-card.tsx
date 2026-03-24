// components/shared/stat-card.tsx
'use client';

import { motion } from 'framer-motion';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}

export function StatCard({ label, value, sub, accent }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`relative border-2 p-6 flex flex-col gap-3 overflow-hidden ${
        accent
          ? 'bg-zinc-950 border-zinc-950 text-white'
          : 'bg-white border-zinc-100 text-zinc-950'
      }`}
    >
      {/* Corner accent */}
      {accent && (
        <div
          aria-hidden
          className="absolute -right-4 -top-4 h-16 w-16 bg-amber-400 rotate-12 opacity-80"
        />
      )}

      <span
        className={`text-xs font-semibold uppercase tracking-widest ${
          accent ? 'text-zinc-400' : 'text-zinc-400'
        }`}
      >
        {label}
      </span>

      <span
        className={`text-4xl font-black tracking-tight leading-none ${
          accent ? 'text-white' : 'text-zinc-950'
        }`}
      >
        {value}
      </span>

      {sub && (
        <span
          className={`text-xs font-medium ${
            accent ? 'text-zinc-500' : 'text-zinc-400'
          }`}
        >
          {sub}
        </span>
      )}
    </motion.div>
  );
}
