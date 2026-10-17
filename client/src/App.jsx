import { NavLink, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Report from './pages/Report.jsx';
import History from './pages/History.jsx';

const link = ({ isActive }) => `rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`;

export default function App() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <NavLink to="/" className="flex items-center gap-2.5 text-lg font-extrabold text-white">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinejoin="round"><path d="M12 2 4 5v6c0 5 3.4 9.3 8 11 4.6-1.7 8-6 8-11V5l-8-3Z" /><path d="m8.5 12 2.5 2.5 4.5-5" strokeLinecap="round" /></svg>
            WebGuard
          </NavLink>
          <nav className="flex gap-1"><NavLink to="/" end className={link}>Dashboard</NavLink><NavLink to="/history" className={link}>History</NavLink></nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/scan/:id" element={<Report />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </main>
    </div>
  );
}
