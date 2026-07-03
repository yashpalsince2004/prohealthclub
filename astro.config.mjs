import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  base: "/prohealthclub/",
  integrations: [react(), tailwind()],
  server: {
    port: 8080,
  },
  vite: {
    resolve: {
      alias: {
        "@": "/src",
      },
    },
  },
});
