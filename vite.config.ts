import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The o9 tokens package lives outside this app's root (../o9-design-system),
// so allow Vite's dev server to serve files from the parent directory.
export default defineConfig({
  plugins: [react()],
  // Relative asset paths so the build works from any static host or subpath.
  base: "./",
  server: {
    fs: { allow: [".."] },
  },
});
