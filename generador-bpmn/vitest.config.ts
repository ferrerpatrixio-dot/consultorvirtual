import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

// Config mínima: testeamos funciones puras de src/lib (ej. completitud.ts),
// no componentes UI, por eso environment "node" y sin jsdom/testing-library.
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
  },
});
