// app/(app)/billing/cancel/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function BillingCancelPage() {
  const router = useRouter();

  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center space-y-5"
      >
        <div className="h-16 w-16 border-2 border-zinc-200 flex items-center justify-center mx-auto">
          <svg
            className="h-8 w-8 text-zinc-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-zinc-950">
            Payment cancelled
          </h1>
          <p className="text-sm text-zinc-500">
            No charges were made. You can upgrade anytime.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.replace('/billing')}
          className="group relative overflow-hidden bg-zinc-950 text-white text-sm font-semibold px-8 py-3 tracking-wide"
        >
          <span className="absolute inset-0 bg-amber-400 translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-300 ease-out" />
          <span className="relative group-hover:text-zinc-950 transition-colors duration-300">
            Back to billing
          </span>
        </motion.button>
      </motion.div>
    </div>
  );
}
