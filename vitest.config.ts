// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,                // Enable global functions like `describe`, `it`, etc.
    environment: 'jsdom',          // Needed for testing React components
    setupFiles: './vitest.setup.ts', // Path to setup file for custom configuration
    include: ['src/**/*.test.{ts,tsx}'], // Looks for test files with .test.ts and .test.tsx extensions
  },
});