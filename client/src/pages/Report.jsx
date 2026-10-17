import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { Card, CATS, Ring, Status, tone } from '../ui.jsx';

const ms = v => (v == null ? '–' : v >= 1000 ? `${(v / 1000).toFixed(1)} s` : `${Math.round(v)} ms`);
const METRICS = [['fcp', 'First Contentful Paint', ms], ['lcp', 'Largest Contentful Paint', ms], ['tbt', 'Total Blocking Time', ms], ['cls', 'Layout Shift', v => (v == null ? '–' : v.toFixed(3))], ['si', 'Speed Index', ms]];

export default function Report() {
  const { id } = useParams();
  const [scan, setScan] = useState(null), [err, setErr] = useState(''), [tab, setTab] = useState('all');

  useEffect(() => {
    let t, alive = true;
    const load = async () => {
      try { const s = await api.scan(id); if (!alive) return; setScan(s); if (['queued', 'running'].includes(s.status)) t = setTimeout(load, 2500); }
      catch (e) { setErr(e.message); }
    };
    load();
    return () => { alive = false; clearTimeout(t); };
  }, [id]);

  if (err) return <p role="alert" className="text-rose-400">{err}</p>;
  if (!scan) return <p className="text-slate-400">Loading report…</p>;
  const findings = (scan.findings || []).filter(f => tab === 'all' || f.category === tab);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><Link to="/" className="text-sm text-slate-500 hover:text-white">Back to dashboard</Link>
          <h1 className="mt-1 break-all text-2xl font-bold text-white">{scan.url}</h1></div>
        <Status s={scan.status} />
      </div>

      {['queued', 'running'].includes(scan.status) && <Card className="text-slate-300">Your audit is running. This usually takes under a minute, and the report appears here when it finishes.</Card>}
      {scan.status === 'failed' && <Card className="border-rose-500/40 text-rose-300">The scan failed: {scan.error || 'unknown error'}. Check the address and try again.</Card>}

      {scan.status === 'done' && (<>
        <Card className="grid grid-cols-2 justify-items-center gap-6 py-8 md:grid-cols-4">
          {CATS.map(([k, l]) => <Ring key={k} value={scan.scores[k]} label={l} />)}
        </Card>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {METRICS.map(([k, l, f]) => <Card key={k} className="p-4"><p className="text-xs text-slate-500">{l}</p><p className="mt-1 font-mono text-xl font-semibold text-white">{f(scan.metrics[k])}</p></Card>)}
        </div>

        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-white">What to fix ({findings.length})</h2>
            <div className="flex flex-wrap gap-1">
              {[['all', 'All'], ...CATS].map(([k, l]) => (
                <button key={k} onClick={() => setTab(k)} className={`rounded-lg px-3 py-1.5 text-sm ${tab === k ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}>{l}</button>
              ))}
            </div>
          </div>
          {findings.length === 0 ? <Card className="text-emerald-300">Nothing to fix here. Every check in this category passed.</Card> : (
            <div className="space-y-2">
              {findings.map(f => (
                <details key={f.id} className="group rounded-xl border border-slate-800 bg-slate-900/60 p-4 open:border-slate-600">
                  <summary className="flex cursor-pointer list-none items-center gap-3">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: tone(f.score * 100) }} />
                    <span className="flex-1 font-medium text-white">{f.title}</span>
                    {f.displayValue && <span className="font-mono text-xs text-slate-500">{f.displayValue}</span>}
                  </summary>
                  <p className="mt-3 pl-5 text-sm leading-relaxed text-slate-400">{f.description}</p>
                </details>
              ))}
            </div>
          )}
        </section>
      </>)}
    </div>
  );
}
