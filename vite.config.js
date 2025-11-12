import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(),tailwindcss(),],
  server: {
    proxy: {
      "/admin": {
        target: "http://192.168.1.18:9090",
        changeOrigin: true,
        secure: false,
        // rewrite: (path) => path.replace(/^\/api/, "/admin/"), // maps /api/categories -> /admin/categories
      },
    },
  },
});
