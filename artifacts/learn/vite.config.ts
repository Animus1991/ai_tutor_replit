import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { type PluginOption, defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const rawPort = process.env.PORT ?? "20579";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH ?? "/";

const isReplit = process.env.REPL_ID !== undefined;
const isDev = process.env.NODE_ENV !== "production";

async function loadReplitPlugins(): Promise<PluginOption[]> {
  if (!isReplit || !isDev) return [];
  try {
    const [{ cartographer }, { devBanner }, runtimeErrorOverlay] =
      await Promise.all([
        import("@replit/vite-plugin-cartographer"),
        import("@replit/vite-plugin-dev-banner"),
        import("@replit/vite-plugin-runtime-error-modal").then(
          (m) => m.default,
        ),
      ]);
    return [
      cartographer({ root: path.resolve(import.meta.dirname, "..") }),
      devBanner(),
      runtimeErrorOverlay(),
    ];
  } catch {
    return [];
  }
}

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss({ optimize: false }),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "logo.svg", "manifest.webmanifest"],
      manifest: false,
      workbox: {
        navigateFallback: "/index.html",
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,webmanifest}"],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/api/dashboard"),
            handler: "NetworkFirst",
            options: {
              cacheName: "synapse-api-cache",
              networkTimeoutSeconds: 8,
              expiration: { maxEntries: 32, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === "document",
            handler: "NetworkFirst",
            options: { cacheName: "synapse-pages" },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
    ...(await loadReplitPlugins()),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(
        import.meta.dirname,
        "..",
        "..",
        "attached_assets",
      ),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            if (
              id.includes("AdvancedEducationalVisuals") ||
              id.includes("DiagramGenerator")
            ) {
              return "visuals";
            }
            if (id.includes("StudyWorkspace")) return "page-workspace";
            if (id.includes("pages/Analytics")) return "page-analytics";
            if (
              id.includes("pages/LessonPlayer") ||
              id.includes("PracticalLessonStep")
            ) {
              return "page-lesson";
            }
            if (id.includes("pages/Landing")) return "page-landing";
            return undefined;
          }
          if (id.includes("@clerk")) return "vendor-clerk";
          if (id.includes("framer-motion")) return "vendor-motion";
          if (id.includes("@tanstack")) return "vendor-query";
          if (
            id.includes("react-markdown") ||
            id.includes("/remark") ||
            id.includes("/rehype")
          ) {
            return "vendor-markdown";
          }
          if (id.includes("react-dom") || id.includes("/react/"))
            return "vendor-react";
          return "vendor";
        },
      },
    },
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    proxy: {
      "/api": "http://localhost:8080",
    },
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
