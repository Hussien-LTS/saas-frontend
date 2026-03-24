// lib/api.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3030/api/v1';

// ─── Token helpers (localStorage) ────────────────────────────────────────────

export const tokenStorage = {
  getAccess: () => localStorage.getItem('accessToken'),
  getRefresh: () => localStorage.getItem('refreshToken'),
  getUserId: () => localStorage.getItem('userId'),

  set: (accessToken: string, refreshToken: string, userId: string) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('userId', userId);

    // Mirror access token to a cookie so middleware can read it
    document.cookie = `accessToken=${accessToken}; path=/; max-age=900; SameSite=Lax`;
  },

  clear: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    // Clear the cookie too
    document.cookie = 'accessToken=; path=/; max-age=0';
  },
};

// ─── Axios instance ───────────────────────────────────────────────────────────

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor — attach access token + tenant id ───────────────────

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.getAccess();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor — silent token refresh on 401 ──────────────────────

let isRefreshing = false;
let queue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  queue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  queue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only attempt refresh on 401 and only once per request
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    const refreshToken = tokenStorage.getRefresh();
    const userId = tokenStorage.getUserId();

    // No tokens stored — go to login
    if (!refreshToken || !userId) {
      tokenStorage.clear();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // If a refresh is already in flight, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({
          resolve: (token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          },
          reject,
        });
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
        userId,
        refreshToken,
      });

      const { accessToken, refreshToken: newRefresh } = data;
      tokenStorage.set(accessToken, newRefresh, userId);

      api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      original.headers.Authorization = `Bearer ${accessToken}`;

      processQueue(null, accessToken);
      return api(original);
    } catch (refreshError) {
      processQueue(refreshError, null);
      tokenStorage.clear();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

// ─── Tenant header helper ─────────────────────────────────────────────────────

export const setTenantHeader = (tenantId: string) => {
  api.defaults.headers.common['x-tenant-id'] = tenantId;
};

export const clearTenantHeader = () => {
  delete api.defaults.headers.common['x-tenant-id'];
};
