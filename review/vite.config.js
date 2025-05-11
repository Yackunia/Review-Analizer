import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
	port: process.env.FRONTEND_PORT,  // Фронтенд на стандартном порту Vite
	proxy: {
	  '/api': {
		target: process.env.BACKEND_URL,  // Совпадает с ApiAddress
		changeOrigin: true,
		rewrite: (path) => path.replace(/^\/api/, '')  // Убираем /api при проксировании
	  }
	}
  }
})
