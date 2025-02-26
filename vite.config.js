import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    watch: {
      usePolling: true, // ✅ Forces Vite to watch file changes
    },
  },
});
