import dns from 'node:dns/promises';
import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';

const PRIVATE = /^(0\.|10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|::1$|f[cd]|fe80)/i;

export async function validateUrl(raw) {
  let u;
  try { u = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`); }
  catch { throw new Error('Enter a valid website address, like example.com'); }
  if (!['http:', 'https:'].includes(u.protocol)) throw new Error('Only http and https addresses are supported');
  let addrs;
  try { addrs = await dns.lookup(u.hostname, { all: true }); }
  catch { throw new Error('That domain could not be found'); }
  if (addrs.some(a => PRIVATE.test(a.address))) throw new Error('Private and internal addresses cannot be scanned');
  return u;
}

// One audit at a time: Lighthouse is CPU and memory heavy.
let chain = Promise.resolve();
export const enqueue = job => { chain = chain.then(job).catch(() => {}); };

const CATS = { performance: 'performance', accessibility: 'accessibility', 'best-practices': 'bestPractices', seo: 'seo' };

export async function runAudit(url) {
  const chrome = await launch({ chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'] });
  try {
    const { lhr } = await lighthouse(url, { port: chrome.port, output: 'json', logLevel: 'error', onlyCategories: Object.keys(CATS) });
    const scores = {}, owner = {};
    for (const [key, name] of Object.entries(CATS)) {
      const c = lhr.categories[key];
      scores[name] = Math.round((c.score ?? 0) * 100);
      c.auditRefs.forEach(a => { owner[a.id] = name; });
    }
    const A = lhr.audits, num = id => A[id]?.numericValue ?? null;
    const metrics = { fcp: num('first-contentful-paint'), lcp: num('largest-contentful-paint'),
      tbt: num('total-blocking-time'), cls: num('cumulative-layout-shift'), si: num('speed-index') };
    const findings = Object.values(A)
      .filter(a => owner[a.id] && a.score !== null && a.score < 0.9 && ['binary', 'numeric'].includes(a.scoreDisplayMode))
      .map(a => ({ id: a.id, title: a.title, category: owner[a.id], score: a.score, displayValue: a.displayValue || '',
        description: (a.description || '').replace(/\s*\[Learn.*$/s, '') }))
      .sort((x, y) => x.score - y.score);
    return { scores, metrics, findings };
  } finally { await chrome.kill(); }
}
