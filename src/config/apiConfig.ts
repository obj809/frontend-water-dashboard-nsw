// src/config/apiConfig.ts

const resolveBase = () => {
  // Vite exposes env vars via import.meta.env
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) {
    return String(import.meta.env.VITE_API_BASE_URL).replace(/\/+$/, '');
  }
  // Fallback for SSR/Node or window override
  if (typeof window !== 'undefined' && (window as any).__API_BASE_URL__) {
    return String((window as any).__API_BASE_URL__).replace(/\/+$/, '');
  }
  // Default to /api (works with Vite proxy in dev)
  return '/api';
};

export const API_BASE_URL = resolveBase();
  