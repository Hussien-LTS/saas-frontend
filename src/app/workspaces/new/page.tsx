// app/workspaces/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import type { Tenant } from '@/types/api';
import { useAuthStore } from '@/store/auth.store';
import { useTenantStore } from '@/store/tenant.store';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function NewWorkspacePage() {
  const router = useRouter();
  const { fetchMe } = useAuthStore();
  const { setActiveTenant } = useTenantStore();

  const [form, setForm] = useState({ name: '', slug: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    setForm({ name, slug });
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, slug: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.post<Tenant>('/tenants', form);
      // Refresh user so new tenant appears in store
      await fetchMe();
      setActiveTenant({ ...data, role: 'OWNER' });
      router.push('/dashboard');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Something went wrong.';
      setError(message);
    } finally {
      setLoading(false);
    }
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
          onClick={() => router.back()}
          className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
        >
          ← Back
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm space-y-7"
        >
          <div className="space-y-1">
            <div className="h-1 w-8 bg-amber-400 mb-4" />
            <h1 className="text-3xl font-black tracking-tight text-zinc-950">
              New workspace
            </h1>
            <p className="text-sm text-zinc-500">
              You&apos;ll be the owner. Invite your team after.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <Field
              id="name"
              label="Workspace name"
              placeholder="Acme Inc"
              value={form.name}
              onChange={handleNameChange}
              autoFocus
            />

            {/* Slug */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                Slug
              </label>
              <div className="flex items-end gap-0 border-b-2 border-zinc-200 focus-within:border-amber-400 transition-colors">
                <span className="text-xs text-zinc-300 pb-2 pr-1 shrink-0">
                  saas.app/
                </span>
                <input
                  id="slug"
                  value={form.slug}
                  onChange={handleSlugChange}
                  placeholder="acme-inc"
                  required
                  className="flex-1 bg-transparent pb-2 pt-1 text-sm text-zinc-950 placeholder:text-zinc-300 outline-none"
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="group relative w-full overflow-hidden bg-zinc-950 text-white text-sm font-semibold py-3 tracking-wide disabled:opacity-50"
            >
              <span className="absolute inset-0 bg-amber-400 translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-300 ease-out" />
              <span className="relative group-hover:text-zinc-950 transition-colors duration-300">
                {loading ? 'Creating…' : 'Create workspace'}
              </span>
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({
  id,
  label,
  ...props
}: {
  id: string;
  label: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className={`text-xs font-semibold uppercase tracking-widest transition-colors duration-200 ${
          focused ? 'text-amber-500' : 'text-zinc-400'
        }`}
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          {...props}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
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
