import { Router } from 'express';
import { Scan, Website } from './models.js';
import { validateUrl, runAudit, enqueue } from './audit.js';

const r = Router();
const wrap = fn => (req, res, next) => fn(req, res).catch(next);

r.post('/scans', wrap(async (req, res) => {
  let u;
  try { u = await validateUrl(String(req.body.url || '').trim()); }
  catch (e) { return res.status(400).json({ error: e.message }); }
  const site = await Website.findOneAndUpdate({ url: u.origin }, { url: u.origin, host: u.hostname }, { upsert: true, new: true });
  const scan = await Scan.create({ website: site._id, url: u.href, host: u.hostname });
  enqueue(async () => {
    await Scan.findByIdAndUpdate(scan._id, { status: 'running', startedAt: new Date() });
    try {
      const result = await runAudit(u.href);
      await Scan.findByIdAndUpdate(scan._id, { ...result, status: 'done', finishedAt: new Date() });
    } catch (e) {
      await Scan.findByIdAndUpdate(scan._id, { status: 'failed', error: e.message.slice(0, 300), finishedAt: new Date() });
    }
  });
  res.status(201).json(scan);
}));

r.get('/scans', wrap(async (_req, res) => res.json(await Scan.find().select('-findings').sort('-createdAt').limit(100))));

r.get('/scans/:id', wrap(async (req, res) => {
  const scan = await Scan.findById(req.params.id).catch(() => null);
  scan ? res.json(scan) : res.status(404).json({ error: 'Scan not found' });
}));

r.delete('/scans/:id', wrap(async (req, res) => { await Scan.findByIdAndDelete(req.params.id); res.json({ ok: true }); }));

r.get('/websites', wrap(async (_req, res) => {
  const sites = await Website.find().sort('-updatedAt').lean();
  for (const s of sites) s.latest = await Scan.findOne({ website: s._id, status: 'done' }).select('-findings').sort('-createdAt');
  res.json(sites);
}));

export default r;
