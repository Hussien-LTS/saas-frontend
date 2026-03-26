// components/members/invite-modal.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import type { TenantRole } from '@/types/api';

interface Props {
  open: boolean;
  onClose: () => void;
  onInvited: () => void;
  tenantId: string;
}

const ROLES: TenantRole[] = ['MEMBER', 'ADMIN', 'VIEWER'];

const ROLE_DESC: Record<string, string> = {
  VIEWER: 'Can view — no edits',
  MEMBER: 'Can view and interact',
  ADMIN: 'Full access except billing',
};

export default function InviteModal({
  open,
  onClose,
  onInvited,
  tenantId,
}: Props) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<TenantRole>('MEMBER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const reset = () => {
    setEmail('');
    setRole('MEMBER');
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post(`/tenants/${tenantId}/invite`, { email, role });
      setSuccess(true);
      setTimeout(() => {
        onInvited();
        reset();
      }, 1500);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Failed to send invite.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/40 z-40"
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100">
              <div>
                <div className="h-1 w-6 bg-amber-400 mb-2" />
                <h2 className="text-lg font-black tracking-tight text-zinc-950">
                  Invite member
                </h2>
              </div>
              <button
                onClick={handleClose}
                className="h-8 w-8 flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 px-6 py-6 overflow-y-auto">
              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center h-full gap-4 text-center"
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
                    <p className="font-bold text-zinc-950">Invite sent!</p>
                    <p className="text-sm text-zinc-400 mt-1">
                      {email} will receive an email shortly.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email */}
                  <EmailField value={email} onChange={(v) => setEmail(v)} />

                  {/* Role picker */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                      Role
                    </label>
                    <div className="space-y-2">
                      {ROLES.map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRole(r)}
                          className={`w-full flex items-center justify-between border-2 px-4 py-3 transition-colors duration-150 text-left ${
                            role === r
                              ? 'border-amber-400 bg-amber-50'
                              : 'border-zinc-100 hover:border-zinc-200'
                          }`}
                        >
                          <div>
                            <p
                              className={`text-sm font-semibold ${
                                role === r ? 'text-zinc-950' : 'text-zinc-700'
                              }`}
                            >
                              {r}
                            </p>
                            <p className="text-xs text-zinc-400 mt-0.5">
                              {ROLE_DESC[r]}
                            </p>
                          </div>
                          {role === r && (
                            <motion.div
                              layoutId="role-check"
                              className="h-4 w-4 bg-amber-400 flex items-center justify-center shrink-0"
                            >
                              <svg
                                className="h-2.5 w-2.5 text-zinc-950"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={3}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </motion.div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-500 font-medium"
                    >
                      {error}
                    </motion.p>
                  )}

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    disabled={loading || !email}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative w-full overflow-hidden bg-zinc-950 text-white text-sm font-semibold py-3 tracking-wide disabled:opacity-50"
                  >
                    <span className="absolute inset-0 bg-amber-400 translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-300 ease-out" />
                    <span className="relative group-hover:text-zinc-950 transition-colors duration-300">
                      {loading ? 'Sending…' : 'Send invite'}
                    </span>
                  </motion.button>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Email field ──────────────────────────────────────────────────────────────

function EmailField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="space-y-1.5">
      <label
        className={`text-xs font-semibold uppercase tracking-widest transition-colors duration-200 ${
          focused ? 'text-amber-500' : 'text-zinc-400'
        }`}
      >
        Email address
      </label>
      <div className="relative">
        <input
          type="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="teammate@example.com"
          required
          autoFocus
          className="w-full bg-transparent border-0 border-b-2 border-zinc-200 pb-2 pt-1 text-sm text-zinc-950 placeholder:text-zinc-300 outline-none transition-colors duration-200 focus:border-amber-400"
        />
        <motion.div
          className="absolute bottom-0 left-0 h-[2px] bg-amber-400"
          initial={{ width: '0%' }}
          animate={{ width: focused ? '100%' : '0%' }}
          transition={{ duration: 0.25 }}
        />
      </div>
    </div>
  );
}
