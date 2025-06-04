import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  base: "/NearNest",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize build output
    target: "esnext",
    minify: "esbuild",
    sourcemap: mode === "development",
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
          ui: [
            "@radix-ui/react-avatar",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
          ],
          supabase: ["@supabase/supabase-js"],
          utils: ["clsx", "tailwind-merge", "date-fns"],
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    // Pre-bundle dependencies for faster dev server startup
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@supabase/supabase-js",
      "lucide-react",
      "clsx",
      "tailwind-merge",
    ],
  },
  // Enable CSS code splitting
  css: {
    devSourcemap: mode === "development",
  },
}));
