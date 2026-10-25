import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Building2, ChevronDown, ClipboardList, FileBarChart, HandHelping, LayoutDashboard, Map, Menu, Search, Settings as Cog, Hammer, UserCircle2, X, Play, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useData } from '../data/store';
import { CONSTITUENCY, CONSTITUENCY_FULL } from '../data/seed';
import { ago, cx } from './ui';

export const NAV = [
  { to: '/', label: 'Command Centre', icon: LayoutDashboard },
  { to: '/villages', label: 'Village 360°', icon: Map },
  { to: '/issues', label: "People's Issues", icon: ClipboardList },
  { to: '/projects', label: 'Development Tracker', icon: Hammer },
  { to: '/schemes', label: 'Scheme Assistance', icon: HandHelping },
  { to: '/field', label: 'Field Operations', icon: Building2 },
  { to: '/report', label: 'Public Impact Report', icon: FileBarChart },
  { to: '/settings', label: 'Settings', icon: Cog },
];

function Logo() {
  return <div className="flex items-center gap-2.5"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest-700 shadow-sm"><svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden><path d="M5 22h22M9 22v-6m14 6v-6M7 16c5-6 13-6 18 0" stroke="#f59e3b" strokeWidth="2.4" fill="none" strokeLinecap="round" /></svg></div><div className="leading-tight"><p className="text-[15px] font-semibold tracking-tight text-stone-900">PrajaSetu</p><p className="text-[11px] text-stone-500">Constituency Command Centre</p></div></div>;
}

function SideNav({ onNav }: { onNav?: () => void }) {
  return (
    <nav aria-label="Main" className="flex flex-col gap-1">
      {NAV.map(({ to, label, icon: I }) => (
        <NavLink key={to} to={to} end={to === '/'} onClick={onNav} data-nav={to}
          className={({ isActive }) => cx('group flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-[14px] font-medium transition', isActive ? 'bg-forest-700 text-white shadow-sm' : 'text-stone-700 hover:bg-forest-50 hover:text-forest-800')}>
          <I size={18} className="shrink-0" />{label}
        </NavLink>
      ))}
    </nav>
  );
}

function useOutside(ref: React.RefObject<HTMLElement>, cb: () => void) {
  useEffect(() => { const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) cb(); }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, [ref, cb]);
}

function GlobalSearch() {
  const { data } = useData();
  const [q, setQ] = useState(''); const [open, setOpen] = useState(false);
  const nav = useNavigate(); const ref = useRef<HTMLDivElement>(null);
  useOutside(ref, () => setOpen(false));
  const res = useMemo(() => {
    const t = q.trim().toLowerCase(); if (t.length < 2) return [];
    const vn = (id: string) => data.villages.find((v) => v.id === id)?.name ?? '';
    const out: { type: string; title: string; sub: string; to: string }[] = [];
    data.villages.filter((v) => (v.name + ' ' + v.mandal).toLowerCase().includes(t)).slice(0, 5).forEach((v) => out.push({ type: 'Village', title: v.name, sub: `${v.mandal} mandal`, to: `/villages?id=${v.id}` }));
    data.issues.filter((i) => [i.id, i.title, i.category, vn(i.villageId), i.description].join(' ').toLowerCase().includes(t)).slice(0, 6).forEach((i) => out.push({ type: 'Issue', title: `${i.id} · ${i.title}`, sub: `${vn(i.villageId)} · ${i.status}`, to: `/issues?id=${i.id}` }));
    data.projects.filter((p) => [p.id, p.title, p.category, vn(p.villageId), p.agency].join(' ').toLowerCase().includes(t)).slice(0, 5).forEach((p) => out.push({ type: 'Project', title: p.title, sub: `${vn(p.villageId)} · ${p.status}`, to: `/projects?id=${p.id}` }));
    return out;
  }, [q, data]);
  const go = (to: string) => { nav(to); setOpen(false); setQ(''); };
  return (
    <div ref={ref} className="relative w-full max-w-md" data-tour="search">
      <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
      <input value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onKeyDown={(e) => { if (e.key === 'Enter' && res[0]) go(res[0].to); if (e.key === 'Escape') setOpen(false); }}
        placeholder="Search villages, issues, projects…" aria-label="Global search" className="h-11 w-full rounded-xl border border-stone-200 bg-cream-50 pl-10 pr-3 text-sm focus:border-forest-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-100" />
      {open && q.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-12 z-50 max-h-96 overflow-y-auto rounded-2xl border border-stone-200 bg-white p-1.5 shadow-xl" role="listbox" data-testid="search-results">
          {res.length === 0 ? <p className="px-3 py-4 text-sm text-stone-500">No villages, issues or projects match “{q}”.</p> : res.map((r, i) => (
            <button key={i} role="option" onClick={() => go(r.to)} className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-forest-50">
              <span className="mt-0.5 w-16 shrink-0 text-[11px] font-semibold uppercase tracking-wide text-forest-700">{r.type}</span>
              <span className="min-w-0"><span className="block truncate text-sm font-medium text-stone-900">{r.title}</span><span className="block truncate text-xs text-stone-500">{r.sub}</span></span>
            </button>))}
        </div>)}
    </div>
  );
}

function Notifications() {
  const { data, unread, markRead } = useData();
  const [open, setOpen] = useState(false); const ref = useRef<HTMLDivElement>(null); const nav = useNavigate();
  useOutside(ref, () => setOpen(false));
  return (
    <div ref={ref} className="relative">
      <button aria-label={`Notifications${unread ? `, ${unread} new` : ''}`} onClick={() => { setOpen(!open); markRead(); }} className="relative flex h-11 w-11 items-center justify-center rounded-xl text-stone-600 hover:bg-stone-100">
        <Bell size={20} />{unread > 0 && <span className="absolute right-1.5 top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-saffron-500 px-1 text-[10px] font-bold text-white">{unread}</span>}
      </button>
      {open && (
        <div className="fixed left-3 right-3 top-16 z-50 rounded-2xl border border-stone-200 bg-white shadow-xl sm:absolute sm:left-auto sm:right-0 sm:top-12 sm:w-96" data-testid="notifications">
          <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3"><p className="text-sm font-semibold">Recent activity</p><span className="text-[11px] text-stone-500">Demo activity log</span></div>
          <ul className="max-h-80 overflow-y-auto p-1.5">{data.activity.slice(0, 8).map((a) => (
            <li key={a.id}><button onClick={() => { nav(a.link); setOpen(false); }} className="w-full rounded-xl px-3 py-2.5 text-left hover:bg-cream-100"><p className="text-sm text-stone-800">{a.text}</p><p className="text-[11px] text-stone-500">{ago(a.at)}</p></button></li>))}</ul>
        </div>)}
    </div>
  );
}

function Profile() {
  const [open, setOpen] = useState(false); const ref = useRef<HTMLDivElement>(null); const nav = useNavigate();
  const [role, setRole] = useState(() => localStorage.getItem('prajasetu-role') || 'Office Coordinator');
  useOutside(ref, () => setOpen(false));
  const roles = ['Office Coordinator', 'Field Staff', 'MLA Briefing View'];
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} aria-label="Profile menu" className="flex h-11 items-center gap-2 rounded-xl px-2 hover:bg-stone-100">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-saffron-100 text-sm font-semibold text-saffron-700">DS</span>
        <span className="hidden text-left leading-tight lg:block"><span className="block text-sm font-medium">Demo Staff</span><span className="block text-[11px] text-stone-500">{role}</span></span><ChevronDown size={16} className="hidden text-stone-400 lg:block" />
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-50 w-72 rounded-2xl border border-stone-200 bg-white p-2 shadow-xl">
          <div className="px-3 py-2"><p className="text-sm font-semibold">Demo Staff</p><p className="text-xs text-stone-500">Demo role only — no login or real account.</p></div>
          <p className="px-3 pt-2 text-[11px] font-semibold uppercase tracking-wide text-stone-400">View as (demo role)</p>
          {roles.map((r) => <button key={r} onClick={() => { setRole(r); localStorage.setItem('prajasetu-role', r); }} className={cx('flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm hover:bg-cream-100', r === role && 'font-medium text-forest-800')}>{r}{r === role && <CheckCircle2 size={16} />}</button>)}
          <div className="my-1 border-t border-stone-100" />
          <button onClick={() => { nav('/settings'); setOpen(false); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm hover:bg-cream-100"><Cog size={16} />Settings & demo data</button>
        </div>)}
    </div>
  );
}

function ConstituencySelect() {
  const [open, setOpen] = useState(false); const ref = useRef<HTMLDivElement>(null);
  useOutside(ref, () => setOpen(false));
  return (
    <div ref={ref} className="relative hidden md:block">
      <button onClick={() => setOpen(!open)} className="flex h-11 items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 text-sm font-medium hover:bg-stone-50" aria-label="Select constituency"><span className="h-2 w-2 rounded-full bg-forest-500" />{CONSTITUENCY}<ChevronDown size={16} className="text-stone-400" /></button>
      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-stone-200 bg-white p-2 shadow-xl">
          <button onClick={() => setOpen(false)} className="flex w-full items-start gap-2 rounded-xl bg-forest-50 px-3 py-2.5 text-left text-sm"><CheckCircle2 size={16} className="mt-0.5 text-forest-700" /><span><span className="block font-medium">{CONSTITUENCY}</span><span className="block text-xs text-stone-500">{CONSTITUENCY_FULL}</span></span></button>
          <p className="px-3 py-2.5 text-xs text-stone-500">This demo is configured for a single fictional constituency. Other constituencies are not set up.</p>
        </div>)}
    </div>
  );
}

function Toasts() {
  const { toasts, dismissToast } = useData();
  return (
    <div className="pointer-events-none fixed bottom-14 right-3 z-[70] flex w-[calc(100%-1.5rem)] max-w-sm flex-col gap-2 no-print" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} role="status" data-testid="toast" className={cx('pointer-events-auto flex items-start gap-2.5 rounded-xl border bg-white px-4 py-3 text-sm shadow-lg animate-fadeUp', t.tone === 'error' ? 'border-red-200' : 'border-forest-200')}>
          {t.tone === 'error' ? <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-600" /> : t.tone === 'info' ? <Info size={18} className="mt-0.5 shrink-0 text-stone-500" /> : <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-forest-600" />}
          <span className="flex-1 text-stone-800">{t.text}</span><button aria-label="Dismiss" onClick={() => dismissToast(t.id)} className="text-stone-400 hover:text-stone-700"><X size={16} /></button>
        </div>))}
    </div>
  );
}

export default function Layout({ children, onStartDemo }: { children: React.ReactNode; onStartDemo: () => void }) {
  const [mobile, setMobile] = useState(false); const loc = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  useEffect(() => { setMobile(false); window.scrollTo(0, 0); }, [loc.pathname]);
  return (
    <div className="min-h-screen bg-cream-50">
      <div id="app-shell">
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-stone-200 bg-white px-4 py-5 lg:flex" data-tour="sidebar">
          <div className="px-1"><Logo /></div>
          <div className="mt-7 flex-1 overflow-y-auto"><SideNav /></div>
          <div className="rounded-2xl border border-saffron-200 bg-saffron-50 p-3.5">
            <p className="text-xs font-semibold text-saffron-700">Presenting to an MLA?</p>
            <p className="mt-1 text-xs text-stone-600">A 6-step guided walkthrough of the platform.</p>
            <button onClick={onStartDemo} className="mt-2.5 flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-saffron-500 text-sm font-medium text-white hover:bg-saffron-600"><Play size={14} />Start MLA Demo</button>
          </div>
        </aside>
        {mobile && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
            <div className="absolute inset-0 bg-stone-900/40" onClick={() => setMobile(false)} />
            <div className="absolute inset-y-0 left-0 flex w-[82%] max-w-xs flex-col bg-white px-4 py-5 shadow-2xl animate-fadeUp">
              <div className="flex items-center justify-between"><Logo /><button aria-label="Close menu" onClick={() => setMobile(false)} className="rounded-lg p-2 hover:bg-stone-100"><X size={20} /></button></div>
              <div className="mt-6 flex-1 overflow-y-auto"><SideNav onNav={() => setMobile(false)} /></div>
              <button onClick={() => { setMobile(false); onStartDemo(); }} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-saffron-500 font-medium text-white"><Play size={16} />Start MLA Demo</button>
            </div>
          </div>)}
        <div className="lg:pl-64">
          <header className="sticky top-0 z-20 border-b border-stone-200/80 bg-white/90 backdrop-blur">
            <div className="flex h-16 items-center gap-2 px-3 sm:gap-3 sm:px-6">
              <button aria-label="Open navigation menu" onClick={() => setMobile(true)} className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-stone-100 lg:hidden"><Menu size={22} /></button>
              <div className="hidden sm:block lg:hidden"><Logo /></div>
              <div className="flex-1"><GlobalSearch /></div>
              <ConstituencySelect /><Notifications /><Profile />
            </div>
          </header>
          <main ref={mainRef} className="mx-auto max-w-[1400px] px-4 py-6 pb-20 sm:px-6 lg:px-8">{children}</main>
        </div>
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-saffron-200 bg-saffron-50/95 px-4 py-2 text-center text-[12px] font-medium text-saffron-700 backdrop-blur lg:pl-64 no-print" data-testid="demo-banner">
          <UserCircle2 size={0} className="hidden" />Illustrative demo data — not official constituency records. · Local demo; nothing is sent to any government department.
        </div>
      </div>
      <Toasts />
    </div>
  );
}
