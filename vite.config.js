// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import svgr from "vite-plugin-svgr";

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, "..");

export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    proxy: {
      "/cvapi": {
        target: "http://cvprojecthost1.ddns.net:5202",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/cvapi/, ""),
      },
      "/fileapi": {
        target: "http://cvprojecthost1.ddns.net:5016",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/fileapi/, ""),
      },
    },
  },
});
