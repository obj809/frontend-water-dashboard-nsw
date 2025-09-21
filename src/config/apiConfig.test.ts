import { vi, expect, test, afterEach } from 'vitest';

const realProcess = globalThis.process;

afterEach(() => {
  // restore real process after each test
  // @ts-ignore
  globalThis.process = realProcess;
  // Clear module cache so re-import picks up env changes
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
  // Ensure window var not present
  // @ts-ignore
  delete (globalThis as any).window;
  const { API_BASE_URL } = await import('./apiConfig');
  expect(API_BASE_URL).toBe('/api');
});
