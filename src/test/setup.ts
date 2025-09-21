// src/test/setup.ts
import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import React from 'react';

afterEach(() => cleanup());

// ---- ResizeObserver polyfill ----
if (typeof (globalThis as any).ResizeObserver === 'undefined') {
  class ResizeObserver {
    // If TS complains about ResizeObserverCallback, you can type as `any`
    // or ensure "lib": ["dom", "es2022"] is in tsconfig.json.
    callback: ResizeObserverCallback;
    constructor(cb: ResizeObserverCallback) { this.callback = cb; }
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  (globalThis as any).ResizeObserver = ResizeObserver as any;
}

// ---- matchMedia stub ----
if (typeof (window as any).matchMedia === 'undefined') {
  (window as any).matchMedia = () => ({
    matches: false,
    media: '',
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

// ---- Mock ResponsiveContainer: inject width/height into child ----
vi.mock('recharts', async () => {
  const actual = await vi.importActual<any>('recharts');
  const ResponsiveContainer = ({ width, height, children }: any) => {
    const w = typeof width === 'number' ? width : 200;
    const h = typeof height === 'number' ? height : 200;

    // Find the first valid React element child
    const childArray = React.Children.toArray(children) as React.ReactElement[];
    const firstChart = childArray.find(
      (c) => React.isValidElement(c)
    ) as React.ReactElement | undefined;

    if (!firstChart) {
      // Fallback: just render a sized box
      return React.createElement('div', { style: { width: w, height: h } }, children);
    }

    // Clone the chart and inject width/height like real ResponsiveContainer does
    const cloned = React.cloneElement(firstChart, { width: w, height: h });

    // Return the cloned chart inside a sized wrapper (optional, but mirrors structure)
    return React.createElement('div', { style: { width: w, height: h } }, cloned);
  };
  return { ...actual, ResponsiveContainer };
});