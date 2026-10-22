import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import fs from 'fs';

function bloggerApiPlugin(): Plugin {
  return {
    name: 'blogger-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.startsWith('/api/posts')) {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');

          try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 4000);
            
            const response = await fetch(
              'https://aipeup3dkl.blogspot.com/feeds/posts/default?alt=json&max-results=50',
              { signal: controller.signal }
            );
            clearTimeout(timeout);

            if (response.ok) {
              const data = await response.json();
              const entries = data.feed?.entry || [];
              const posts = entries.map((entry: any) => {
                const idStr = entry.id?.$t || '';
                const postId = idStr.includes('post-') ? idStr.split('post-')[1] : idStr.replace(/[^a-zA-Z0-9]/g, '');
                const title = (entry.title?.$t || '').trim();
                const published = entry.published?.$t || '';
                const updated = entry.updated?.$t || '';
                const categories = (entry.category || []).map((c: any) => c.term).filter(Boolean);
                
                let htmlLink = '';
                for (const l of entry.link || []) {
                  if (l.rel === 'alternate') htmlLink = l.href;
                }
                
                const author = entry.author?.[0]?.name?.$t || 'AIPEU Dhenkanal';
                const rawContent = entry.content?.$t || entry.summary?.$t || '';
                
                // Extract images
                const imgMatches = [...rawContent.matchAll(/<img[^>]+src=["']([^'"]+)["']/gi)];
                const images = imgMatches.map(m => m[1]);

                // Extract drive links
                const driveMatches = [...rawContent.matchAll(/href=["'](https:\/\/drive\.google\.com\/[^'"]+)["']/gi)];
                const driveLinks = driveMatches.map(m => m[1]);

                // Clean snippet
                const cleanText = rawContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
                const snippet = cleanText.slice(0, 240) + (cleanText.length > 240 ? '...' : '');

                // Ensure at least one category tag
                if (categories.length === 0) {
                  const lowerTitle = title.toLowerCase();
                  if (lowerTitle.includes('gds') || lowerTitle.includes('aigdsu') || title.includes('ଗ୍ରାମୀଣ')) {
                    categories.push('GDS / ED AGENDA');
                  } else if (lowerTitle.includes('postman') || lowerTitle.includes('mts') || lowerTitle.includes('group - d')) {
                    categories.push('POSTMAN & GROUP - D');
                  } else if (lowerTitle.includes('bonus') || lowerTitle.includes('da') || lowerTitle.includes('cpc') || lowerTitle.includes('meeting')) {
                    categories.push('GROUP - C AGENDA');
                  } else if (lowerTitle.includes('adalat') || lowerTitle.includes('circular') || lowerTitle.includes('letter')) {
                    categories.push('CIRCULARS & ORDERS');
                  } else {
                    categories.push('UNION NEWS');
                  }
                }

                return {
                  id: postId,
                  title,
                  published,
                  updated,
                  author,
                  url: htmlLink,
                  categories,
                  snippet,
                  contentHtml: rawContent,
                  images,
                  driveLinks,
                };
              });

              res.end(JSON.stringify({ source: 'live', posts }));
              return;
            }
          } catch (err) {
            // Fall back to bundled data
          }

          try {
            const bundledPath = path.resolve(__dirname, 'src/data/posts.json');
            if (fs.existsSync(bundledPath)) {
              const fileData = fs.readFileSync(bundledPath, 'utf-8');
              res.end(JSON.stringify({ source: 'bundled', posts: JSON.parse(fileData) }));
              return;
            }
          } catch (readErr) {
            // ignore
          }

          res.end(JSON.stringify({ source: 'empty', posts: [] }));
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      bloggerApiPlugin(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon.svg'],
        manifest: {
          id: '/',
          name: 'AIPEU Dhenkanal Mobile',
          short_name: 'AIPEU DKL',
          description: 'All India Postal Employees Union Dhenkanal Division mobile app with offline reading, circulars, and notifications.',
          theme_color: '#022A61',
          background_color: '#022A61',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,json}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/blogger\.googleusercontent\.com\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'blogger-images-cache',
                expiration: {
                  maxEntries: 80,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      strictPort: true,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
