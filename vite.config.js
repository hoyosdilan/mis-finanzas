import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // firebase/messaging y recharts NO van aquí: se cargan con import()
          // dinámico; listarlos en manualChunks haría que el entry los
          // referencie (modulepreload) y se descarguen en la carga inicial.
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'vendor-datefns': ['date-fns'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  },
  server: {
    host: true,
    allowedHosts: ['.loca.lt']
  }
})
