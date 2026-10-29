import React, { useEffect, useState } from 'react';

type InstallPrompt = Event & { prompt(): Promise<void>; userChoice: Promise<{ outcome: string }> };

export function PwaControls() {
  const [installPrompt, setInstallPrompt] = useState<InstallPrompt | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const supported = typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

  useEffect(() => {
    const prompt = (event: Event) => { event.preventDefault(); setInstallPrompt(event as InstallPrompt); };
    const installed = () => setInstallPrompt(null);
    window.addEventListener('beforeinstallprompt', prompt);
    window.addEventListener('appinstalled', installed);
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(async registration => {
        if ('pushManager' in registration) setEnabled(Boolean(await registration.pushManager.getSubscription()));
      }).catch(() => setMessage('App setup failed. Refresh to retry.'));
    }
    return () => { window.removeEventListener('beforeinstallprompt', prompt); window.removeEventListener('appinstalled', installed); };
  }, []);

  async function toggleNotifications() {
    setBusy(true); setMessage('');
    try {
      // Permission must be requested directly from the button gesture.
      if (!enabled && await Notification.requestPermission() !== 'granted') throw new Error('Notifications are blocked. Allow them in browser settings to enable alerts.');
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();
      if (enabled && subscription) {
        const response = await fetch('/api/notifications/subscriptions', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: subscription.endpoint }) });
        if (!response.ok) throw new Error('Could not disable notifications. Please retry.');
        await subscription.unsubscribe(); setEnabled(false); setMessage('Notifications disabled.'); return;
      }
      const response = await fetch('/api/notifications/key');
      if (!response.ok) throw new Error('Sign in again to enable notifications.');
      const { publicKey } = await response.json();
      const bytes = Uint8Array.from(atob(publicKey.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
      subscription ||= await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: bytes });
      const saved = await fetch('/api/notifications/subscriptions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(subscription.toJSON()) });
      if (!saved.ok) { await subscription.unsubscribe(); throw new Error('Could not save notification settings. Please retry.'); }
      setEnabled(true);
      const tested = await fetch('/api/notifications/test', { method: 'POST' });
      setMessage(tested.ok ? 'Notifications enabled. A test alert was sent.' : 'Notifications enabled; test delivery failed.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Notification setup failed.'); }
    finally { setBusy(false); }
  }

  return <div className="max-w-7xl mx-auto px-4 pt-3 text-xs text-slate-400 flex flex-wrap items-center gap-3">
    {installPrompt ? <button className="text-cyan-300" onClick={async () => { await installPrompt.prompt(); if ((await installPrompt.userChoice).outcome === 'accepted') setInstallPrompt(null); }}>Install app</button> : <span>Install from your browser menu, or on iPhone: Share → Add to Home Screen.</span>}
    {supported ? <button disabled={busy} className="text-cyan-300 disabled:opacity-50" onClick={toggleNotifications}>{busy ? 'Updating…' : enabled ? 'Disable notifications' : 'Enable notifications'}</button> : <span>Notifications require a supported browser; on iPhone, open the installed app.</span>}
    <span role="status">{message}</span>
  </div>;
}
