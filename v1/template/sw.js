// eslint-disable-next-line max-len
const wL = (location.href.substr(0, location.href.lastIndexOf('\/'))).replace(/\/?$/, '/');
const version = '0.8';
const cacheName = `restoranklijent-${version}`;
self.addEventListener('install', (e) => {
  e.waitUntil(
      caches.open(cacheName).then((cache) => {
        return cache.addAll([
          `${wL}`,
          `${wL}assets/android-chrome-128x128.png`,
          `${wL}assets/android-chrome-144x144.png`,
          `${wL}assets/android-chrome-192x192.png`,
          `${wL}assets/android-chrome-256x256.png`,
          `${wL}assets/android-chrome-36x36.png`,
          `${wL}assets/android-chrome-384x384.png`,
          `${wL}assets/android-chrome-48x48.png`,
          `${wL}assets/android-chrome-512x512.png`,
          `${wL}assets/android-chrome-72x72.png`,
          `${wL}assets/android-chrome-96x96.png`,
          `${wL}assets/apple-touch-icon-1024x1024.png`,
          `${wL}assets/apple-touch-icon-114x114.png`,
          `${wL}assets/apple-touch-icon-120x120.png`,
          `${wL}assets/apple-touch-icon-144x144.png`,
          `${wL}assets/apple-touch-icon-152x152.png`,
          `${wL}assets/apple-touch-icon-167x167.png`,
          `${wL}assets/apple-touch-icon-180x180.png`,
          `${wL}assets/apple-touch-icon-57x57.png`,
          `${wL}assets/apple-touch-icon-60x60.png`,
          `${wL}assets/apple-touch-icon-72x72.png`,
          `${wL}assets/apple-touch-icon-76x76.png`,
          `${wL}assets/apple-touch-icon-precomposed.png`,
          `${wL}assets/apple-touch-icon.png`,
          `${wL}assets/apple-touch-startup-image-1125x2436.png`,
          `${wL}assets/apple-touch-startup-image-1136x640.png`,
          `${wL}assets/apple-touch-startup-image-1242x2208.png`,
          `${wL}assets/apple-touch-startup-image-1242x2688.png`,
          `${wL}assets/apple-touch-startup-image-1334x750.png`,
          `${wL}assets/apple-touch-startup-image-1536x2048.png`,
          `${wL}assets/apple-touch-startup-image-1620x2160.png`,
          `${wL}assets/apple-touch-startup-image-1668x2224.png`,
          `${wL}assets/apple-touch-startup-image-1668x2388.png`,
          `${wL}assets/apple-touch-startup-image-1792x828.png`,
          `${wL}assets/apple-touch-startup-image-2048x1536.png`,
          `${wL}assets/apple-touch-startup-image-2048x2732.png`,
          `${wL}assets/apple-touch-startup-image-2160x1620.png`,
          `${wL}assets/apple-touch-startup-image-2208x1242.png`,
          `${wL}assets/apple-touch-startup-image-2224x1668.png`,
          `${wL}assets/apple-touch-startup-image-2388x1668.png`,
          `${wL}assets/apple-touch-startup-image-2436x1125.png`,
          `${wL}assets/apple-touch-startup-image-2688x1242.png`,
          `${wL}assets/apple-touch-startup-image-2732x2048.png`,
          `${wL}assets/apple-touch-startup-image-640x1136.png`,
          `${wL}assets/apple-touch-startup-image-750x1334.png`,
          `${wL}assets/apple-touch-startup-image-828x1792.png`,
          `${wL}assets/browserconfig.xml`,
          `${wL}assets/coast-228x228.png`,
          `${wL}assets/favicon-16x16.png`,
          `${wL}assets/favicon-32x32.png`,
          `${wL}assets/favicon-48x48.png`,
          `${wL}assets/favicon.ico`,
          `${wL}assets/firefox_app_128x128.png`,
          `${wL}assets/firefox_app_512x512.png`,
          `${wL}assets/firefox_app_60x60.png`,
          `${wL}assets/mstile-144x144.png`,
          `${wL}assets/mstile-150x150.png`,
          `${wL}assets/mstile-310x150.png`,
          `${wL}assets/mstile-310x310.png`,
          `${wL}assets/mstile-70x70.png`,
          `${wL}assets/yandex-browser-50x50.png`,
          `${wL}dist/img/footer_logo.png`,
          `${wL}dist/img/logo.png`,
          `${wL}dist/img/logo1.png`,
          `${wL}dist/img/srce-logo-bijeli-350x135.png`,
          `${wL}dist/img/srce-logo-bijeli-150x50.png`,
          `${wL}dist/img/Logo_potpis_adresa.gif`,
          `${wL}dist/img/placeholder260x260.png`,
          `${wL}dist/img/srce_novo1.png`,
          `${wL}dist/img/srce-logo-potpis-web.png`,
          `${wL}dist/img/vizual_issp.svg`,
          `${wL}vendor/dist/vendor.css`,
          `${wL}RestoranKlijent/dist/RestoranKlijent.css`,
          `${wL}runtime/dist/runtime.js`,
          `${wL}vendor/dist/vendor.js`,
          `${wL}RestoranKlijent/dist/RestoranKlijent.js`,
        ])
            .then(() => self.skipWaiting());
      }),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
      caches.open(cacheName)
          .then((cache) => cache.match(event.request, {ignoreSearch: true}))
          .then((response) => {
            return response || fetch(event.request);
          }),
  );
});
