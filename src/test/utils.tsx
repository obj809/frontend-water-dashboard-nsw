// src/test/utils.tsx
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';

export * from '@testing-library/react';

export const renderUI = (ui: React.ReactElement, options?: RenderOptions) =>
  render(ui, { ...options });
