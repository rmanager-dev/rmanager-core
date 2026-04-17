import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: ["src/tests/setup-vitest.ts"],
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
