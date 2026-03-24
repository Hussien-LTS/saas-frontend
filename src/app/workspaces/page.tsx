// app/workspaces/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth.store';
import { useTenantStore } from '@/store/tenant.store';
import type { TenantWithRole } from '@/types/api';

const PLAN_COLORS: Record<string, string> = {
  FREE: 'bg-zinc-100 text-zinc-600',
  PRO: 'bg-amber-100 text-amber-700',
  ENTERPRISE: 'bg-zinc-950 text-white',
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

export default function WorkspacesPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { setActiveTenant } = useTenantStore();

  const tenants: TenantWithRole[] =
    user?.tenants.map((m) => ({ ...m.tenant, role: m.role })) ?? [];

  const handleSelect = (tenant: TenantWithRole) => {
    setActiveTenant(tenant);
    router.push('/dashboard');
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top bar */}
      <header className="h-14 border-b border-zinc-100 flex items-center justify-between px-8">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-sm bg-zinc-950" />
          <span className="text-sm font-semibold tracking-tight text-zinc-950">
            SaaS Starter
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
        >
          Sign out
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <motion.div
          variants={stagger.container}
          initial="initial"
          animate="animate"
          className="w-full max-w-lg space-y-8"
        >
          {/* Heading */}
          <motion.div variants={stagger.item} className="space-y-1">
            <div className="h-1 w-8 bg-amber-400 mb-4" />
            <h1 className="text-3xl font-black tracking-tight text-zinc-950">
              Choose a workspace
            </h1>
            <p className="text-sm text-zinc-500">
              Welcome back,{' '}
              <span className="font-medium text-zinc-700">
                {user?.firstName}
              </span>
              . Select a workspace to continue.
            </p>
          </motion.div>

          {/* Tenant list */}
          <motion.div variants={stagger.container} className="space-y-3">
            {tenants.length === 0 ? (
              <motion.div
                variants={stagger.item}
                className="border-2 border-dashed border-zinc-200 rounded-none p-8 text-center"
              >
                <p className="text-sm text-zinc-400">
                  You don&apos;t belong to any workspace yet.
                </p>
              </motion.div>
            ) : (
              tenants.map((tenant) => (
                <motion.button
                  key={tenant.id}
                  variants={stagger.item}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleSelect(tenant)}
                  className="group w-full flex items-center justify-between border-2 border-zinc-100 hover:border-amber-400 bg-white p-5 transition-colors duration-200 text-left"
                >
                  {/* Left */}
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="h-10 w-10 bg-zinc-950 flex items-center justify-center text-white text-sm font-black shrink-0">
                      {tenant.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-950 tracking-tight">
                        {tenant.name}
                      </p>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {tenant.slug} ·{' '}
                        <span className="capitalize lowercase">
                          {tenant.role}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-bold tracking-widest uppercase px-2 py-1 ${
                        PLAN_COLORS[tenant.plan]
                      }`}
                    >
                      {tenant.plan}
                    </span>
                    <svg
                      className="h-4 w-4 text-zinc-300 group-hover:text-amber-400 transition-colors"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </motion.button>
              ))
            )}
          </motion.div>

          {/* Create new workspace */}
          <motion.div variants={stagger.item}>
            <button
              onClick={() => router.push('/workspaces/new')}
              className="group w-full flex items-center justify-center gap-2 border-2 border-dashed border-zinc-200 hover:border-amber-400 p-4 transition-colors duration-200"
            >
              <svg
                className="h-4 w-4 text-zinc-300 group-hover:text-amber-400 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="text-sm text-zinc-400 group-hover:text-amber-500 font-medium transition-colors">
                Create a new workspace
              </span>
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
