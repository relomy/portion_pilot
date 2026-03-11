import { configDefaults, defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    passWithNoTests: true,
    exclude: [
      ...configDefaults.exclude,
      '.worktrees/**',
      'worktrees/**',
      '**/.worktrees/**',
      '**/worktrees/**',
    ],
  },
})
