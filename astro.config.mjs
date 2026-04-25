// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  output: "static",
  build: {
    format: "file",
  },
  trailingSlash: "never",
  adapter: cloudflare({
    imageService: "compile",
  }),
  site: process.env.SITE_URL ?? "https://antoniogarciamengual.com",
  integrations: [sitemap()],
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
