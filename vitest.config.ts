import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['**/*.test.ts'],
    // Enable in-source testing for .ts files in the src directory
    includeSource: ['src/**/*.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
  // Define import.meta.vitest as undefined for production builds
  define: {
    'import.meta.vitest': 'undefined',
  },
});
