// app/(app)/billing/success/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth.store';
import { useTenantStore } from '@/store/tenant.store';

export default function BillingSuccessPage() {
  const router = useRouter();
  const { fetchMe } = useAuthStore();
  const { activeTenant, setActiveTenant } = useTenantStore();

  useEffect(() => {
    const refresh = async () => {
      // Refresh user so updated plan is reflected
      await fetchMe();

      const updatedUser = useAuthStore.getState().user;
      const membership = updatedUser?.tenants.find(
        (m) => m.tenant.id === activeTenant?.id,
      );

      if (membership) {
        setActiveTenant({ ...membership.tenant, role: membership.role });
      }

      setTimeout(() => router.replace('/billing'), 2500);
    };

    refresh();
  }, []);

  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center space-y-5"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.1 }}
          className="h-16 w-16 bg-amber-400 flex items-center justify-center mx-auto"
        >
          <svg
            className="h-8 w-8 text-zinc-950"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </motion.div>

        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-zinc-950">
            You&apos;re upgraded!
          </h1>
          <p className="text-sm text-zinc-500">
            Your plan has been updated. Redirecting you back…
          </p>
        </div>

        <div className="h-1 w-48 bg-zinc-100 overflow-hidden mx-auto">
          <motion.div
            className="h-full bg-amber-400"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2.5, ease: 'linear' }}
          />
        </div>
      </motion.div>
    </div>
  );
}
