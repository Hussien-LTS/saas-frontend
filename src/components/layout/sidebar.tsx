// components/layout/sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth.store';
import { useTenantStore } from '@/store/tenant.store';

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    label: 'Members',
    href: '/members',
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
  {
    label: 'Billing',
    href: '/billing',
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
        />
      </svg>
    ),
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
];

const PLAN_COLORS: Record<string, string> = {
  FREE: 'bg-zinc-100 text-zinc-500',
  PRO: 'bg-amber-100 text-amber-700',
  ENTERPRISE: 'bg-zinc-950 text-white',
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { activeTenant, clearTenant } = useTenantStore();

  const handleLogout = async () => {
    await logout();
    clearTenant();
    router.replace('/login');
  };

  const handleSwitchWorkspace = () => {
    clearTenant();
    router.push('/workspaces');
  };

  return (
    <aside className="w-56 shrink-0 flex flex-col bg-white border-r border-zinc-100 min-h-screen">
      {/* Logo */}
      <div className="h-14 flex items-center gap-2 px-5 border-b border-zinc-100 shrink-0">
        <div className="h-5 w-5 rounded-sm bg-zinc-950" />
        <span className="text-sm font-semibold tracking-tight text-zinc-950">
          SaaS Starter
        </span>
      </div>

      {/* Workspace badge */}
      {activeTenant && (
        <button
          onClick={handleSwitchWorkspace}
          className="group mx-3 mt-3 flex items-center justify-between border border-zinc-100 hover:border-amber-300 p-3 transition-colors duration-150"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-6 w-6 bg-zinc-950 flex items-center justify-center text-white text-[10px] font-black shrink-0">
              {activeTenant.name[0].toUpperCase()}
            </div>
            <span className="text-xs font-semibold text-zinc-800 truncate">
              {activeTenant.name}
            </span>
          </div>
          <span
            className={`text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 shrink-0 ${
              PLAN_COLORS[activeTenant.plan]
            }`}
          >
            {activeTenant.plan}
          </span>
        </button>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                  active
                    ? 'bg-zinc-950 text-white'
                    : 'text-zinc-500 hover:text-zinc-950 hover:bg-zinc-50'
                }`}
              >
                <span className={active ? 'text-amber-400' : 'text-zinc-400'}>
                  {item.icon}
                </span>
                {item.label}
                {active && (
                  <motion.div
                    layoutId="active-pill"
                    className="ml-auto h-1 w-1 rounded-full bg-amber-400"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom — user + logout */}
      <div className="px-3 pb-4 space-y-0.5 border-t border-zinc-100 pt-3">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="h-6 w-6 rounded-full bg-zinc-950 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
            {user?.firstName[0]}
            {user?.lastName[0]}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-zinc-800 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[10px] text-zinc-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors duration-150"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  );
}
