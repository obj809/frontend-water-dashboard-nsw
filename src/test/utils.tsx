// src/test/utils.tsx
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';

export * from '@testing-library/react';

// Simple passthrough for now; expand with Providers when needed.
export const renderUI = (ui: React.ReactElement, options?: RenderOptions) =>
  render(ui, { ...options });
