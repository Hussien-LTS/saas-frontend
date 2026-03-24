// app/(app)/layout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useTenantStore } from '@/store/tenant.store';
import Sidebar from '@/components/layout/sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { activeTenant } = useTenantStore();

  // Guard — no user → back to login
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  // No tenant selected yet → back to workspace picker
  useEffect(() => {
    if (isAuthenticated && !activeTenant) {
      router.replace('/workspaces');
    }
  }, [isAuthenticated, activeTenant, router]);

  if (!user || !activeTenant) return null;

  return (
    <div className="min-h-screen flex bg-zinc-50">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b border-zinc-200 bg-white flex items-center px-6 gap-4 shrink-0">
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-zinc-950 flex items-center justify-center text-white text-xs font-bold">
              {user.firstName[0]}
              {user.lastName[0]}
            </div>
            <span className="text-sm font-medium text-zinc-700">
              {user.firstName} {user.lastName}
            </span>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-6 overflow-auto">{children}</div>
      </main>
    </div>
  );
}
