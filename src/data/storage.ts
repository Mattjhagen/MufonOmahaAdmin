// Remove only known seeded records; preserve reports and accounts created by users.
const seededIds: Record<string, Set<string>> = {
  "omaha_mufon_reports": new Set(["rep-001", "rep-002", "rep-003", "rep-004", "rep-005", "rep-006", "rep-007"]),
  "omaha_mufon_users": new Set(["usr-001", "usr-002", "usr-003", "usr-004", "usr-005", "usr-006"]),
  "omaha_mufon_audit_logs": new Set(["aud-001", "aud-002", "aud-003", "aud-004", "aud-005", "aud-006"]),
};

export function loadStoredRecords<T extends { id: string }>(key: string): T[] {
  try {
    const records: unknown = JSON.parse(localStorage.getItem(key) || '[]');
    if (!Array.isArray(records)) return [];
    return records.filter((record): record is T =>
      record !== null && typeof record === 'object' && typeof record.id === 'string' &&
      !seededIds[key]?.has(record.id)
    );
  } catch {
    return [];
  }
}
