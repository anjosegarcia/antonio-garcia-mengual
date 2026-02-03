// @ts-check
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  vite: {
    resolve: {
      alias: {
        "@layouts": new URL("./src/layouts", import.meta.url).pathname,
        "@data": new URL("./src/data", import.meta.url).pathname,
        "@components": new URL("./src/components", import.meta.url).pathname,
      },
    },
  },
});
