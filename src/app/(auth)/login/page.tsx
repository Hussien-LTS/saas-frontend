// app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth.store';
import { Alert, AlertDescription } from '@/components/ui/alert';

const stagger = {
  container: {
    animate: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
  },
  item: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  },
};

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(form);
      router.push('/workspaces');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Invalid credentials. Please try again.';
      setError(message);
    }
  };

  return (
    <motion.div
      variants={stagger.container}
      initial="initial"
      animate="animate"
      className="space-y-7"
    >
      {/* Header */}
      <motion.div variants={stagger.item} className="space-y-1">
        <div className="h-1 w-10 bg-amber-400 mb-4" />
        <h1 className="text-3xl font-black tracking-tight text-zinc-950">
          Welcome back
        </h1>
        <p className="text-sm text-zinc-500">
          No account yet?{' '}
          <Link
            href="/register"
            className="text-zinc-950 font-medium underline underline-offset-4 hover:text-amber-500 transition-colors"
          >
            Create one
          </Link>
        </p>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Form */}
      <motion.form
        variants={stagger.container}
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <motion.div variants={stagger.item}>
          <Field
            id="email"
            label="Email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            autoFocus
          />
        </motion.div>

        <motion.div variants={stagger.item}>
          <Field
            id="password"
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
          />
        </motion.div>

        <motion.div variants={stagger.item}>
          <SubmitButton loading={isLoading} label="Sign in" />
        </motion.div>
      </motion.form>
    </motion.div>
  );
}

// ─── Shared field component ───────────────────────────────────────────────────

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

// ─── Submit button ────────────────────────────────────────────────────────────

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <motion.button
      type="submit"
      disabled={loading}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className="group relative w-full overflow-hidden bg-zinc-950 text-white text-sm font-semibold py-3 tracking-wide transition-colors disabled:opacity-50"
    >
      <span className="absolute inset-0 bg-amber-400 translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-300 ease-out" />
      <span className="relative group-hover:text-zinc-950 transition-colors duration-300">
        {loading ? 'Please wait…' : label}
      </span>
    </motion.button>
  );
}
