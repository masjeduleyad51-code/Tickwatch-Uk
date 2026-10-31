import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(rootDir, "src") } },
  server: {
    // Optional dev-only proxy. Use it if the browser blocks direct calls with a
    // CORS error: set VITE_API_BASE_URL=/elanco in .env.local and restart `npm run dev`.
    proxy: {
      "/elanco": {
        target: "https://dev-task.elancoapps.com",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/elanco/, "/data"),
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    css: false,
  },
});
