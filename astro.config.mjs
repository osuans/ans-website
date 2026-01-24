// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel'; 

// https://astro.build/config
export default defineConfig({
  output: "server",
  site: 'https://ohiostateans.com',
  adapter: vercel({}),

  integrations: [
    tailwind(),
    sitemap(),
  ],

  markdown: {
    shikiConfig: {
      theme: 'github-light',
      wrap: true
    }
  },
});