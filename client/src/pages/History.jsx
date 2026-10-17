import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Legend, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';
import { api } from '../api.js';
import { Card, CATS, Mini, Status, ago } from '../ui.jsx';

export default function History() {
  const [scans, setScans] = useState([]), [picked, setPicked] = useState([]);
  const load = () => api.scans().then(setScans);
  useEffect(() => { load(); }, []);

  const toggle = s => setPicked(p => (p.find(x => x._id === s._id) ? p.filter(x => x._id !== s._id) : [...p, s].slice(-2)));
  const remove = async id => { await api.remove(id); setPicked(p => p.filter(x => x._id !== id)); load(); };
  const data = CATS.map(([k, l]) => ({ category: l, A: picked[0]?.scores?.[k], B: picked[1]?.scores?.[k] }));
  const label = s => `${s.host} · ${ago(s.createdAt)}`;

  return (
    <div className="space-y-8">
      <div><h1 className="text-3xl font-bold text-white">Scan history</h1><p className="mt-2 text-slate-400">Select two completed scans to compare their scores.</p></div>

      {picked.length === 2 && (
        <Card>
          <div className="h-80"><ResponsiveContainer>
            <RadarChart data={data}>
              <PolarGrid stroke="#334155" /><PolarAngleAxis dataKey="category" stroke="#94a3b8" /><PolarRadiusAxis domain={[0, 100]} stroke="#475569" />
              <Radar name={label(picked[0])} dataKey="A" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.25} />
              <Radar name={label(picked[1])} dataKey="B" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.25} />
              <Legend /><Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12 }} />
            </RadarChart>
          </ResponsiveContainer></div>
        </Card>
      )}

      {scans.length === 0 ? <Card className="text-slate-400">No scans yet. Run an audit from the dashboard.</Card> : (
        <Card className="divide-y divide-slate-800 p-0">
          {scans.map(s => (
            <div key={s._id} className="flex flex-wrap items-center gap-4 px-5 py-3">
              <input type="checkbox" aria-label={`Compare ${s.host}`} disabled={s.status !== 'done'} checked={!!picked.find(x => x._id === s._id)} onChange={() => toggle(s)} className="h-4 w-4 accent-cyan-400" />
              <Link to={`/scan/${s._id}`} className="min-w-0 flex-1"><p className="truncate font-medium text-white">{s.url}</p><p className="text-sm text-slate-500">{ago(s.createdAt)}</p></Link>
              {s.status === 'done' ? <Mini scores={s.scores} /> : <Status s={s.status} />}
              <button onClick={() => remove(s._id)} className="text-sm text-slate-500 hover:text-rose-400">Delete</button>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
