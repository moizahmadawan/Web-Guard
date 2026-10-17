export const tone = s => (s >= 90 ? '#34d399' : s >= 50 ? '#fbbf24' : '#f87171');
export const CATS = [['performance', 'Performance'], ['accessibility', 'Accessibility'], ['bestPractices', 'Best practices'], ['seo', 'SEO']];

export const Card = ({ className = '', ...p }) => <div className={`rounded-2xl border border-slate-800 bg-slate-900/60 p-5 ${className}`} {...p} />;

export function Ring({ value = 0, label, size = 104 }) {
  const r = 42, c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={`${label}: ${value}`}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="#1e293b" strokeWidth="7" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={tone(value)} strokeWidth="7" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} transform="rotate(-90 50 50)" style={{ transition: 'stroke-dashoffset .9s ease' }} />
        <text x="50" y="56" textAnchor="middle" fontSize="26" fontWeight="700" fill="#f1f5f9">{value}</text>
      </svg>
      <span className="text-sm text-slate-400">{label}</span>
    </div>
  );
}

export function Mini({ scores }) {
  return (
    <div className="flex gap-1.5">
      {CATS.map(([k, l]) => (
        <span key={k} title={l} className="rounded-md px-2 py-0.5 text-xs font-semibold font-mono"
          style={{ color: tone(scores?.[k] ?? 0), background: `${tone(scores?.[k] ?? 0)}1f` }}>{scores?.[k] ?? '–'}</span>
      ))}
    </div>
  );
}

const STATUS = { queued: 'bg-slate-800 text-slate-300', running: 'bg-cyan-400/15 text-cyan-300', done: 'bg-emerald-400/15 text-emerald-300', failed: 'bg-rose-400/15 text-rose-300' };
export const Status = ({ s }) => <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS[s]}`}>{s === 'running' ? 'Scanning…' : s === 'queued' ? 'Waiting' : s === 'done' ? 'Complete' : 'Failed'}</span>;

export const ago = d => { const m = Math.round((Date.now() - new Date(d)) / 60000); return m < 1 ? 'just now' : m < 60 ? `${m}m ago` : m < 1440 ? `${Math.round(m / 60)}h ago` : `${Math.round(m / 1440)}d ago`; };
