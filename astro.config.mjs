// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import vercel from '@astrojs/vercel';
// import { remarkContentTransforms } from './src/lib/markdown-transforms.js';

// https://astro.build/config
export default defineConfig({
  site: 'https://gtmejet.com',
  output: 'static',
  adapter: vercel({
    maxDuration: 300
  }),

  integrations: [
    sitemap({
      filter: (page) => !page.includes('/draft'),
      changefreq: 'weekly',
      priority: 0.7
    }),
    mdx()
  ],

  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: {
      theme: 'github-dark'
    },
    remarkPlugins: [
      // remarkContentTransforms
    ],
    // Allow raw HTML in markdown files
    remarkRehype: {
      allowDangerousHtml: true
    },
    rehypePlugins: []
  }
});
