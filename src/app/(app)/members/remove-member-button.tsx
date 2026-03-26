// components/members/remove-member-button.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';

interface Props {
  tenantId: string;
  memberId: string;
  memberName: string;
  onRemoved: () => void;
}

export default function RemoveMemberButton({
  tenantId,
  memberId,
  memberName,
  onRemoved,
}: Props) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRemove = async () => {
    setLoading(true);
    try {
      await api.delete(`/tenants/${tenantId}/members/${memberId}`);
      onRemoved();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  };

  return (
    <div className="relative flex items-center justify-end">
      <AnimatePresence mode="wait">
        {!confirming ? (
          // ── Trash icon button ──────────────────────────────────────────────
          <motion.button
            key="trash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setConfirming(true)}
            className="h-7 w-7 flex items-center justify-center text-zinc-300 hover:text-red-500 hover:bg-red-50 transition-colors duration-150"
            title={`Remove ${memberName}`}
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </motion.button>
        ) : (
          // ── Confirm row ────────────────────────────────────────────────────
          <motion.div
            key="confirm"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1"
          >
            <span className="text-[10px] text-zinc-400 mr-1 whitespace-nowrap">
              Remove {memberName}?
            </span>

            {/* Cancel */}
            <button
              onClick={() => setConfirming(false)}
              disabled={loading}
              className="h-6 px-2 text-[10px] font-semibold text-zinc-500 hover:text-zinc-800 border border-zinc-200 hover:border-zinc-300 transition-colors"
            >
              No
            </button>

            {/* Confirm */}
            <motion.button
              onClick={handleRemove}
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              className="h-6 px-2 text-[10px] font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {loading ? '…' : 'Yes'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
