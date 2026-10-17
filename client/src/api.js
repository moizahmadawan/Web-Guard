const j = async r => { const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(d.error || 'Request failed'); return d; };
export const api = {
  scans: () => fetch('/api/scans').then(j),
  scan: id => fetch(`/api/scans/${id}`).then(j),
  create: url => fetch('/api/scans', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) }).then(j),
  remove: id => fetch(`/api/scans/${id}`, { method: 'DELETE' }).then(j),
};
