// src/vite-env.d.ts


/// <reference types="vite/client" />
/// <reference types="vitest/globals" />



declare module "*.mp4" {
  const src: string;
  export default src;
}
