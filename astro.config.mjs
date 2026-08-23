// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  output: "server",
  site: 'https://ohiostateans.com',
  adapter: vercel({}),

  integrations: [
    tailwind(),
    sitemap(),
    react(),
  ],

  markdown: {
    shikiConfig: {
      theme: 'github-light',
      wrap: true
    }
  },

  vite: {
    build: {
      // Every page currently ships its own near-duplicate Tailwind bundle
      // (full preflight repeated in each), because Vite's default per-chunk
      // CSS splitting doesn't help a server-rendered site where each page is
      // its own request anyway. One shared, deduplicated stylesheet cuts
      // both the byte count and the render-blocking request count.
      cssCodeSplit: false,
    },
  },
});