import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss({
      darkMode: 'class', // Enable dark mode with class strategy
    }),
    react()
  ],
  server: {
    port: 3000
  }
})

