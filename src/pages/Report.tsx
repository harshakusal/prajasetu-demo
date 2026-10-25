import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CheckCircle2, Eye, Printer, ShieldCheck, X } from 'lucide-react';
import { useData, reachedAt, statusIdx } from '../data/store';
import { PROJECT_STATUSES, IssueStatus, DemoData } from '../data/types';
import { CONSTITUENCY_FULL } from '../data/seed';
import { Button, Card, CardHeader, PageHeader, Select, fmtDate } from '../components/ui';

const PERIODS = [{ value: '30', label: 'Last 30 days' }, { value: '90', label: 'Last 90 days' }, { value: '180', label: 'Last 6 months' }, { value: 'all', label: 'All recorded data' }];
const COLORS = ['#a8a29e', '#7c9cc0', '#8b7fc7', '#2f9488', '#dc5b4a', '#e8891c', '#1f6541'];

function compute(data: DemoData, period: string) {
  const from = period === 'all' ? new Date(0) : new Date(Date.now() - +period * 86400000);
  const inP = (s: string | null) => !!s && new Date(s) >= from;
  const reached = (s: IssueStatus) => data.issues.filter((i) => inP(reachedAt(i, s))).length;
  const counts = [
    { k: 'Received', v: data.issues.filter((i) => inP(i.submittedAt)).length, d: 'New issues recorded' },
    { k: 'Reviewed', v: reached('Under Review'), d: 'Checked by staff' },
    { k: 'Referred', v: reached('Referred'), d: 'Sent to responsible department' },
    { k: 'In progress', v: reached('In Progress'), d: 'Work or inspection started' },
    { k: 'Marked resolved', v: reached('Resolved'), d: 'Reported complete' },
    { k: 'Independently verified', v: reached('Verified'), d: 'Confirmed with evidence' },
  ];
  const stages = PROJECT_STATUSES.map((s) => ({ s, n: data.projects.filter((p) => p.status === s).length }));
  const verifiedActions = [
    ...data.issues.filter((i) => i.status === 'Verified' && inP(reachedAt(i, 'Verified'))).map((i) => ({ at: reachedAt(i, 'Verified')!, text: `${i.title}`, where: data.villages.find((v) => v.id === i.villageId)?.name ?? '', kind: 'Issue', ev: i.evidence[i.evidence.length - 1]?.label ?? '' })),
    ...data.projects.filter((p) => p.status === 'Completion Verified').map((p) => ({ at: p.updates[0]?.at ?? '', text: p.title, where: data.villages.find((v) => v.id === p.villageId)?.name ?? '', kind: 'Project', ev: p.evidence[p.evidence.length - 1]?.label ?? '' })),
  ].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 8);
  const villages = data.villages.map((v) => { const iss = data.issues.filter((i) => i.villageId === v.id && inP(i.submittedAt)); return { name: v.name, received: iss.length, open: iss.filter((i) => statusIdx(i.status) < 5).length, resolved: iss.filter((i) => i.status === 'Resolved').length, verified: iss.filter((i) => i.status === 'Verified').length, projects: data.projects.filter((p) => p.villageId === v.id).length }; }).filter((v) => v.received || v.projects);
  return { counts, stages, verifiedActions, villages, from };
}

export default function Report() {
  const { data } = useData();
  const [period, setPeriod] = useState('180'); const [preview, setPreview] = useState(false);
  const r = useMemo(() => compute(data, period), [data, period]);
  const label = PERIODS.find((p) => p.value === period)!.label;
  return (
    <div>
      <PageHeader title="Public Impact Report" subtitle="A transparent, shareable summary of issues and development work — computed from records for the selected period." actions={<><Select label="Report period" value={period} onChange={setPeriod} options={PERIODS} className="w-48" data-testid="period" /><Button variant="primary" onClick={() => setPreview(true)} data-tour="report-preview" data-testid="preview-report"><Eye size={17} />Preview printable report</Button></>} />
      <p className="mb-4 inline-block rounded-lg bg-saffron-50 px-3 py-1.5 text-xs font-medium text-saffron-700 ring-1 ring-saffron-200">Illustrative demo data — not official constituency records. Not actual public achievements.</p>
      <ReportBody r={r} label={label} />
      {preview && createPortal(
        <div className="print-root fixed inset-0 z-[55] overflow-y-auto bg-stone-200/80 p-0 sm:p-6" data-testid="print-preview">
          <div className="no-print sticky top-0 z-10 mx-auto mb-3 flex max-w-4xl items-center justify-between gap-2 rounded-b-2xl bg-white/95 px-4 py-3 shadow sm:rounded-2xl"><p className="text-sm font-medium">Print preview · {label}</p><div className="flex gap-2"><Button size="sm" variant="primary" onClick={() => window.print()} data-testid="print-btn"><Printer size={16} />Print / Save PDF</Button><Button size="sm" onClick={() => setPreview(false)} aria-label="Close preview"><X size={16} />Close</Button></div></div>
          <div className="mx-auto max-w-4xl bg-white p-6 shadow-xl sm:rounded-2xl sm:p-10">
            <div className="mb-6 border-b-2 border-forest-700 pb-4"><p className="text-xs font-semibold uppercase tracking-widest text-forest-700">PrajaSetu · Public Impact Report</p><h1 className="mt-1 text-2xl font-semibold">{CONSTITUENCY_FULL}</h1><p className="text-sm text-stone-600">Period: {label} ({fmtDate(r.from.getTime() === 0 ? data.issues[data.issues.length - 1]?.submittedAt ?? '' : r.from.toISOString())} – {fmtDate(new Date().toISOString())}) · Generated {fmtDate(new Date().toISOString())}</p>
              <p className="mt-2 rounded bg-saffron-50 px-2 py-1 text-xs font-semibold text-saffron-700">Illustrative demo data — not official constituency records. Figures are sample data, not actual public achievements.</p></div>
            <ReportBody r={r} label={label} print />
          </div>
        </div>, document.body)}
    </div>
  );
}

function ReportBody({ r, label, print }: { r: ReturnType<typeof compute>; label: string; print?: boolean }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">{r.counts.map((c, k) => (
        <Card key={c.k} className={'print-break p-4 ' + (k === 5 ? 'border-forest-300 bg-forest-50' : k === 4 ? 'border-saffron-200 bg-saffron-50/50' : '')}><p className="text-xs font-medium text-stone-600">{c.k}</p><p className="mt-1 text-3xl font-semibold tabular-nums" data-testid={`report-${k}`}>{c.v}</p><p className="mt-0.5 text-[11px] text-stone-500">{c.d}</p></Card>))}</div>
      <p className="text-xs text-stone-500">Counts show issues that reached each stage during: {label}. An issue can count in several stages.</p>
      <div className="print-break grid gap-4 rounded-2xl border border-forest-200 bg-white p-5 md:grid-cols-2" data-tour="resolved-vs-verified">
        <div className="flex gap-3"><CheckCircle2 className="mt-0.5 shrink-0 text-saffron-600" /><div><p className="font-semibold">Resolved ≠ Verified</p><p className="mt-1 text-sm text-stone-700"><b>Resolved</b> means the responsible department or staff reported the action complete. It is a claim, not yet a confirmed outcome.</p></div></div>
        <div className="flex gap-3"><ShieldCheck className="mt-0.5 shrink-0 text-forest-700" /><div><p className="font-semibold">Independently verified</p><p className="mt-1 text-sm text-stone-700"><b>Verified</b> requires a separate check — a field visit, resident confirmation and evidence recorded after resolution. Only verified outcomes should be presented as results.</p></div></div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="print-break"><CardHeader title="Development projects by stage" subtitle="Current stage of every project in the ledger" />
          <div className="h-64 px-2 pb-4">{print ? <StageBars stages={r.stages} /> : <ResponsiveContainer width="100%" height="100%"><BarChart data={r.stages} margin={{ left: -16, right: 10, bottom: 30 }}><CartesianGrid vertical={false} stroke="#eee" /><XAxis dataKey="s" tick={{ fontSize: 10, fill: '#57534e' }} interval={0} angle={-25} textAnchor="end" /><YAxis allowDecimals={false} tick={{ fontSize: 11 }} /><Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} /><Bar dataKey="n" name="Projects" radius={[6, 6, 0, 0]}>{r.stages.map((_, k) => <Cell key={k} fill={COLORS[k]} />)}</Bar></BarChart></ResponsiveContainer>}</div>
          <p className="px-5 pb-4 text-xs text-stone-500">Proposed and awaiting-approval works are not approved or funded.</p></Card>
        <Card className="print-break"><CardHeader title="Recent verified actions" subtitle="Only independently verified items are listed" />
          <ul className="space-y-2 px-5 pb-5">{r.verifiedActions.length === 0 ? <li className="text-sm text-stone-500">No verified outcomes in this period.</li> : r.verifiedActions.map((a, k) => <li key={k} className="flex gap-3 rounded-xl border border-stone-200 p-3"><ShieldCheck size={18} className="mt-0.5 shrink-0 text-forest-700" /><div className="text-sm"><p className="font-medium">{a.text}</p><p className="text-xs text-stone-500">{a.kind} · {a.where} · {fmtDate(a.at)}{a.ev && ` · Evidence: ${a.ev}`}</p></div></li>)}</ul></Card>
      </div>
      <Card className="print-break overflow-hidden"><CardHeader title="Village-wise summary" subtitle={`Issues received during ${label.toLowerCase()} and their current state`} />
        <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-sm"><thead className="bg-cream-100 text-left text-xs uppercase tracking-wide text-stone-500"><tr><th className="px-5 py-2.5">Village</th><th className="px-3 py-2.5 text-right">Received</th><th className="px-3 py-2.5 text-right">Open</th><th className="px-3 py-2.5 text-right">Resolved</th><th className="px-3 py-2.5 text-right">Verified</th><th className="px-5 py-2.5 text-right">Projects</th></tr></thead>
          <tbody className="divide-y divide-stone-100">{r.villages.map((v) => <tr key={v.name}><td className="px-5 py-2.5 font-medium">{v.name}</td><td className="px-3 py-2.5 text-right tabular-nums">{v.received}</td><td className="px-3 py-2.5 text-right tabular-nums">{v.open}</td><td className="px-3 py-2.5 text-right tabular-nums">{v.resolved}</td><td className="px-3 py-2.5 text-right tabular-nums text-forest-700">{v.verified}</td><td className="px-5 py-2.5 text-right tabular-nums">{v.projects}</td></tr>)}</tbody></table></div></Card>
      <p className="text-center text-xs text-stone-500">Illustrative demo data — not official constituency records. Prepared with PrajaSetu (demo). Not affiliated with or approved by any government body.</p>
    </div>
  );
}
function StageBars({ stages }: { stages: { s: string; n: number }[] }) {
  const max = Math.max(1, ...stages.map((x) => x.n));
  return <div className="space-y-2 px-3">{stages.map((x, k) => <div key={x.s} className="flex items-center gap-2 text-xs"><span className="w-36 shrink-0">{x.s}</span><div className="h-4 flex-1 rounded bg-stone-100"><div className="h-4 rounded" style={{ width: `${(x.n / max) * 100}%`, background: COLORS[k], printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }} /></div><span className="w-5 text-right tabular-nums">{x.n}</span></div>)}</div>;
}
