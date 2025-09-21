// src/test/setup.ts
import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import React from 'react';

afterEach(() => cleanup());

if (typeof (globalThis as any).ResizeObserver === 'undefined') {
  class ResizeObserver {
    callback: ResizeObserverCallback;
    constructor(cb: ResizeObserverCallback) { this.callback = cb; }
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  (globalThis as any).ResizeObserver = ResizeObserver as any;
}

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

vi.mock('recharts', async () => {
  const actual = await vi.importActual<any>('recharts');
  const ResponsiveContainer = ({ width, height, children }: any) => {
    const w = typeof width === 'number' ? width : 200;
    const h = typeof height === 'number' ? height : 200;

    const childArray = React.Children.toArray(children) as React.ReactElement[];
    const firstChart = childArray.find(
      (c) => React.isValidElement(c)
    ) as React.ReactElement | undefined;

    if (!firstChart) {
      return React.createElement('div', { style: { width: w, height: h } }, children);
    }

    const cloned = React.cloneElement(firstChart, { width: w, height: h });

    return React.createElement('div', { style: { width: w, height: h } }, cloned);
  };
  return { ...actual, ResponsiveContainer };
});