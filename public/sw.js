/*
 * Gridiron Gauntlet browser-app service worker.
 *
 * Goals:
 * - keep repeat visits fast
 * - allow already-loaded game assets to work offline
 * - avoid changing game state, gameplay, or page behavior
 * - keep third-party image caching bounded
 */

const CACHE_PREFIX = "gridiron-gauntlet";
const APP_CACHE = `${CACHE_PREFIX}-app-v1`;
const IMAGE_CACHE = `${CACHE_PREFIX}-images-v1`;
const MAX_IMAGE_ENTRIES = 160;

const CORE_ASSETS = [
    "./",
    "./manifest.webmanifest",
    "./favicon.svg",
    "./icons/icon-192.png",
    "./icons/icon-512.png",
    "./icons/icon-maskable-512.png",
    "./icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches
            .open(APP_CACHE)
            .then((cache) => cache.addAll(CORE_ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter(
                            (key) =>
                                key.startsWith(`${CACHE_PREFIX}-`) &&
                                key !== APP_CACHE &&
                                key !== IMAGE_CACHE
                        )
                        .map((key) => caches.delete(key))
                )
            )
            .then(() => self.clients.claim())
    );
});

async function trimCache(cacheName, maxEntries) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();

    if (keys.length <= maxEntries) {
        return;
    }

    const deleteCount = keys.length - maxEntries;

    await Promise.all(
        keys
            .slice(0, deleteCount)
            .map((request) => cache.delete(request))
    );
}

async function networkFirst(request) {
    const cache = await caches.open(APP_CACHE);

    try {
        const response = await fetch(request);

        if (response && response.ok) {
            await cache.put(request, response.clone());
        }

        return response;
    }
    catch {
        return (
            (await cache.match(request)) ||
            (await cache.match("./")) ||
            Response.error()
        );
    }
}

async function staleWhileRevalidate(request) {
    const cache = await caches.open(APP_CACHE);
    const cached = await cache.match(request);

    const networkPromise = fetch(request)
        .then(async (response) => {
            if (response && response.ok) {
                await cache.put(request, response.clone());
            }

            return response;
        })
        .catch(() => null);

    return cached || (await networkPromise) || Response.error();
}

async function cacheFirstImage(request) {
    const cache = await caches.open(IMAGE_CACHE);
    const cached = await cache.match(request);

    if (cached) {
        return cached;
    }

    try {
        const response = await fetch(request);

        if (response && (response.ok || response.type === "opaque")) {
            await cache.put(request, response.clone());
            await trimCache(IMAGE_CACHE, MAX_IMAGE_ENTRIES);
        }

        return response;
    }
    catch {
        return Response.error();
    }
}

self.addEventListener("fetch", (event) => {
    const { request } = event;

    if (request.method !== "GET") {
        return;
    }

    const url = new URL(request.url);
    const sameOrigin = url.origin === self.location.origin;

    if (request.mode === "navigate") {
        event.respondWith(networkFirst(request));
        return;
    }

    if (sameOrigin) {
        event.respondWith(staleWhileRevalidate(request));
        return;
    }

    const cacheableImageHost =
        url.hostname === "a.espncdn.com" ||
        url.hostname === "static.www.nfl.com";

    if (request.destination === "image" && cacheableImageHost) {
        event.respondWith(cacheFirstImage(request));
    }
});
