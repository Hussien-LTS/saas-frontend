// app/(app)/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth.store';
import { useTenantStore } from '@/store/tenant.store';
import { api } from '@/lib/api';
import { StatCard } from '@/components/shared/stat-card';
import type { BillingPlan, TenantDetail } from '@/types/api';

const PLAN_LIMITS = {
  FREE: { members: 3, projects: 2 },
  PRO: { members: 20, projects: 20 },
  ENTERPRISE: { members: 999, projects: 999 },
};

const stagger = {
  container: {
    animate: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
  },
  item: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  },
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { activeTenant } = useTenantStore();

  const [billing, setBilling] = useState<BillingPlan | null>(null);
  const [tenant, setTenant] = useState<TenantDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeTenant) return;

    const load = async () => {
      try {
        const [billingRes, tenantRes] = await Promise.all([
          api.get<BillingPlan>('/billing/plan'),
          api.get<TenantDetail>(`/tenants/${activeTenant.id}`),
        ]);
        setBilling(billingRes.data);
        setTenant(tenantRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [activeTenant]);

  const memberCount = tenant?.users.length ?? 0;
  const memberLimit =
    billing?.limits.members ??
    PLAN_LIMITS[activeTenant?.plan ?? 'FREE'].members;
  const projectLimit =
    billing?.limits.projects ??
    PLAN_LIMITS[activeTenant?.plan ?? 'FREE'].projects;

  return (
    <motion.div
      variants={stagger.container}
      initial="initial"
      animate="animate"
      className="max-w-4xl space-y-10"
    >
      {/* Header */}
      <motion.div variants={stagger.item} className="space-y-1">
        <div className="h-1 w-8 bg-amber-400 mb-4" />
        <h1 className="text-3xl font-black tracking-tight text-zinc-950">
          Good to see you,{' '}
          <span className="text-amber-500">{user?.firstName}.</span>
        </h1>
        <p className="text-sm text-zinc-500">
          {activeTenant?.name} · {activeTenant?.plan} plan
        </p>
      </motion.div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="border-2 border-zinc-100 p-6 h-36 animate-pulse bg-zinc-50"
            />
          ))}
        </div>
      ) : (
        <motion.div
          variants={stagger.container}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <motion.div variants={stagger.item}>
            <StatCard
              label="Current plan"
              value={activeTenant?.plan ?? 'FREE'}
              sub="Upgrade anytime in billing"
              accent
            />
          </motion.div>
          <motion.div variants={stagger.item}>
            <StatCard
              label="Members"
              value={`${memberCount} / ${memberLimit}`}
              sub={`${memberLimit - memberCount} seats remaining`}
            />
          </motion.div>
          <motion.div variants={stagger.item}>
            <StatCard
              label="Projects"
              value={`0 / ${projectLimit}`}
              sub={`${projectLimit} projects allowed`}
            />
          </motion.div>
        </motion.div>
      )}

      {/* Usage bars */}
      {!loading && (
        <motion.div variants={stagger.item} className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Usage
          </h2>

          <UsageBar label="Members" used={memberCount} limit={memberLimit} />
          <UsageBar label="Projects" used={0} limit={projectLimit} />
        </motion.div>
      )}

      {/* Members preview */}
      {!loading && tenant && tenant.users.length > 0 && (
        <motion.div variants={stagger.item} className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Team
          </h2>
          <div className="border-2 border-zinc-100 divide-y divide-zinc-100">
            {tenant.users.map((m) => (
              <div
                key={m.user.id}
                className="flex items-center justify-between px-5 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-full bg-zinc-950 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                    {m.user.firstName[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-800">
                      {m.user.firstName}
                    </p>
                    <p className="text-xs text-zinc-400">{m.user.email}</p>
                  </div>
                </div>
                <RoleBadge role={m.role} />
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── Usage bar ────────────────────────────────────────────────────────────────

function UsageBar({
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
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-zinc-600">{label}</span>
        <span className="text-xs text-zinc-400">
          {used} / {limit}
        </span>
      </div>
      <div className="h-1.5 w-full bg-zinc-100 overflow-hidden">
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

// ─── Role badge ───────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    OWNER: 'bg-zinc-950 text-white',
    ADMIN: 'bg-amber-100 text-amber-700',
    MEMBER: 'bg-zinc-100 text-zinc-600',
    VIEWER: 'bg-zinc-50 text-zinc-400',
  };

  return (
    <span
      className={`text-[10px] font-bold tracking-widest uppercase px-2 py-1 ${
        styles[role] ?? styles.MEMBER
      }`}
    >
      {role}
    </span>
  );
}
