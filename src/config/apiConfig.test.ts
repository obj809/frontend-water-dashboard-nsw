import { vi, expect, test, afterEach } from 'vitest';

const realProcess = globalThis.process;

afterEach(() => {
  // @ts-ignore
  globalThis.process = realProcess;
  vi.resetModules();
});

test('resolveBase prefers VITE_API_BASE_URL and strips trailing slash', async () => {
  // @ts-ignore - set a minimal process.env
  globalThis.process = { env: { VITE_API_BASE_URL: 'https://x/' } };
  const { API_BASE_URL } = await import('./apiConfig');
  expect(API_BASE_URL).toBe('https://x');
});

test('fallback to /api when no env/window value', async () => {
  // @ts-ignore
  globalThis.process = { env: {} };
  // @ts-ignore
  delete (globalThis as any).window;
  const { API_BASE_URL } = await import('./apiConfig');
  expect(API_BASE_URL).toBe('/api');
});
