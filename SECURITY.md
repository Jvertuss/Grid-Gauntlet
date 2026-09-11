# Security

## Current posture

Gridiron Gauntlet is a client-side React application. No API keys, passwords, authentication tokens, or other secrets should be committed to the frontend source because anything bundled into browser JavaScript can be inspected by users.

The current project includes:

- A restrictive Content Security Policy in `index.html` for the current script, style, image, and data hosts.
- A no-referrer policy for outbound requests.
- `noopener noreferrer` on external profile links.
- Browser-local Hall of Fame storage bounded to the most recent 25 runs.
- No built-in account system, payment system, advertising tracker, or analytics tracker.

## Before deployment

1. Replace the legal placeholders in `src/data/legalContent.js`.
2. Run `npm install` or `npm ci` on the deployment machine.
3. Run `npm run lint`.
4. Run `npm run build`.
5. Review dependency updates and vulnerability reports from your package manager / hosting platform.
6. Configure equivalent or stronger security headers at the hosting layer when the host supports them.
7. Never put secrets in `src/`, `public/`, `index.html`, or Vite variables exposed to the client.

## Reporting a security issue

Contact: [ADD SECURITY CONTACT EMAIL BEFORE PUBLIC LAUNCH]
