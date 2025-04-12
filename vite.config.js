import { defineConfig } from 'vite';

export default defineConfig({
  root: 'html', // Set the project root to the 'html' directory
  build: {
    outDir: '../dist', // Output directory relative to the root (i.e., project_root/dist)
    emptyOutDir: true, // Clear the output directory before building
    rollupOptions: {
        input: {
             main: 'html/index.html' // Specify the entry point HTML
        }
    }
  },
  server: {
    open: '/index.html' // Automatically open index.html when running dev server
  }
}); 