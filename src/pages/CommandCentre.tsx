import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertTriangle, ArrowRight, CheckCircle2, ClipboardList, Hammer, Inbox, MapPinned, Play, Send, ShieldCheck, CalendarDays } from 'lucide-react';
import { useData, useMetrics, statusIdx, reachedAt, villageHealth } from '../data/store';
import { Badge, Card, CardHeader, DemoNote, PriorityBadge, Progress, ProjectBadge, Skeleton, Stat, StatusBadge, ago, cx, fmtDate } from '../components/ui';
import { ISSUE_CATEGORIES } from '../data/types';
import { CONSTITUENCY_FULL } from '../data/seed';

export const HEALTH = { attention: { label: 'Needs attention', dot: 'bg-red-500', ring: 'ring-red-200 bg-red-50/60' }, watch: { label: 'Watch', dot: 'bg-saffron-500', ring: 'ring-saffron-200 bg-saffron-50/60' }, stable: { label: 'Stable', dot: 'bg-forest-500', ring: 'ring-forest-200 bg-forest-50/60' } };

export function monthlyTrend(issues: ReturnType<typeof useData>['data']['issues'], anchor: Date, months = 6) {
  const out: { month: string; Received: number; 'Resolved / verified': number; 'Pending (open)': number }[] = [];
  for (let m = months - 1; m >= 0; m--) {
    const start = new Date(anchor.getFullYear(), anchor.getMonth() - m, 1); const end = new Date(anchor.getFullYear(), anchor.getMonth() - m + 1, 1);
    const inR = (s: string | null) => !!s && new Date(s) >= start && new Date(s) < end;
    const received = issues.filter((i) => inR(i.submittedAt)).length;
    const resolved = issues.filter((i) => inR(reachedAt(i, 'Resolved'))).length;
    const pending = issues.filter((i) => new Date(i.submittedAt) < end && !((reachedAt(i, 'Resolved') && new Date(reachedAt(i, 'Resolved')!) < end))).length;
    out.push({ month: start.toLocaleDateString('en-IN', { month: 'short' }), Received: received, 'Resolved / verified': resolved, 'Pending (open)': pending });
  }
  return out;
}

export default function CommandCentre({ onStartDemo }: { onStartDemo: () => void }) {
  const { data } = useData(); const m = useMetrics(); const nav = useNavigate();
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 350); return () => clearTimeout(t); }, []);
  const vn = (id: string) => data.villages.find((v) => v.id === id)?.name ?? '';
  const cat = useMemo(() => ISSUE_CATEGORIES.map((c) => ({ name: c, Open: data.issues.filter((i) => i.category === c && statusIdx(i.status) < 5).length, Closed: data.issues.filter((i) => i.category === c && statusIdx(i.status) >= 5).length })).filter((x) => x.Open + x.Closed > 0).sort((a, b) => b.Open + b.Closed - (a.Open + a.Closed)), [data.issues]);
  const trend = useMemo(() => monthlyTrend(data.issues, new Date()), [data.issues]);
  const urgent = data.issues.filter((i) => statusIdx(i.status) <= 1 && (i.priority === 'Critical' || i.priority === 'High')).concat(data.issues.filter((i) => statusIdx(i.status) <= 1 && i.priority !== 'Critical' && i.priority !== 'High')).slice(0, 5);
  const projects = data.projects.filter((p) => ['In Progress', 'Delayed', 'Approved'].includes(p.status)).slice(0, 5);
  const today = new Date(); const weekEnd = new Date(today.getTime() + 7 * 86400000);
  const visitsThisWeek = data.visits.filter((v) => v.status === 'Scheduled' && new Date(v.date) <= weekEnd).sort((a, b) => a.date.localeCompare(b.date));
  const followUpsDue = data.issues.filter((i) => i.followUpDate && new Date(i.followUpDate) <= weekEnd && statusIdx(i.status) < 6).length;
  const reviewsDue = data.projects.filter((p) => new Date(p.nextReviewDate) <= weekEnd).length;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-forest-800 bg-gradient-to-br from-forest-800 via-forest-700 to-forest-900 px-5 py-6 text-white shadow-card sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-saffron-400/10 blur-2xl" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-forest-200">{CONSTITUENCY_FULL}</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-[32px] sm:leading-tight">One Constituency. Every Village.<br className="hidden sm:block" /> Every Issue Accounted For.</h1>
            <p className="mt-2 max-w-xl text-sm text-forest-100">Village problem → Responsible department → Action tracking → Evidence → Verified outcome.</p>
          </div>
          <div className="flex flex-col items-start gap-2 md:items-end">
            <button onClick={onStartDemo} data-testid="start-demo" className="inline-flex h-12 items-center gap-2 rounded-xl bg-saffron-500 px-5 font-semibold text-white shadow-lg shadow-black/10 transition hover:bg-saffron-400"><Play size={18} />Start MLA Demo</button>
            <span className="text-[11px] text-forest-200">Illustrative demo data — not official constituency records.</span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6" data-tour="summary" aria-label="Summary">
        <Stat label="Villages covered" value={m.villages} hint="3 mandals" icon={<MapPinned size={16} />} />
        <Stat label="Issues received" value={m.total} hint="Last ~6 months" icon={<Inbox size={16} />} tone="grey" />
        <Stat label="Awaiting review" value={m.awaitingReview} hint="Submitted + under review" icon={<ClipboardList size={16} />} tone="saffron" />
        <Stat label="Referred to departments" value={m.referred} hint="Department identified" icon={<Send size={16} />} tone="grey" />
        <Stat label="Active dev. projects" value={m.activeProjects} hint="Approved, in progress, delayed" icon={<Hammer size={16} />} tone="grey" />
        <Stat label="Outcomes verified" value={m.verified} hint={`${m.resolved} more resolved, awaiting verification`} icon={<ShieldCheck size={16} />} />
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2" data-tour="village-overview">
          <CardHeader title="Constituency village overview" subtitle="Schematic view — not a geographic map. Signal derived from open issues & project delays." action={<Link to="/villages" className="text-sm font-medium text-forest-700 hover:underline">Village 360° →</Link>} />
          <div className="flex flex-wrap gap-3 px-5 pb-3 text-xs text-stone-600">{Object.values(HEALTH).map((h) => <span key={h.label} className="flex items-center gap-1.5"><span className={cx('h-2.5 w-2.5 rounded-full', h.dot)} />{h.label}</span>)}</div>
          <div className="grid grid-cols-2 gap-2.5 px-5 pb-5 sm:grid-cols-3 lg:grid-cols-4">
            {ready ? data.villages.map((v) => { const h = HEALTH[villageHealth(data, v.id)]; const open = data.issues.filter((i) => i.villageId === v.id && statusIdx(i.status) < 5).length; const proj = data.projects.filter((p) => p.villageId === v.id && ['Approved', 'In Progress', 'Delayed'].includes(p.status)).length; return (
              <button key={v.id} onClick={() => nav(`/villages?id=${v.id}`)} className={cx('rounded-xl p-3 text-left ring-1 transition hover:-translate-y-0.5 hover:shadow-md', h.ring)}>
                <div className="flex items-center gap-1.5"><span className={cx('h-2 w-2 shrink-0 rounded-full', h.dot)} /><span className="truncate text-[13px] font-semibold text-stone-900">{v.name}</span></div>
                <p className="mt-1 text-[11px] text-stone-500">{v.mandal} mandal</p>
                <p className="mt-1.5 text-xs text-stone-700"><b className="tabular-nums">{open}</b> open · <b className="tabular-nums">{proj}</b> works</p>
              </button>); }) : Array.from({ length: 12 }).map((_, k) => <Skeleton key={k} className="h-[84px]" />)}
          </div>
        </Card>

        <Card>
          <CardHeader title="This Week's Field Priorities" subtitle={`${fmtDate(today.toISOString())} – ${fmtDate(weekEnd.toISOString())}`} action={<CalendarDays size={18} className="text-saffron-600" />} />
          <div className="space-y-3 px-5 pb-5">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-cream-100 p-2.5"><p className="text-xl font-semibold tabular-nums">{visitsThisWeek.length}</p><p className="text-[11px] text-stone-500">Visits</p></div>
              <div className="rounded-xl bg-cream-100 p-2.5"><p className="text-xl font-semibold tabular-nums">{followUpsDue}</p><p className="text-[11px] text-stone-500">Follow-ups due</p></div>
              <div className="rounded-xl bg-cream-100 p-2.5"><p className="text-xl font-semibold tabular-nums">{reviewsDue}</p><p className="text-[11px] text-stone-500">Project reviews</p></div>
            </div>
            {visitsThisWeek.length === 0 ? <p className="text-sm text-stone-500">No visits scheduled this week.</p> : visitsThisWeek.slice(0, 4).map((v) => (
              <button key={v.id} onClick={() => nav(`/field?id=${v.id}`)} className="flex w-full items-center gap-3 rounded-xl border border-stone-200 p-3 text-left hover:bg-cream-50">
                <div className="w-12 shrink-0 rounded-lg bg-forest-50 py-1 text-center"><p className="text-[10px] uppercase text-forest-700">{new Date(v.date).toLocaleDateString('en-IN', { weekday: 'short' })}</p><p className="text-sm font-semibold text-forest-800">{new Date(v.date).getDate()}</p></div>
                <div className="min-w-0"><p className="truncate text-sm font-medium">{vn(v.villageId)}</p><p className="truncate text-xs text-stone-500">{v.purpose} · {v.staff}</p></div>
              </button>))}
            <Link to="/field" className="block text-center text-sm font-medium text-forest-700 hover:underline">Open Field Operations</Link>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Issues by category" subtitle="Open vs closed (resolved or verified)" />
          <div className="h-72 px-2 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cat} layout="vertical" margin={{ left: 10, right: 16 }}>
                <CartesianGrid horizontal={false} stroke="#eee" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#78716c' }} />
                <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11.5, fill: '#44403c' }} />
                <Tooltip cursor={{ fill: '#f5f5f4' }} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Open" stackId="a" fill="#e8891c" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Closed" stackId="a" fill="#1f6541" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardHeader title="Resolution vs pending trend" subtitle="Monthly, computed from issue history" />
          <div className="h-72 px-2 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ left: -10, right: 16, top: 6 }}>
                <defs>
                  <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e8891c" stopOpacity={0.25} /><stop offset="1" stopColor="#e8891c" stopOpacity={0} /></linearGradient>
                  <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1f6541" stopOpacity={0.3} /><stop offset="1" stopColor="#1f6541" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#eee" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#78716c' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#78716c' }} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="Pending (open)" stroke="#e8891c" fill="url(#gp)" strokeWidth={2} />
                <Area type="monotone" dataKey="Resolved / verified" stroke="#1f6541" fill="url(#gr)" strokeWidth={2} />
                <Area type="monotone" dataKey="Received" stroke="#a8a29e" fill="transparent" strokeDasharray="4 3" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader title="Urgent — needs staff review" subtitle="Submitted / under review, highest priority first" action={<AlertTriangle size={18} className="text-red-500" />} />
          <ul className="divide-y divide-stone-100 px-2 pb-3">{urgent.length === 0 ? <li className="p-4 text-sm text-stone-500">Nothing awaiting review.</li> : urgent.map((i) => (
            <li key={i.id}><button onClick={() => nav(`/issues?id=${i.id}`)} className="w-full rounded-xl px-3 py-3 text-left hover:bg-cream-50">
              <div className="flex items-center justify-between gap-2"><span className="text-xs font-medium text-stone-500">{i.id}</span><PriorityBadge p={i.priority} /></div>
              <p className="mt-1 text-sm font-medium text-stone-900">{i.title}</p><p className="text-xs text-stone-500">{vn(i.villageId)} · {ago(i.submittedAt)} · <StatusBadge s={i.status} /></p>
            </button></li>))}</ul>
        </Card>
        <Card>
          <CardHeader title="Development projects" subtitle="Active works and progress" action={<Link to="/projects" className="text-sm font-medium text-forest-700 hover:underline">Tracker →</Link>} />
          <ul className="space-y-3 px-5 pb-5">{projects.map((p) => (
            <li key={p.id}><button onClick={() => nav(`/projects?id=${p.id}`)} className="w-full text-left">
              <div className="flex items-start justify-between gap-2"><p className="text-sm font-medium text-stone-900">{p.title}</p><ProjectBadge s={p.status} /></div>
              <p className="mb-1.5 text-xs text-stone-500">{vn(p.villageId)} · {p.agency}</p>
              <div className="flex items-center gap-2"><Progress value={p.progress} tone={p.status === 'Delayed' ? 'red' : 'green'} /><span className="w-9 text-right text-xs tabular-nums text-stone-600">{p.progress}%</span></div>
            </button></li>))}</ul>
        </Card>
        <Card>
          <CardHeader title="Recent activity" subtitle="Latest actions across modules" />
          <ul className="space-y-1 px-2 pb-3">{data.activity.slice(0, 7).map((a) => (
            <li key={a.id}><button onClick={() => nav(a.link)} className="flex w-full gap-3 rounded-xl px-3 py-2 text-left hover:bg-cream-50">
              <span className={cx('mt-1.5 h-2 w-2 shrink-0 rounded-full', a.kind === 'issue' ? 'bg-saffron-500' : a.kind === 'project' ? 'bg-forest-600' : 'bg-stone-400')} />
              <span><span className="block text-sm text-stone-800">{a.text}</span><span className="text-[11px] text-stone-500">{ago(a.at)}</span></span>
            </button></li>))}</ul>
        </Card>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2"><DemoNote /><span className="flex items-center gap-1.5 text-xs text-stone-500"><CheckCircle2 size={14} className="text-forest-600" />All figures computed from the same seeded demo dataset.</span></div>
    </div>
  );
}
