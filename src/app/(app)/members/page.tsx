// app/(app)/members/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTenantStore } from '@/store/tenant.store';
import { api } from '@/lib/api';
import type { TenantDetail, TenantMember, TenantRole } from '@/types/api';
import InviteModal from './invite-modal';
import RemoveMemberButton from './remove-member-button';

const stagger = {
  container: {
    animate: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
  },
  item: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  },
};

const ROLE_STYLES: Record<TenantRole, string> = {
  OWNER: 'bg-zinc-950 text-white',
  ADMIN: 'bg-amber-100 text-amber-700',
  MEMBER: 'bg-zinc-100 text-zinc-600',
  VIEWER: 'bg-zinc-50 text-zinc-400',
};

const CAN_MANAGE: TenantRole[] = ['OWNER', 'ADMIN'];

export default function MembersPage() {
  const { activeTenant } = useTenantStore();
  const [tenant, setTenant] = useState<TenantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);

  const canManage = CAN_MANAGE.includes(activeTenant?.role as TenantRole);

  const fetchTenant = useCallback(async () => {
    if (!activeTenant) return;
    try {
      const { data } = await api.get<TenantDetail>(
        `/tenants/${activeTenant.id}`,
      );
      setTenant(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeTenant]);

  useEffect(() => {
    fetchTenant();
  }, [fetchTenant]);

  return (
    <>
      <motion.div
        variants={stagger.container}
        initial="initial"
        animate="animate"
        className="max-w-3xl space-y-8"
      >
        {/* Header */}
        <motion.div
          variants={stagger.item}
          className="flex items-end justify-between"
        >
          <div className="space-y-1">
            <div className="h-1 w-8 bg-amber-400 mb-4" />
            <h1 className="text-3xl font-black tracking-tight text-zinc-950">
              Members
            </h1>
            <p className="text-sm text-zinc-500">
              {tenant?.users.length ?? '—'} member
              {tenant?.users.length !== 1 ? 's' : ''} in{' '}
              <span className="font-medium text-zinc-700">
                {activeTenant?.name}
              </span>
            </p>
          </div>

          {canManage && (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setInviteOpen(true)}
              className="group relative overflow-hidden bg-zinc-950 text-white text-xs font-semibold px-5 py-2.5 tracking-wide"
            >
              <span className="absolute inset-0 bg-amber-400 translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-300 ease-out" />
              <span className="relative group-hover:text-zinc-950 transition-colors duration-300 flex items-center gap-2">
                <svg
                  className="h-3.5 w-3.5"
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
                Invite member
              </span>
            </motion.button>
          )}
        </motion.div>

        {/* Table */}
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-16 border-2 border-zinc-100 animate-pulse bg-zinc-50"
              />
            ))}
          </div>
        ) : (
          <motion.div
            variants={stagger.container}
            className="border-2 border-zinc-100 divide-y divide-zinc-100"
          >
            {/* Column headers */}
            <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-2.5 bg-zinc-50">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                Member
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                Role
              </span>
              {canManage && (
                <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                  Actions
                </span>
              )}
            </div>

            {tenant?.users.map((member) => (
              <MemberRow
                key={member.user.id}
                member={member}
                tenantId={activeTenant!.id}
                canManage={canManage}
                onRemoved={fetchTenant}
              />
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Invite modal */}
      <InviteModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvited={() => {
          setInviteOpen(false);
          fetchTenant();
        }}
        tenantId={activeTenant?.id ?? ''}
      />
    </>
  );
}

// ─── Member row ───────────────────────────────────────────────────────────────

function MemberRow({
  member,
  tenantId,
  canManage,
  onRemoved,
}: {
  member: TenantMember;
  tenantId: string;
  canManage: boolean;
  onRemoved: () => void;
}) {
  return (
    <motion.div
      variants={{
        initial: { opacity: 0, x: -8 },
        animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
      }}
      className="grid grid-cols-[1fr_auto_auto] gap-4 items-center px-5 py-4"
    >
      {/* User info */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-8 w-8 rounded-full bg-zinc-950 flex items-center justify-center text-white text-xs font-bold shrink-0">
          {member.user.firstName[0].toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-zinc-900 truncate">
            {member.user.firstName}
          </p>
          <p className="text-xs text-zinc-400 truncate">{member.user.email}</p>
        </div>
      </div>

      {/* Role badge */}
      <span
        className={`text-[10px] font-bold tracking-widest uppercase px-2 py-1 ${
          ROLE_STYLES[member.role]
        }`}
      >
        {member.role}
      </span>

      {/* Actions */}
      {canManage && (
        <div className="flex items-center justify-end">
          {member.role !== 'OWNER' ? (
            <RemoveMemberButton
              tenantId={tenantId}
              memberId={member.user.id}
              memberName={member.user.firstName}
              onRemoved={onRemoved}
            />
          ) : (
            <span className="text-xs text-zinc-200 px-2">—</span>
          )}
        </div>
      )}
    </motion.div>
  );
}
