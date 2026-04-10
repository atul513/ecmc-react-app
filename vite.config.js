import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import dynamicImport from 'vite-plugin-dynamic-import'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        dynamicImport(),
        VitePWA({
            registerType: 'prompt',
            injectRegister: 'auto',
            includeAssets: ['favicon.ico', 'icons/*.svg'],
            manifest: {
                name: 'ECMC - Online Exam & Practice',
                short_name: 'ECMC',
                description:
                    'Smart platform for online exams, quizzes and practice sets for students and educators.',
                theme_color: '#2a85ff',
                background_color: '#ffffff',
                display: 'standalone',
                scope: '/',
                start_url: '/',
                orientation: 'portrait-primary',
                icons: [
                    {
                        src: 'icons/icon.svg',
                        sizes: '192x192',
                        type: 'image/svg+xml',
                        purpose: 'any',
                    },
                    {
                        src: 'icons/icon.svg',
                        sizes: '512x512',
                        type: 'image/svg+xml',
                        purpose: 'any',
                    },
                    {
                        src: 'icons/icon-maskable.svg',
                        sizes: '512x512',
                        type: 'image/svg+xml',
                        purpose: 'maskable',
                    },
                ],
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
                navigateFallback: '/index.html',
                navigateFallbackDenylist: [/^\/api/],
                runtimeCaching: [
                    {
                        urlPattern: /\/api\/.*/i,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'api-cache',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 60 * 60 * 24,
                            },
                            cacheableResponse: { statuses: [0, 200] },
                        },
                    },
                ],
            },
            devOptions: {
                enabled: true,
                type: 'module',
            },
        }),
    ],
    assetsInclude: ['**/*.md'],
    resolve: {
        alias: {
            '@': path.join(__dirname, 'src'),
        },
    },
    server: {
        host: true,
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
                secure: false,
            },
        },
    },
    build: {
        outDir: 'build',
    },
})
