import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadStoredRecords } from '../src/data/storage';
import App from '../src/App';
import { OmahaRadarMap } from '../src/components/OmahaRadarMap';
import { PublicSyncPreview } from '../src/components/PublicSyncPreview';
import { AuditLog } from '../src/components/AuditLog';

const values = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', { value: { getItem: (key: string) => values.get(key) ?? null } });

test('removes cached demo records while retaining manually created records', () => {
  for (const [key, id] of [['omaha_mufon_reports', 'rep-001'], ['omaha_mufon_users', 'usr-001'], ['omaha_mufon_audit_logs', 'aud-001']]) {
    values.set(key, JSON.stringify([{ id }, { id: 'created-by-user', title: 'Actual entry' }]));
    assert.deepEqual(loadStoredRecords(key), [{ id: 'created-by-user', title: 'Actual entry' }]);
  }
  values.clear();
});

test('handles missing and malformed browser data', () => {
  for (const value of ['{', '{}', 'null', '[null,1,{}]']) {
    values.set('omaha_mufon_reports', value);
    assert.deepEqual(loadStoredRecords('omaha_mufon_reports'), []);
  }
  values.clear();
});

test('empty application, map, public preview, and audit trail render without seeded activity', () => {
  const app = renderToStaticMarkup(<App />);
  assert.ok(app.length > 0);
  assert.doesNotMatch(app, /Matt Hagen|David Miller|NE-2026-0419/);
  const map = renderToStaticMarkup(<OmahaRadarMap reports={[]} onSelectReport={() => {}} />);
  assert.doesNotMatch(map, /Persistent high-altitude|Maneuvering luminous orbs/);
  assert.ok(renderToStaticMarkup(<PublicSyncPreview reports={[]} />));
  assert.ok(renderToStaticMarkup(<AuditLog logs={[]} />));
});
