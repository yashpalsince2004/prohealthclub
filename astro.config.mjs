import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  base: "/prohealthclub/",
  output: "server",
  adapter: vercel({
    webAnalytics: { enabled: false },
    speedInsights: { enabled: false },
    imageService: false,
  }),
  integrations: [react(), tailwind()],
  server: {
    port: 8080,
    headers: {
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
  },
  vite: {
    resolve: {
      alias: {
        "@": "/src",
      },
    },
  },
});
