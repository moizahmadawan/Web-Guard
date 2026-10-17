import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { Card, Mini, Status, ago } from '../ui.jsx';

export default function Dashboard() {
  const [url, setUrl] = useState(''), [scans, setScans] = useState([]), [err, setErr] = useState(''), [busy, setBusy] = useState(false);
  const nav = useNavigate();
  const load = () => api.scans().then(setScans).catch(() => {});
  useEffect(() => { load(); const t = setInterval(load, 4000); return () => clearInterval(t); }, []);

  const submit = async e => {
    e.preventDefault(); setErr(''); setBusy(true);
    try { const s = await api.create(url); nav(`/scan/${s._id}`); } catch (x) { setErr(x.message); }
    setBusy(false);
  };

  return (
    <div className="space-y-12">
      <section className="max-w-2xl">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Find out what slows your site down.</h1>
        <p className="mt-4 text-lg text-slate-400">Run a real Lighthouse audit and get clear fixes for performance, accessibility, best practices, and SEO.</p>
        <form onSubmit={submit} className="mt-8 flex flex-col gap-3 sm:flex-row">
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="example.com" aria-label="Website address"
            className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white placeholder:text-slate-500" />
          <button disabled={busy || !url.trim()} className="rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50">
            {busy ? 'Starting…' : 'Scan website'}
          </button>
        </form>
        {err && <p role="alert" className="mt-3 text-sm text-rose-400">{err}</p>}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-white">Recent scans</h2>
        {scans.length === 0 ? <Card className="text-slate-400">No scans yet. Enter a website above to run your first audit.</Card> : (
          <div className="grid gap-3 md:grid-cols-2">
            {scans.slice(0, 8).map(s => (
              <Link key={s._id} to={`/scan/${s._id}`}>
                <Card className="flex items-center justify-between gap-4 transition-colors hover:border-slate-600">
                  <div className="min-w-0"><p className="truncate font-semibold text-white">{s.host}</p><p className="mt-1 text-sm text-slate-500">{ago(s.createdAt)}</p></div>
                  {s.status === 'done' ? <Mini scores={s.scores} /> : <Status s={s.status} />}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
