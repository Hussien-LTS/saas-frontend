// app/invites/[token]/accept/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useTenantStore } from '@/store/tenant.store';

type PageState =
  | 'loading'
  | 'unauthenticated'
  | 'ready'
  | 'accepting'
  | 'success'
  | 'error';

export default function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { setActiveTenant } = useTenantStore();

  const [state, setState] = useState<PageState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);

  useEffect(() => {
    // Give auth store a tick to rehydrate from localStorage
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        setState('unauthenticated');
      } else {
        setState('ready');
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  const handleAccept = async () => {
    setState('accepting');
    setError(null);
    try {
      const { data } = await api.post<{ message: string; tenantId: string }>(
        `/tenants/invites/${token}/accept`,
      );
      setTenantId(data.tenantId);
      setState('success');

      // Refresh user so the new tenant appears, then enter it
      const { fetchMe } = useAuthStore.getState();
      await fetchMe();

      const updatedUser = useAuthStore.getState().user;
      const membership = updatedUser?.tenants.find(
        (m) => m.tenant.id === data.tenantId,
      );

      if (membership) {
        setActiveTenant({ ...membership.tenant, role: membership.role });
      }

      setTimeout(() => router.push('/dashboard'), 1800);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'This invite is invalid or has expired.';
      setError(message);
      setState('error');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top bar */}
      <header className="h-14 border-b border-zinc-100 flex items-center px-8">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-sm bg-zinc-950" />
          <span className="text-sm font-semibold tracking-tight text-zinc-950">
            SaaS Starter
          </span>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm space-y-6"
        >
          {/* ── Loading ─────────────────────────────────────────────────── */}
          {state === 'loading' && (
            <div className="space-y-4">
              <div className="h-1 w-8 bg-amber-400" />
              <div className="h-8 w-48 bg-zinc-100 animate-pulse" />
              <div className="h-4 w-64 bg-zinc-50 animate-pulse" />
            </div>
          )}

          {/* ── Unauthenticated ──────────────────────────────────────────── */}
          {state === 'unauthenticated' && (
            <div className="space-y-6">
              <div>
                <div className="h-1 w-8 bg-amber-400 mb-4" />
                <h1 className="text-3xl font-black tracking-tight text-zinc-950">
                  You&apos;re invited
                </h1>
                <p className="text-sm text-zinc-500 mt-1">
                  Sign in or create an account to accept this invite.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    router.push(`/login?redirect=/invites/${token}/accept`)
                  }
                  className="group relative w-full overflow-hidden bg-zinc-950 text-white text-sm font-semibold py-3 tracking-wide"
                >
                  <span className="absolute inset-0 bg-amber-400 translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-300 ease-out" />
                  <span className="relative group-hover:text-zinc-950 transition-colors duration-300">
                    Sign in
                  </span>
                </motion.button>
                <button
                  onClick={() =>
                    router.push(`/register?redirect=/invites/${token}/accept`)
                  }
                  className="w-full border-2 border-zinc-100 hover:border-amber-400 text-sm font-semibold py-3 text-zinc-600 hover:text-zinc-950 transition-colors"
                >
                  Create account
                </button>
              </div>
            </div>
          )}

          {/* ── Ready to accept ──────────────────────────────────────────── */}
          {state === 'ready' && (
            <div className="space-y-6">
              <div>
                <div className="h-1 w-8 bg-amber-400 mb-4" />
                <h1 className="text-3xl font-black tracking-tight text-zinc-950">
                  Accept invite
                </h1>
                <p className="text-sm text-zinc-500 mt-1">
                  Accepting as{' '}
                  <span className="font-medium text-zinc-800">
                    {user?.email}
                  </span>
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAccept}
                className="group relative w-full overflow-hidden bg-zinc-950 text-white text-sm font-semibold py-3 tracking-wide"
              >
                <span className="absolute inset-0 bg-amber-400 translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-300 ease-out" />
                <span className="relative group-hover:text-zinc-950 transition-colors duration-300">
                  Accept &amp; join workspace
                </span>
              </motion.button>
            </div>
          )}

          {/* ── Accepting ────────────────────────────────────────────────── */}
          {state === 'accepting' && (
            <div className="space-y-4">
              <div className="h-1 w-8 bg-amber-400" />
              <h1 className="text-3xl font-black tracking-tight text-zinc-950">
                Joining…
              </h1>
              <div className="h-1 w-full bg-zinc-100 overflow-hidden">
                <motion.div
                  className="h-full bg-amber-400"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.5, ease: 'easeInOut' }}
                />
              </div>
            </div>
          )}

          {/* ── Success ──────────────────────────────────────────────────── */}
          {state === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className="h-12 w-12 bg-amber-400 flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-zinc-950"
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
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-zinc-950">
                  You&apos;re in!
                </h1>
                <p className="text-sm text-zinc-500 mt-1">
                  Redirecting you to the workspace…
                </p>
              </div>
            </motion.div>
          )}

          {/* ── Error ────────────────────────────────────────────────────── */}
          {state === 'error' && (
            <div className="space-y-6">
              <div>
                <div className="h-1 w-8 bg-red-400 mb-4" />
                <h1 className="text-3xl font-black tracking-tight text-zinc-950">
                  Something went wrong
                </h1>
                <p className="text-sm text-red-500 mt-1 font-medium">{error}</p>
              </div>
              <button
                onClick={() => router.push('/workspaces')}
                className="w-full border-2 border-zinc-100 hover:border-amber-400 text-sm font-semibold py-3 text-zinc-600 hover:text-zinc-950 transition-colors"
              >
                Go to workspaces
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
