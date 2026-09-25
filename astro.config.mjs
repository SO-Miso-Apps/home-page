import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import { cacheCloudflare } from "@astrojs/cloudflare/cache";
import emdash from "emdash/astro";
import { d1, r2, kvCache } from "@emdash-cms/cloudflare";

export default defineConfig({
  site: "https://misoapps.com",
  output: "server",
  adapter: cloudflare({ platformProxy: { enabled: true } }),
  cache: { provider: cacheCloudflare() },
  routeRules: {
    "/": { maxAge: 300, swr: 86400 },
    "/services": { maxAge: 300, swr: 86400 },
    "/apps/*": { maxAge: 300, swr: 86400 },
    "/blog": { maxAge: 300, swr: 86400 },
    "/blog/*": { maxAge: 300, swr: 86400 },
    "/sitemap.xml": { maxAge: 3600 },
    "/rss.xml": { maxAge: 3600 },
  },
  integrations: [
    react(),
    emdash({
      database: d1({ binding: "DB" }),
      storage: r2({ binding: "MEDIA" }),
      objectCache: kvCache({ binding: "CACHE" }),
    }),
  ],
});
