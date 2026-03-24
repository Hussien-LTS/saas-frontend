// app/(auth)/layout.tsx
'use client';

import type { Metadata } from 'next';
import { motion } from 'framer-motion';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-[1fr_1fr] bg-white">
      {/* ── Left panel ────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex relative overflow-hidden bg-zinc-950 flex-col justify-between p-12">
        {/* Diagonal slash */}
        <div
          aria-hidden
          className="absolute -right-24 top-0 h-full w-64 bg-amber-400 skew-x-[-8deg] opacity-90"
        />

        {/* Grid texture */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg,#fff 0px,#fff 1px,transparent 1px,transparent 48px),repeating-linear-gradient(90deg,#fff 0px,#fff 1px,transparent 1px,transparent 48px)',
          }}
        />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 flex items-center gap-3"
        >
          <div className="h-7 w-7 rounded-sm bg-amber-400" />
          <span className="text-white text-sm font-semibold tracking-widest uppercase">
            SaaS Starter
          </span>
        </motion.div>

        {/* Big rotated label */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          aria-hidden
          className="absolute left-10 top-1/2 -translate-y-1/2 -rotate-90 origin-left z-10 select-none"
        >
          <span className="text-[7rem] font-black tracking-tighter text-white opacity-[0.06] leading-none">
            SAAS
          </span>
        </motion.div>

        {/* Bottom copy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="relative z-10 space-y-3"
        >
          <p className="text-2xl font-bold leading-snug tracking-tight text-white max-w-xs">
            The scaffolding that gets{' '}
            <span className="text-amber-400">out of your way.</span>
          </p>
          <p className="text-sm text-zinc-500">
            Multi-tenant · JWT auth · Stripe billing
          </p>
        </motion.div>

        {/* Corner accent box */}
        <div
          aria-hidden
          className="absolute bottom-0 left-0 h-32 w-32 border-l-4 border-b-4 border-amber-400 opacity-40"
        />
      </div>

      {/* ── Right panel ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-center p-8 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="w-full max-w-sm"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
