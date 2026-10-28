import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { proxy: { "/api": "http://localhost:5000" } },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return "react-vendor";
          if (/node_modules\/(leaflet|react-leaflet)\//.test(id)) return "map-vendor";
          if (/node_modules\/(recharts|d3-[^/]+)\//.test(id)) return "chart-vendor";
          if (id.includes("node_modules/lucide-react/")) return "icon-vendor";
          if (id.includes("node_modules/react-router")) return "router-vendor";
        },
      },
    },
  },
  test: { environment: "jsdom", setupFiles: "./src/test/setup.js" },
});
