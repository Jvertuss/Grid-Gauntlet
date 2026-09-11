# Gridiron Gauntlet Browser App

This source tree is configured as an installable browser app (PWA) without changing the game's pages, design, scoring, perks, roster rules, or gameplay.

## What was added

- Web App Manifest for installability
- 192px and 512px app icons plus Apple touch icon
- Production-only service worker registration
- Fast repeat-load caching for same-origin game assets
- Bounded caching for NFL/ESPN player and team images
- Offline fallback for assets that have already been loaded
- Mobile browser metadata
- CSP support for the manifest and service worker

No PWA framework or extra npm dependency was added.

## Run in a desktop browser

```bash
npm install
npm run dev:browser
```

Open the URL Vite prints in the terminal.

## Test on another device on the same Wi-Fi

Run:

```bash
npm run dev:browser
```

Then open the Network URL shown by Vite on the other device.

Service workers and app installation are production features, so use the production build for final install testing.

## Create the production browser build

```bash
npm install
npm run build:browser
```

The deployable website is created in `dist/`.

Test it with:

```bash
npm run preview:browser
```

## Deploy

Upload the contents of `dist/` to a static HTTPS host such as GitHub Pages, Cloudflare Pages, Netlify, or Vercel.

HTTPS is required for normal service-worker/PWA behavior on public websites. Localhost is treated as a secure development context by browsers.

## Install from the browser

On supported desktop/mobile browsers, visit the deployed HTTPS site and use the browser's Install / Add to Home Screen action.

The game still works as a normal website if the user never installs it.

## Updating the app

When changing service-worker caching behavior, increment the version in `public/sw.js`, for example:

```js
const APP_CACHE = "gridiron-gauntlet-app-v2";
```

The activation step removes older Gridiron Gauntlet caches.

## Mobile UX

The browser app includes a dedicated mobile/touch pass in `src/styles/mobile.css`. It keeps the same pages and gameplay while adding safe-area handling, comfortable touch targets, a compact two-column draft, swipeable roster trays during rounds, readable legal/help text, and narrow-phone fallbacks. See `MOBILE_UX.md` for the checklist.
