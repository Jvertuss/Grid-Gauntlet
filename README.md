# Gridiron Gauntlet

Gridiron Gauntlet is a historical fantasy-football strategy game built with React and Vite.

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

The Vite configuration uses relative production asset paths so the `dist` folder can be deployed to common static hosts and subdirectory-based hosts such as GitHub Pages.

## Legal and privacy pages

The main menu includes built-in pages for:

- Privacy Policy
- Terms of Service
- Sports & Liability Disclaimer
- Open-Source Licenses

The policies should be reviewed again any time accounts, analytics, advertising, payments, cloud saves, user-generated content, or other data-collection features are added.

## Current privacy behavior

The current game stores Hall of Fame run history in browser `localStorage` and bounds that history to 25 runs. The repository also contains optional historical-stat caching code. Player headshots and team logos can load from third-party sports image hosts.

The HTML includes a restrictive referrer policy and a Content Security Policy covering the current asset and data hosts. External profile links use `noopener noreferrer` and a no-referrer policy.

## Third-party software

Direct dependencies include React and React DOM. Development tooling includes Vite, `@vitejs/plugin-react`, and Oxlint. See:

- `THIRD_PARTY_NOTICES.md`
- `public/third-party-licenses.txt`

for the detected dependency list and available license notices.

## Security notes

- Do not place API keys, passwords, tokens, or other secrets in client-side source files.
- Keep dependencies updated and run `npm run lint` and `npm run build` before deployment.
- If the hosting platform supports security headers, prefer configuring CSP, Referrer-Policy, Permissions-Policy, and clickjacking protections as HTTP response headers in addition to the HTML policy.

## Browser app / PWA build

This edition can also run as an installable browser app without changing the game's UI or gameplay.

```bash
npm run dev:browser
npm run build:browser
npm run preview:browser
```

See `BROWSER_APP.md` for deployment and installation details.
