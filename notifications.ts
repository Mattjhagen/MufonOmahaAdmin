import { Router } from 'express';
import webpush from 'web-push';
import { mkdirSync, readFileSync, writeFileSync, existsSync, renameSync } from 'node:fs';
import path from 'node:path';

type Subscription = { email: string; subscription: webpush.PushSubscription };
const directory = path.resolve('.data');
mkdirSync(directory, { recursive: true, mode: 0o700 });
const keysPath = path.join(directory, 'vapid.json');
if (!existsSync(keysPath)) writeFileSync(keysPath, JSON.stringify(webpush.generateVAPIDKeys()), { mode: 0o600 });
const keys = JSON.parse(readFileSync(keysPath, 'utf8'));
webpush.setVapidDetails('https://admin.mufonomaha.space', keys.publicKey, keys.privateKey);
const subscriptionsPath = path.join(directory, 'push-subscriptions.json');
let subscriptions: Subscription[] = existsSync(subscriptionsPath) ? JSON.parse(readFileSync(subscriptionsPath, 'utf8')) : [];
const save = () => {
  writeFileSync(subscriptionsPath + '.tmp', JSON.stringify(subscriptions), { mode: 0o600 });
  renameSync(subscriptionsPath + '.tmp', subscriptionsPath);
};
async function send(targets: Subscription[], title: string, body: string) {
  const results = await Promise.all(targets.map(async target => {
    try { await webpush.sendNotification(target.subscription, JSON.stringify({ title, body }), { TTL: 3600 }); return true; }
    catch (error: any) {
      if ([404, 410].includes(error.statusCode)) {
        subscriptions = subscriptions.filter(item => item.subscription.endpoint !== target.subscription.endpoint); save();
      }
      return false;
    }
  }));
  return results.filter(Boolean).length;
}
export const notifications = Router();
notifications.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!req.header('Cf-Access-Authenticated-User-Email')) return res.status(401).json({ error: 'Cloudflare Access login required' });
  if (req.method !== 'GET' && req.header('Origin') && req.header('Origin') !== 'https://admin.mufonomaha.space') return res.sendStatus(403);
  next();
});
notifications.get('/key', (_req, res) => res.json({ publicKey: keys.publicKey }));
notifications.post('/subscriptions', (req, res) => {
  const { endpoint, keys: subscriptionKeys } = req.body;
  // Restrict outbound requests to browser push services to prevent arbitrary URL delivery.
  let url: URL;
  try { url = new URL(endpoint); } catch { return res.sendStatus(400); }
  const hosts = ['fcm.googleapis.com', 'updates.push.services.mozilla.com', 'web.push.apple.com', 'wns.windows.com', 'notify.windows.com'];
  if (url.protocol !== 'https:' || url.port || url.username || url.password || !hosts.some(host => url.hostname === host || url.hostname.endsWith('.' + host)) || !subscriptionKeys?.p256dh || !subscriptionKeys?.auth) return res.sendStatus(400);
  const email = req.header('Cf-Access-Authenticated-User-Email')!;
  subscriptions = subscriptions.filter(item => item.subscription.endpoint !== endpoint);
  subscriptions.push({ email, subscription: { endpoint, keys: subscriptionKeys } }); save();
  res.sendStatus(201);
});
notifications.delete('/subscriptions', (req, res) => {
  const email = req.header('Cf-Access-Authenticated-User-Email');
  subscriptions = subscriptions.filter(item => item.email !== email || item.subscription.endpoint !== req.body.endpoint); save(); res.sendStatus(204);
});
notifications.post('/test', async (req, res) => {
  const delivered = await send(subscriptions.filter(item => item.email === req.header('Cf-Access-Authenticated-User-Email')), 'Omaha MUFON Admin', 'Notifications are enabled for this device.');
  res.status(delivered ? 200 : 502).json({ delivered });
});
notifications.post('/report', async (_req, res) => {
  const delivered = await send(subscriptions, 'New MUFON report', 'A new report was created in the admin workspace. Sign in to review.');
  res.json({ delivered });
});
