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
        target: "http://localhost:9090/api",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
