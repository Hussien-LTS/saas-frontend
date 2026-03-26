// // store/tenant.store.ts
// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';
// import { setTenantHeader, clearTenantHeader } from '@/lib/api';
// import type { TenantWithRole } from '@/types/api';

// interface TenantState {
//   activeTenant: TenantWithRole | null;
//   setActiveTenant: (tenant: TenantWithRole) => void;
//   clearTenant: () => void;
// }

// export const useTenantStore = create<TenantState>()(
//   persist(
//     (set) => ({
//       activeTenant: null,

//       setActiveTenant: (tenant) => {
//         setTenantHeader(tenant.id);
//         set({ activeTenant: tenant });
//       },

//       clearTenant: () => {
//         clearTenantHeader();
//         set({ activeTenant: null });
//       },
//     }),
//     {
//       name: 'tenant-store',
//       skipHydration: true,
//       onRehydrateStorage: () => (state) => {
//         if (state?.activeTenant) {
//           setTenantHeader(state.activeTenant.id);
//         }
//       },
//     },
//   ),
// );
// store/tenant.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { setTenantHeader, clearTenantHeader } from '@/lib/api';
import type { TenantWithRole } from '@/types/api';

interface TenantState {
  activeTenant: TenantWithRole | null;
  _hasHydrated: boolean;

  setHasHydrated: (v: boolean) => void;
  setActiveTenant: (tenant: TenantWithRole) => void;
  clearTenant: () => void;
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      activeTenant: null,
      _hasHydrated: false,

      setHasHydrated: (v) => set({ _hasHydrated: v }),

      setActiveTenant: (tenant) => {
        setTenantHeader(tenant.id);
        set({ activeTenant: tenant });
      },

      clearTenant: () => {
        clearTenantHeader();
        set({ activeTenant: null });
      },
    }),
    {
      name: 'tenant-store',
      onRehydrateStorage: () => (state) => {
        if (state?.activeTenant) {
          setTenantHeader(state.activeTenant.id);
        }
        state?.setHasHydrated(true);
      },
    },
  ),
);
