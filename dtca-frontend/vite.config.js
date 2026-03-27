import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // <-- Ajoute cette ligne

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // <-- Ajoute cette ligne
  ],
})