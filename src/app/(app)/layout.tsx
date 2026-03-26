// // app/(app)/layout.tsx
// 'use client';

// import { useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { useAuthStore } from '@/store/auth.store';
// import { useTenantStore } from '@/store/tenant.store';
// import Sidebar from '@/components/layout/sidebar';

// export default function AppLayout({ children }: { children: React.ReactNode }) {
//   const router = useRouter();
//   const { user, isAuthenticated } = useAuthStore();
//   const { activeTenant } = useTenantStore();

//   useEffect(() => {
//     if (!isAuthenticated) {
//       router.replace('/login');
//       return;
//     }
//     if (!activeTenant) {
//       router.replace('/workspaces');
//     }
//   }, [isAuthenticated, activeTenant, router]);

//   if (!user || !activeTenant) return null;

//   return (
//     <div className="min-h-screen flex bg-zinc-50">
//       <Sidebar />
//       <main className="flex-1 flex flex-col min-w-0">
//         <header className="h-14 border-b border-zinc-200 bg-white flex items-center px-6 gap-4 shrink-0">
//           <div className="flex-1" />
//           <div className="flex items-center gap-2">
//             <div className="h-7 w-7 rounded-full bg-zinc-950 flex items-center justify-center text-white text-xs font-bold">
//               {user.firstName[0]}
//               {user.lastName[0]}
//             </div>
//             <span className="text-sm font-medium text-zinc-700">
//               {user.firstName} {user.lastName}
//             </span>
//           </div>
//         </header>
//         <div className="flex-1 p-6 overflow-auto">{children}</div>
//       </main>
//     </div>
//   );
// }
// app/(app)/layout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useTenantStore } from '@/store/tenant.store';
import Sidebar from '@/components/layout/sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, _hasHydrated: authHydrated } = useAuthStore();
  const { activeTenant, _hasHydrated: tenantHydrated } = useTenantStore();

  const hydrated = authHydrated && tenantHydrated;

  useEffect(() => {
    if (!hydrated) return;

    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (!activeTenant) {
      router.replace('/workspaces');
    }
  }, [hydrated, isAuthenticated, activeTenant, router]);

  // Show nothing until both stores have rehydrated
  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-1 w-16 bg-zinc-100 overflow-hidden">
            <div className="h-full w-8 bg-amber-400 animate-[slide_1s_ease-in-out_infinite]" />
          </div>
          <p className="text-xs text-zinc-300 tracking-widest uppercase">
            Loading…
          </p>
        </div>
      </div>
    );
  }

  if (!user || !activeTenant) return null;

  return (
    <div className="min-h-screen flex bg-zinc-50">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
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
        <div className="flex-1 p-6 overflow-auto">{children}</div>
      </main>
    </div>
  );
}
