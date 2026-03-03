/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import {
  CacheFirst,
  NetworkFirst,
  NetworkOnly,
  Serwist,
  StaleWhileRevalidate,
} from 'serwist';

import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // TMDb ポスター画像: CacheFirst (30日, 最大200件)
    {
      matcher: ({ url }) => url.hostname === 'image.tmdb.org',
      handler: new CacheFirst({
        cacheName: 'tmdb-images',
        maxAgeSeconds: 30 * 24 * 60 * 60,
        maxEntries: 200,
      }),
    },
    // TMDb Route Handler: StaleWhileRevalidate (5分)
    {
      matcher: ({ url }) =>
        url.origin === self.location.origin &&
        url.pathname.startsWith('/api/tmdb'),
      handler: new StaleWhileRevalidate({
        cacheName: 'tmdb-api',
        maxAgeSeconds: 5 * 60,
        maxEntries: 50,
      }),
    },
    // Supabase API: NetworkOnly
    {
      matcher: ({ url }) => url.hostname.includes('supabase'),
      handler: new NetworkOnly(),
    },
    // 認証系ページ (login, signup): NetworkFirst
    {
      matcher: ({ request, url }) =>
        request.destination === 'document' &&
        url.origin === self.location.origin &&
        (url.pathname.startsWith('/login') ||
          url.pathname.startsWith('/signup') ||
          url.pathname.startsWith('/forgot-password')),
      handler: new NetworkFirst({
        cacheName: 'auth-pages',
        maxAgeSeconds: 24 * 60 * 60,
      }),
    },
    // メインページの HTML/RSC: NetworkOnly (認証ユーザーデータ含有)
    {
      matcher: ({ request, url }) =>
        request.destination === 'document' &&
        url.origin === self.location.origin,
      handler: new NetworkOnly(),
    },
    // 静的アセット (JS/CSS/fonts): CacheFirst
    {
      matcher: ({ request }) =>
        request.destination === 'script' ||
        request.destination === 'style' ||
        request.destination === 'font',
      handler: new CacheFirst({
        cacheName: 'static-assets',
        maxAgeSeconds: 30 * 24 * 60 * 60,
        maxEntries: 100,
      }),
    },
  ],
  fallbacks: {
    entries: [
      {
        url: '/~offline',
        matcher({ request }) {
          return request.destination === 'document';
        },
      },
    ],
  },
});

serwist.addEventListeners();
