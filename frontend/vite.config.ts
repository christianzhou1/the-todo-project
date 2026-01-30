/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: "./postcss.config.cjs",
  },
  build: {
    // Generate unique filenames for cache busting
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`,
      },
    },
  },
  // @ts-expect-error - Vitest config property, types from vite and vitest conflict
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: true,
    // Exclude E2E tests (they're run by Playwright, not Vitest)
    exclude: ["**/node_modules/**", "**/dist/**", "**/e2e/**", "**/*.e2e.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    // Optimize dependencies to reduce file handles
    deps: {
      inline: ["@mui/icons-material"],
    },
  },
});
