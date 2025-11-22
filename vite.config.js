// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // pehle se tha: admin APIs
      "/admin": {
        target: "https://invoice-t3c6.onrender.com/api",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
