import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    port: 5173,

    ...(process.env.VITE_ENABLE_API_PROXY === "true"
      ? {
          proxy: {
            "/api": {
              target: process.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000",
              changeOrigin: true,
              secure: false,
            },
          },
        }
      : {}),
  },
});
