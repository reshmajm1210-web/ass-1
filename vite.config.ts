import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The dev/preview servers bind to 0.0.0.0 and accept any host so the app also
// works behind sandboxed preview proxies (https://<port>-<sandbox>.e2b.app).
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: true
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: true
  },
  build: {
    sourcemap: true
  }
})
