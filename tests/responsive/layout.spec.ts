import { expect, test } from '@playwright/test';

const tabs = ['Sighting Queue', 'User Management', 'Codex Prompt Studio', 'Omaha Radar Map', 'Public Site Sync', 'Audit Logs'];
for (const width of [320, 360, 375, 390, 412, 768, 1024, 1440]) {
  for (const populated of [false, true]) {
    test(`${width}px ${populated ? 'populated' : 'empty'} dashboard`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.route('**/api/session', route => route.fulfill({ json: { email: 'investigator-with-a-long-address@example.com' } }));
      if (populated) await page.addInitScript(() => {
        const user = { id: 'responsive-user', name: 'Responsive Test Investigator', email: 'investigator@example.com', role: 'field_investigator', status: 'active', assignedCasesCount: 1, dateJoined: '2026-10-01', lastLogin: '2026-10-29' };
        const report = { id: 'responsive-report', caseNumber: 'NE-TEST-2026', title: 'Responsive regression sighting with a detailed title', description: 'Test sighting description', date: '2026-10-28', time: '22:15', location: { address: 'Test address', city: 'Omaha', state: 'NE', zip: '68102', lat: 41.25, lng: -95.93, landmarkProximity: 'Near downtown' }, witness: { name: 'Test Witness', email: 'witness@example.com', phone: '', isAnonymous: true, redactedName: 'Witness A' }, classification: { hynek: 'NL', shape: 'Sphere', duration: '5 minutes', color: 'White', estimatedAltitude: 'Unknown', estimatedSpeed: 'Unknown', sound: 'None' }, conditions: { weather: 'Clear', visibility: 'Good', moonPhase: 'Full', cloudCover: 'None' }, status: 'approved', moderationNotes: '', credibilityScore: 90, assignedInvestigatorId: user.id, assignedInvestigatorName: user.name, fieldNotes: [], media: [], isPublishedToPublic: true, createdAt: '2026-10-28T00:00:00Z', updatedAt: '2026-10-29T00:00:00Z' };
        localStorage.setItem('omaha_mufon_reports', JSON.stringify([report, { ...report, id: 'responsive-pending', status: 'pending' }]));
        localStorage.setItem('omaha_mufon_users', JSON.stringify([user]));
        localStorage.setItem('omaha_mufon_audit_logs', JSON.stringify([{ id: 'responsive-audit', timestamp: '2026-10-29 12:00 CST', actor: user, action: 'APPROVE_REPORT', targetType: 'sighting_report', targetId: report.id, targetLabel: report.title, details: 'Approved test sighting for responsive verification', severity: 'info' }]));
      });
      await page.goto('/');
      const checkWidth = async () => {
        const result = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, viewport: innerWidth,
          overflowing: [...document.querySelectorAll('body *')].filter(el => {
            if (el.getBoundingClientRect().right <= innerWidth + 1) return false;
            for (let parent = el.parentElement; parent; parent = parent.parentElement) {
              if (['auto', 'scroll', 'hidden'].includes(getComputedStyle(parent).overflowX)) return false;
            }
            return true;
          }).map(el => `${el.tagName}.${el.getAttribute('class')} ${el.textContent?.slice(0, 60)}`),
        }));
        expect(result.width, JSON.stringify(result)).toBeLessThanOrEqual(result.viewport);
        expect(result.overflowing).toEqual([]);
      };
      for (const tab of tabs) {
        const button = page.getByRole('navigation', { name: 'Admin sections' }).getByRole('button', { name: tab });
        await button.click();
        await expect(button).toHaveAttribute('aria-current', 'page');
        await checkWidth();
        for (const scroller of await page.locator('main .overflow-x-auto').all()) {
          await scroller.evaluate(el => { el.scrollLeft = el.scrollWidth; });
          await checkWidth();
        }
      }
      const nav = page.getByRole('navigation', { name: 'Admin sections' });
      if (width < 768) {
        expect(await nav.evaluate(el => el.scrollWidth > el.clientWidth)).toBe(true);
        await nav.evaluate(el => { el.scrollLeft = el.scrollWidth; });
        expect(await nav.evaluate(el => el.scrollLeft)).toBeGreaterThan(0);
        await checkWidth();
      }
      await page.getByRole('button', { name: 'New Report Intake', exact: true }).click();
      await checkWidth();
    });
  }
}

test('Pixel touch viewport with an active PWA service worker survives reload and resize', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
  const page = await context.newPage();
  await page.route('**/api/session', route => route.fulfill({ json: { email: 'test@example.com' } }));
  await page.goto('/');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  expect(await page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  for (const tab of tabs) {
    await page.getByRole('navigation').getByRole('button', { name: tab }).tap();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.getByRole('navigation').getByRole('button', { name: 'Omaha Radar Map' }).tap();
  await page.setViewportSize({ width: 768, height: 900 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await context.close();
});
