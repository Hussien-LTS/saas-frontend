// components/billing/plan-card.tsx
'use client';

import { motion } from 'framer-motion';
import type { TenantPlan } from '@/types/api';

interface PlanCardProps {
  plan: TenantPlan;
  limits: { members: number; projects: number };
  current?: boolean;
  onUpgrade?: () => void;
  upgrading?: boolean;
}

const PLAN_META: Record<
  TenantPlan,
  { label: string; desc: string; accent: boolean }
> = {
  FREE: {
    label: 'Free',
    desc: 'For individuals and small teams getting started.',
    accent: false,
  },
  PRO: {
    label: 'Pro',
    desc: 'For growing teams that need more power.',
    accent: true,
  },
  ENTERPRISE: {
    label: 'Enterprise',
    desc: 'Unlimited everything for large organizations.',
    accent: false,
  },
};

export function PlanCard({
  plan,
  limits,
  current,
  onUpgrade,
  upgrading,
}: PlanCardProps) {
  const meta = PLAN_META[plan];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`relative border-2 p-8 flex flex-col gap-6 overflow-hidden min-h-[500px] ${
        meta.accent
          ? 'bg-zinc-950 border-zinc-950 text-white'
          : 'bg-white border-zinc-100 text-zinc-950'
      }`}
    >
      {/* Corner geometric accent + Most Popular badge */}
      {meta.accent && (
        <div className="absolute -right-8 -top-8 h-32 w-32 bg-amber-400 rotate-12 flex items-end justify-start p-2">
          <span
            style={{ transform: 'rotate(-12deg)' }}
            className="text-[9px] font-black tracking-widest uppercase text-zinc-950 leading-tight text-center"
          >
            Most
            <br />
            Popular
          </span>
        </div>
      )}

      {/* Current badge */}
      {current && (
        <div className="absolute top-4 right-4">
          <span
            className={`text-[10px] font-bold tracking-widest uppercase px-2 py-1 ${
              meta.accent
                ? 'bg-amber-400 text-zinc-950'
                : 'bg-zinc-100 text-zinc-500'
            }`}
          >
            Current
          </span>
        </div>
      )}

      {/* Plan name */}
      <div className="space-y-2">
        <p
          className={`text-[10px] font-semibold uppercase tracking-widest ${
            meta.accent ? 'text-zinc-400' : 'text-zinc-400'
          }`}
        >
          Plan
        </p>
        <h3
          className={`text-3xl font-black tracking-tight ${
            meta.accent ? 'text-white' : 'text-zinc-950'
          }`}
        >
          {meta.label}
        </h3>
        <p
          className={`text-sm ${
            meta.accent ? 'text-zinc-400' : 'text-zinc-500'
          }`}
        >
          {meta.desc}
        </p>
      </div>

      {/* Divider */}
      <div
        className={`h-px w-full ${meta.accent ? 'bg-zinc-800' : 'bg-zinc-100'}`}
      />

      {/* Limits */}
      <div className="space-y-3 flex-1">
        <LimitRow
          label="Members"
          value={limits.members === 999 ? 'Unlimited' : limits.members}
          accent={meta.accent}
        />
        <LimitRow
          label="Projects"
          value={limits.projects === 999 ? 'Unlimited' : limits.projects}
          accent={meta.accent}
        />
      </div>

      {/* Upgrade button */}
      {onUpgrade && !current && (
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={onUpgrade}
          disabled={upgrading}
          className="group relative w-full overflow-hidden bg-amber-400 text-zinc-950 text-xs font-bold py-3 tracking-wide mt-auto disabled:opacity-50"
        >
          <span className="absolute inset-0 bg-zinc-950 translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-300 ease-out" />
          <span className="relative group-hover:text-white transition-colors duration-300">
            {upgrading ? 'Redirecting…' : `Upgrade to ${meta.label}`}
          </span>
        </motion.button>
      )}

      {/* Current plan */}
      {current && (
        <div
          className={`w-full text-center text-xs font-semibold py-3 ${
            meta.accent ? 'text-zinc-600' : 'text-zinc-300'
          }`}
        >
          ✓ Your current plan
        </div>
      )}

      {/* Downgrade — no button, just a label */}
      {!onUpgrade && !current && (
        <div className="w-full text-center text-xs text-zinc-300 font-medium py-3 border-t border-zinc-100">
          Not available for downgrade
        </div>
      )}

      {/* Current plan — no button */}
      {current && (
        <div
          className={`w-full text-center text-xs font-semibold py-3 ${
            meta.accent ? 'text-zinc-600' : 'text-zinc-300'
          }`}
        >
          ✓ Your current plan
        </div>
      )}
    </motion.div>
  );
}

// ─── Limit row ────────────────────────────────────────────────────────────────

function LimitRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={`text-sm font-medium ${
          accent ? 'text-zinc-400' : 'text-zinc-500'
        }`}
      >
        {label}
      </span>
      <span
        className={`text-sm font-bold ${
          accent ? 'text-amber-400' : 'text-zinc-950'
        }`}
      >
        {value}
      </span>
    </div>
  );
}
