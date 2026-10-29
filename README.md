# Omaha MUFON Admin

Administrative dashboard for the Omaha, Nebraska MUFON chapter, covering sighting review, investigator management, operational metrics, and audit activity.

- Admin portal: https://admin.mufonomaha.space
- Public site: https://mufonomaha.space
- Repository: https://github.com/Mattjhagen/MufonOmahaAdmin

## Features

- **Sighting Queue:** report intake, drafts, moderation, classification, witness details, and case notes.
- **Operational dashboard:** investigation statistics, time to disposition, caseload, and charts.
- **User Management:** roster and role-management interface.
- **Codex Prompt Studio:** configurable implementation prompts and simulation tools.
- **Omaha Radar Map:** geographic sighting visualization and canvas heatmap.
- **Public Site Sync:** preview of sanitized public records and export data.
- **Audit Logs:** browser-local administrative activity history.
- **PWA:** installable app icons and opt-in Web Push notifications.
- **Responsive layout:** independently scrolling navigation, mobile cards, and internal table/code scrolling.

## Technology

React 19, TypeScript, Vite, Tailwind CSS 4, Recharts, Express, and Playwright. Optional Gemini integration supports sighting analysis; local heuristics are available without an API key.

## Local development

Requires Node.js 22 and npm.

```sh
npm ci
cp .env.example .env
npm run dev
```

Open http://127.0.0.1:3000. Set `GEMINI_API_KEY` in `.env` only if you want Gemini API calls. The server defaults to loopback; `HOST` and `PORT` override the listening address and port.

Cloudflare Access identity is unavailable in direct local development. The session endpoint returns 401 without the Access identity header; browser layout tests mock that endpoint.

## Production build

```sh
npm ci
npm run build
NODE_ENV=production HOST=127.0.0.1 PORT=3015 npm start
```

The Express server serves the built frontend from `dist/`. `npm run preview` previews only the frontend and does not provide the Express API.

## Validation

```sh
npm run lint
npm test
npx playwright install chromium
npm run test:responsive
```

To use an existing Chrome installation instead of downloading Chromium:

```sh
CHROME_PATH=/usr/bin/google-chrome npm run test:responsive
```

The responsive suite checks all six main sections with empty and populated records at **320, 360, 375, 390, 412, 768, 1024, and 1440px**. It asserts `document.documentElement.scrollWidth <= window.innerWidth`, reports uncontained overflow, and checks navigation, internal scrolling, and report intake. A Pixel-sized touch test covers active service-worker reloads and resizing. See [responsive test notes](tests/responsive/README.md).

Latest local validation: production build, TypeScript check, three data/render tests, and 17 responsive browser tests passed. Physical Android installed-PWA behavior still needs device verification.

## Data and integration status

Reports, roster entries, and audit logs currently persist in **browser localStorage**. They are specific to the browser/profile and are not a shared server database. Clearing browser data removes these records. Known seeded demo IDs are removed when stored data loads; manually created records are retained.

Public-site synchronization, shared user provisioning, and password reset delivery still require backend integration. The current UI must not be treated as a complete identity or shared case-management backend. No demo reports, users, announcements, or analytics points are seeded.

## PWA and notifications

Install using the browser menu, or **Share → Add to Home Screen** on iPhone/iPad. On iOS, open the installed app before enabling notifications.

Use **Enable notifications** to subscribe and request a test alert. **Disable notifications** removes the device subscription. Creating a non-draft report in this app triggers a generic notification without witness details. Public-site intake is not connected to these alerts.

The service worker handles push notifications and notification clicks. It does not cache private pages or frontend assets; the app requires an internet connection. Vite builds use hashed asset filenames.

Push keys and subscriptions are generated under `.data/`, which is excluded from Git. Back up that directory securely to preserve subscriptions when moving hosts. Notification delivery requires device permission and a supported browser.

## Hosting

The files in [deploy/](deploy/) describe the current systemd user services and Cloudflare Tunnel configuration. They contain host-specific paths; adapt those paths and supply your own tunnel credentials before using them elsewhere. Credentials belong outside the repository.

The intended deployment keeps the origin on loopback behind a Cloudflare Access-protected tunnel. Session and notification endpoints use the identity header supplied by that trusted proxy. Do not expose the origin directly as though those headers independently authenticate requests.

For an already configured host, build the updated source and restart the app:

```sh
npm ci
npm run build
systemctl --user restart mufon-omaha-admin
systemctl --user status mufon-omaha-admin mufon-omaha-admin-tunnel
journalctl --user -u mufon-omaha-admin -u mufon-omaha-admin-tunnel
```

## Project structure

```text
src/components/       Dashboard sections, dialogs, charts, and PWA controls
src/data/             Browser storage helpers
src/types/            Shared application types
src/index.css         Tailwind and responsive layout rules
server.ts             Express server and analysis endpoints
notifications.ts      Web Push routes and private runtime storage
public/               App icons, manifest, and service worker
deploy/               Host service and tunnel configuration
tests/                Data/render and responsive regression tests
```

Keep `.env`, `.data/`, tunnel credentials, dependencies, and build/test output out of source control.
