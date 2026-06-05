import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Backend Fastify. Port lu depuis backend/.env (3001 en dev local
      // pour éviter le conflit avec Remotion qui s'accroche aux ports 3000/3001).
      // Si tu changes PORT dans backend/.env, aligne ici ou via VITE_BACKEND_URL.
      '/api': process.env.VITE_BACKEND_URL || 'http://localhost:3001',
    },
  },
})
