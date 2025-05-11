import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
	port: 5173,  // Фронтенд на стандартном порту Vite
	proxy: {
	  '/api': {
		target: 'http://localhost:5233',  // Совпадает с ApiAddress
		changeOrigin: true,
		rewrite: (path) => path.replace(/^\/api/, '')  // Убираем /api при проксировании
	  }
	}
  }
})
