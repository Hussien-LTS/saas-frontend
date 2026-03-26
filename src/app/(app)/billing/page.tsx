// app/(app)/billing/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTenantStore } from '@/store/tenant.store';
import { api } from '@/lib/api';
import type { BillingPlan, TenantPlan, TenantRole } from '@/types/api';
import { PlanCard } from '@/components/billing/plan-card';

const ALL_PLANS: {
  plan: TenantPlan;
  limits: { members: number; projects: number };
}[] = [
  { plan: 'FREE', limits: { members: 3, projects: 2 } },
  { plan: 'PRO', limits: { members: 20, projects: 20 } },
  { plan: 'ENTERPRISE', limits: { members: 999, projects: 999 } },
];

const CAN_MANAGE: TenantRole[] = ['OWNER', 'ADMIN'];

const stagger = {
  container: {
    animate: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
  },
  item: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  },
};

export default function BillingPage() {
  const { activeTenant } = useTenantStore();
  const [billing, setBilling] = useState<BillingPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgradingPlan, setUpgradingPlan] = useState<TenantPlan | null>(null);

  const canManage = CAN_MANAGE.includes(activeTenant?.role as TenantRole);

  useEffect(() => {
    if (!activeTenant) return;
    const load = async () => {
      try {
        const { data } = await api.get<BillingPlan>('/billing/plan');
        setBilling(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [activeTenant]);

  const PLAN_ORDER: Record<TenantPlan, number> = {
    FREE: 0,
    PRO: 1,
    ENTERPRISE: 2,
  };

  const handleUpgrade = async (plan: TenantPlan) => {
    if (!canManage) return;
    // Forbid downgrade
    if (PLAN_ORDER[plan] <= PLAN_ORDER[currentPlan as TenantPlan]) return;
    setUpgradingPlan(plan);
    try {
      const { data } = await api.post<{ checkoutUrl: string }>(
        '/billing/checkout',
        { plan },
      );
      window.location.href = data.checkoutUrl;
    } catch (err) {
      console.error(err);
      setUpgradingPlan(null);
    }
  };

  const currentPlan = billing?.plan ?? activeTenant?.plan ?? 'FREE';

  return (
    <motion.div
      variants={stagger.container}
      initial="initial"
      animate="animate"
      className="space-y-10"
    >
      {/* Header */}
      <motion.div variants={stagger.item} className="max-w-4xl space-y-1">
        <div className="h-1 w-8 bg-amber-400 mb-4" />
        <h1 className="text-3xl font-black tracking-tight text-zinc-950">
          Billing
        </h1>
        <p className="text-sm text-zinc-500">
          {canManage
            ? 'Manage your workspace plan and usage.'
            : 'View your workspace plan. Contact an admin to upgrade.'}
        </p>
      </motion.div>

      {/* Current plan summary */}
      {!loading && billing && (
        <motion.div
          variants={stagger.item}
          className="max-w-4xl border-2 border-zinc-100 p-5 flex items-center justify-between"
        >
          <div className="space-y-0.5">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Active plan
            </p>
            <p className="text-lg font-black tracking-tight text-zinc-950">
              {currentPlan}
            </p>
          </div>

          <div className="flex items-center gap-8">
            <UsagePill
              label="Members"
              used={0}
              limit={billing.limits.members}
            />
            <UsagePill
              label="Projects"
              used={0}
              limit={billing.limits.projects}
            />
          </div>
        </motion.div>
      )}

      {/* Skeleton summary */}
      {loading && (
        <div className="max-w-4xl border-2 border-zinc-100 p-5 h-20 animate-pulse bg-zinc-50" />
      )}

      {/* Plan cards */}
      <motion.div variants={stagger.item} className="space-y-4 ">
        <h2 className="text-xl   font-semibold uppercase tracking-widest text-zinc-400 text-center ">
          Available plans
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-72 border-2 border-zinc-100 animate-pulse bg-zinc-50"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {ALL_PLANS.map(({ plan, limits }) => (
              <PlanCard
                key={plan}
                plan={plan}
                limits={limits}
                current={plan === currentPlan}
                upgrading={upgradingPlan === plan}
                onUpgrade={
                  canManage &&
                  plan !== currentPlan &&
                  PLAN_ORDER[plan] > PLAN_ORDER[currentPlan as TenantPlan]
                    ? () => handleUpgrade(plan)
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Non-admin notice */}
      {!canManage && (
        <motion.div
          variants={stagger.item}
          className="max-w-4xl border-2 border-dashed border-zinc-200 p-4 flex items-center gap-3"
        >
          <svg
            className="h-4 w-4 text-zinc-300 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-xs text-zinc-400">
            Only admins and owners can change the plan. Contact your workspace
            admin to upgrade.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── Usage pill ───────────────────────────────────────────────────────────────

function UsagePill({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number;
}) {
  const pct = limit === 0 ? 0 : Math.min((used / limit) * 100, 100);
  const danger = pct >= 80;

  return (
    <div className="space-y-1 min-w-[80px]">
      <div className="flex justify-between">
        <span className="text-[10px] text-zinc-400 font-medium">{label}</span>
        <span className="text-[10px] text-zinc-400">
          {used}/{limit === 999 ? '∞' : limit}
        </span>
      </div>
      <div className="h-1 w-full bg-zinc-100 overflow-hidden">
        <motion.div
          className={`h-full ${danger ? 'bg-red-400' : 'bg-amber-400'}`}
          initial={{ width: '0%' }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
