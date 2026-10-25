import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Users, Home, Search, Clock, Star } from 'lucide-react';
import { useData, statusIdx, villageHealth } from '../data/store';
import { INDICATORS, ISSUE_CATEGORIES, Level, PRIORITIES, PROJECT_STATUSES } from '../data/types';
import { Badge, Card, Drawer, EmptyState, PageHeader, PriorityBadge, Progress, ProjectBadge, Select, StatusBadge, cx, fmtDate, fmtDateTime, inputCls, DemoNote } from '../components/ui';
import { HEALTH } from './CommandCentre';

const LV: Record<Level, string> = { Good: 'bg-forest-500', Fair: 'bg-saffron-400', Poor: 'bg-red-500' };
export default function Villages() {
  const { data } = useData(); const [sp, setSp] = useSearchParams();
  const [q, setQ] = useState(''); const [sev, setSev] = useState('All'); const [cat, setCat] = useState('All'); const [vil, setVil] = useState('All'); const [ps, setPs] = useState('All');
  const list = useMemo(() => data.villages.filter((v) => {
    if (q && !(v.name + ' ' + v.mandal).toLowerCase().includes(q.toLowerCase())) return false;
    if (vil !== 'All' && v.id !== vil) return false;
    const open = data.issues.filter((i) => i.villageId === v.id && statusIdx(i.status) < 5);
    if (sev !== 'All' && !open.some((i) => i.priority === sev)) return false;
    if (cat !== 'All' && !open.some((i) => i.category === cat)) return false;
    if (ps !== 'All' && !data.projects.some((p) => p.villageId === v.id && p.status === ps)) return false;
    return true;
  }), [data, q, sev, cat, vil, ps]);
  const active = data.villages.find((v) => v.id === sp.get('id'));
  const clear = () => { setQ(''); setSev('All'); setCat('All'); setVil('All'); setPs('All'); };
  return (
    <div>
      <PageHeader title="Village 360°" subtitle="Understand every village — facilities, service indicators, open issues, works and field visits in one profile. Schematic view; not a geographic map." />
      <Card className="mb-4 grid gap-2.5 p-3 sm:grid-cols-2 sm:p-4 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
        <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search village or mandal…" aria-label="Search villages" className={cx(inputCls, 'h-11 pl-9')} /></div>
        <Select label="Issue severity" value={sev} onChange={setSev} options={[{ value: 'All', label: 'Any severity' }, ...PRIORITIES.map((p) => ({ value: p, label: `Has ${p} open issue` }))]} />
        <Select label="Issue category" value={cat} onChange={setCat} options={[{ value: 'All', label: 'Any category' }, ...ISSUE_CATEGORIES]} />
        <Select label="Village" value={vil} onChange={setVil} options={[{ value: 'All', label: 'All villages' }, ...data.villages.map((v) => ({ value: v.id, label: v.name }))]} />
        <Select label="Project status" value={ps} onChange={setPs} options={[{ value: 'All', label: 'Any project status' }, ...PROJECT_STATUSES]} />
      </Card>
      <p className="mb-3 text-sm text-stone-600">{list.length} of {data.villages.length} villages</p>
      {list.length === 0 ? <EmptyState title="No villages match these filters" action={<button onClick={clear} className="text-sm font-medium text-forest-700 underline">Clear filters</button>} /> : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{list.map((v) => { const h = HEALTH[villageHealth(data, v.id)]; const open = data.issues.filter((i) => i.villageId === v.id && statusIdx(i.status) < 5); return (
          <button key={v.id} onClick={() => setSp({ id: v.id })} data-testid="village-card" className="rounded-2xl border border-stone-200 bg-white p-5 text-left shadow-card transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-2"><div><h3 className="font-semibold text-stone-900">{v.name}</h3><p className="text-xs text-stone-500">{v.mandal} mandal · pop. ~{v.population.toLocaleString('en-IN')}</p></div><span className={cx('flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1', h.ring)}><span className={cx('h-2 w-2 rounded-full', h.dot)} />{h.label}</span></div>
            <div className="mt-4 flex gap-1" aria-label="Service indicators">{INDICATORS.map((k) => <span key={k} title={`${k}: ${v.indicators[k]}`} className="flex-1"><span className={cx('block h-1.5 rounded-full', LV[v.indicators[k]])} /><span className="mt-1 block truncate text-center text-[9.5px] text-stone-500">{k.slice(0, 5)}</span></span>)}</div>
            <p className="mt-3 text-sm text-stone-700"><b>{open.length}</b> open issues · <b>{data.projects.filter((p) => p.villageId === v.id).length}</b> projects</p>
          </button>); })}</div>)}
      <DemoNote className="mt-4" />
      {active && <VillagePanel id={active.id} onClose={() => setSp({})} />}
    </div>
  );
}

function VillagePanel({ id, onClose }: { id: string; onClose: () => void }) {
  const { data } = useData(); const nav = useNavigate();
  const v = data.villages.find((x) => x.id === id)!;
  const issues = data.issues.filter((i) => i.villageId === id);
  const open = issues.filter((i) => statusIdx(i.status) < 5);
  const byCat = ISSUE_CATEGORIES.map((c) => ({ c, n: open.filter((i) => i.category === c).length })).filter((x) => x.n);
  const projects = data.projects.filter((p) => p.villageId === id);
  const visits = data.visits.filter((x) => x.villageId === id).sort((a, b) => b.date.localeCompare(a.date));
  return (
    <Drawer open onClose={onClose} title={v.name} subtitle={`${v.mandal} mandal · Village profile`} wide>
      <div className="space-y-6" data-testid="village-panel">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-cream-100 p-3"><Users size={16} className="text-forest-700" /><p className="mt-1 text-lg font-semibold">~{v.population.toLocaleString('en-IN')}</p><p className="text-[11px] text-stone-500">Population (illustrative)</p></div>
          <div className="rounded-xl bg-cream-100 p-3"><Home size={16} className="text-forest-700" /><p className="mt-1 text-lg font-semibold">~{v.households.toLocaleString('en-IN')}</p><p className="text-[11px] text-stone-500">Households</p></div>
          <div className="rounded-xl bg-cream-100 p-3"><p className="text-lg font-semibold">{open.length}</p><p className="text-[11px] text-stone-500">Open issues</p></div>
          <div className="rounded-xl bg-cream-100 p-3"><p className="text-lg font-semibold">{issues.filter((i) => i.status === 'Verified').length}</p><p className="text-[11px] text-stone-500">Verified outcomes</p></div>
        </div>
        <section><h4 className="mb-2 text-sm font-semibold">Service indicators</h4><div className="grid gap-2 sm:grid-cols-2">{INDICATORS.map((k) => <div key={k} className="flex items-center justify-between rounded-xl border border-stone-200 px-3 py-2.5"><span className="text-sm">{k}</span><Badge tone={v.indicators[k] === 'Good' ? 'green' : v.indicators[k] === 'Fair' ? 'amber' : 'red'}>{v.indicators[k]}</Badge></div>)}</div><p className="mt-1.5 text-[11px] text-stone-500">Indicator levels are illustrative staff assessments, not official survey data.</p></section>
        <section><h4 className="mb-2 text-sm font-semibold">Public facilities</h4><div className="flex flex-wrap gap-1.5">{v.facilities.map((f) => <Badge key={f}>{f}</Badge>)}</div></section>
        <section><h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold"><Star size={15} className="text-saffron-500" />Local priorities</h4><ol className="list-decimal space-y-1 pl-5 text-sm text-stone-700">{v.priorities.map((p) => <li key={p}>{p}</li>)}</ol></section>
        <section><h4 className="mb-2 text-sm font-semibold">Open issues by category</h4>
          {byCat.length === 0 ? <p className="text-sm text-stone-500">No open issues.</p> : <div className="space-y-2">{byCat.map(({ c, n }) => <div key={c} className="flex items-center gap-3"><span className="w-40 shrink-0 text-sm">{c}</span><Progress value={(n / open.length) * 100} tone="saffron" /><span className="w-6 text-right text-sm tabular-nums">{n}</span></div>)}</div>}
          <ul className="mt-3 divide-y divide-stone-100 rounded-xl border border-stone-200">{open.map((i) => <li key={i.id}><button onClick={() => nav(`/issues?id=${i.id}`)} className="flex w-full flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-left hover:bg-cream-50"><span className="text-sm"><span className="text-xs text-stone-500">{i.id}</span> {i.title}</span><span className="flex gap-1.5"><PriorityBadge p={i.priority} /><StatusBadge s={i.status} /></span></button></li>)}</ul>
        </section>
        <section><h4 className="mb-2 text-sm font-semibold">Development projects</h4>{projects.length === 0 ? <p className="text-sm text-stone-500">No projects recorded.</p> : <ul className="space-y-2">{projects.map((p) => <li key={p.id}><button onClick={() => nav(`/projects?id=${p.id}`)} className="w-full rounded-xl border border-stone-200 p-3 text-left hover:bg-cream-50"><div className="flex justify-between gap-2"><span className="text-sm font-medium">{p.title}</span><ProjectBadge s={p.status} /></div><div className="mt-2"><Progress value={p.progress} tone={p.status === 'Delayed' ? 'red' : 'green'} /></div></button></li>)}</ul>}</section>
        <section><h4 className="mb-2 text-sm font-semibold">Recent field visits</h4>{visits.length === 0 ? <p className="text-sm text-stone-500">No field visits recorded yet.</p> : <ul className="space-y-2">{visits.map((x) => <li key={x.id}><button onClick={() => nav(`/field?id=${x.id}`)} className="flex w-full justify-between gap-2 rounded-xl border border-stone-200 p-3 text-left text-sm hover:bg-cream-50"><span>{fmtDate(x.date)} · {x.purpose}<span className="block text-xs text-stone-500">{x.staff}</span></span><Badge tone={x.status === 'Completed' ? 'green' : 'blue'}>{x.status}</Badge></button></li>)}</ul>}</section>
        <p className="flex items-center gap-1.5 text-xs text-stone-500"><Clock size={13} />Last updated {fmtDateTime(v.lastUpdated)} · Illustrative demo data — not official constituency records.</p>
      </div>
    </Drawer>
  );
}
