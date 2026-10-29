Run `npx playwright install chromium` once, then `npm run test:responsive`.
To use an existing Chrome installation: `CHROME_PATH=/usr/bin/google-chrome npm run test:responsive`.

The suite checks all six admin sections with empty and populated local records at
320, 360, 375, 390, 412, 768, 1024, and 1440 CSS pixels. It asserts document
scrollWidth <= innerWidth and reports elements extending outside the viewport,
excluding content inside intentional scroll or decorative clipping boundaries.
It also checks internal scrolling, active navigation, and the new-report modal.
A touch-enabled Pixel-sized context verifies navigation after service-worker
activation/reload and tablet resizing. This does not substitute for a physical
Android installed-PWA check.

Baseline at 320px: document width 608px. Sources included unconstrained main
navigation, header/footer flex rows, the classification select, the chart legend,
and the Codex heading/repository badge. Table contents intentionally exceed the
viewport inside their existing horizontal scroll containers. Decorative radar
rings intentionally exceed the map bounds inside its existing clipped layer.

After the fix: all 17 browser tests pass using local Chrome; all requested
viewport widths have no document overflow. The viewport meta tag is already
correct. The service worker has no fetch handler or asset caches, and Vite emits
hashed assets, so no service-worker cache migration was added.
