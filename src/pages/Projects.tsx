import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertTriangle, Building, CalendarClock, Camera, Check, Flag, Pencil, Plus, Search, Wallet } from 'lucide-react';
import { useData } from '../data/store';
import { DEPARTMENTS } from '../data/seed';
import { PROJECT_STATUSES, Project, ProjectStatus } from '../data/types';
import { Button, Card, Drawer, EmptyState, EvidenceList, Field, Modal, PageHeader, Progress, ProjectBadge, Select, cx, fmtDate, fmtDateTime, inputCls, DemoNote } from '../components/ui';

const PRE: ProjectStatus[] = ['Proposed', 'Awaiting Approval'];
export const budgetText = (p: Project) => (PRE.includes(p.status) || p.budgetLakh == null ? 'Not approved / not funded' : `₹${p.budgetLakh.toFixed(1)} lakh (illustrative)`);

export default function Projects() {
  const { data } = useData();
  const [sp, setSp] = useSearchParams();
  const [q, setQ] = useState(''); const [st, setSt] = useState('All'); const [form, setForm] = useState<{ open: boolean; p?: Project }>({ open: false });
  const vn = (id: string) => data.villages.find((v) => v.id === id)?.name ?? '';
  const list = useMemo(() => data.projects.filter((p) => (st === 'All' || p.status === st) && (!q || [p.title, vn(p.villageId), p.agency, p.category, p.id].join(' ').toLowerCase().includes(q.toLowerCase()))), [data, q, st]); // eslint-disable-line
  const active = data.projects.find((p) => p.id === sp.get('id'));
  const open = (id: string | null) => { const n = new URLSearchParams(sp); id ? n.set('id', id) : n.delete('id'); setSp(n); };
  return (
    <div>
      <PageHeader title="Development Tracker" subtitle="Every project has a timeline, a responsible party, latest evidence and a next action. Proposed works are never shown as approved or funded." actions={<Button variant="primary" onClick={() => setForm({ open: true })}><Plus size={18} />Add project</Button>} />
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">{PROJECT_STATUSES.map((s) => { const n = data.projects.filter((p) => p.status === s).length; return (
        <button key={s} onClick={() => setSt(st === s ? 'All' : s)} className={cx('min-w-[120px] flex-1 rounded-xl border px-3 py-2.5 text-left', st === s ? 'border-forest-600 bg-forest-50 ring-1 ring-forest-600' : 'border-stone-200 bg-white hover:border-stone-300')}><p className="text-[11px] text-stone-500">{s}</p><p className="text-xl font-semibold tabular-nums">{n}</p></button>); })}</div>
      <Card className="mb-4 grid gap-2.5 p-3 sm:grid-cols-[1fr_220px_auto] sm:p-4">
        <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search project, village, agency…" aria-label="Search projects" className={cx(inputCls, 'h-11 pl-9')} /></div>
        <Select label="Filter by project status" value={st} onChange={setSt} options={[{ value: 'All', label: 'All stages' }, ...PROJECT_STATUSES]} />
        <Button variant="ghost" disabled={!q && st === 'All'} onClick={() => { setQ(''); setSt('All'); }}>Clear</Button>
      </Card>
      {list.length === 0 ? <EmptyState title="No projects match" hint="Clear the filters to see the full ledger." /> : (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">{list.map((p) => { const last = p.evidence[p.evidence.length - 1]; const pre = PRE.includes(p.status); return (
          <Card key={p.id} className="flex flex-col p-5 transition hover:shadow-md" data-testid="project-card">
            <div className="flex items-start justify-between gap-2"><div><p className="text-xs text-stone-500">{p.id} · {vn(p.villageId)} · {p.category}</p><h3 className="mt-1 font-semibold text-stone-900">{p.title}</h3></div><ProjectBadge s={p.status} /></div>
            <div className="mt-3 flex items-center gap-2"><Progress value={p.progress} tone={p.status === 'Delayed' ? 'red' : pre ? 'grey' : 'green'} /><span className="w-9 text-right text-xs tabular-nums">{p.progress}%</span></div>
            <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2.5 text-xs">
              <div><dt className="flex items-center gap-1 text-stone-500"><CalendarClock size={13} />Timeline</dt><dd className="font-medium text-stone-800">{pre ? 'Not scheduled' : `${fmtDate(p.startDate)} → ${fmtDate(p.expectedCompletion)}`}</dd></div>
              <div><dt className="flex items-center gap-1 text-stone-500"><Building size={13} />Responsible</dt><dd className="font-medium text-stone-800">{p.agency}</dd></div>
              <div><dt className="flex items-center gap-1 text-stone-500"><Camera size={13} />Latest evidence</dt><dd className="font-medium text-stone-800">{last ? last.label : 'None yet'}</dd></div>
              <div><dt className="flex items-center gap-1 text-stone-500"><Flag size={13} />Next action</dt><dd className="font-medium text-stone-800">{p.nextAction}</dd></div>
              <div className="col-span-2"><dt className="flex items-center gap-1 text-stone-500"><Wallet size={13} />Budget</dt><dd className={cx('font-medium', pre ? 'text-stone-500' : 'text-stone-800')}>{budgetText(p)}</dd></div>
            </dl>
            {p.status === 'Delayed' && <p className="mt-3 flex gap-1.5 rounded-lg bg-red-50 p-2 text-xs text-red-800"><AlertTriangle size={14} className="mt-0.5 shrink-0" />{p.delayReason}</p>}
            <div className="mt-auto flex items-center justify-between pt-4"><span className="text-xs text-stone-500">Next review {fmtDate(p.nextReviewDate)}</span><Button size="sm" onClick={() => open(p.id)}>Open project</Button></div>
          </Card>); })}</div>)}
      <DemoNote className="mt-4" />
      {active && <ProjectPanel p={active} onClose={() => open(null)} onEdit={() => setForm({ open: true, p: active })} />}
      {form.open && <ProjectForm p={form.p} onClose={() => setForm({ open: false })} onSaved={(id) => { setForm({ open: false }); open(id); }} />}
    </div>
  );
}

function ProjectPanel({ p, onClose, onEdit }: { p: Project; onClose: () => void; onEdit: () => void }) {
  const { data, updateProject, addProjectEvidence, toast } = useData();
  const [prog, setProg] = useState(p.progress); const [upd, setUpd] = useState('');
  const [ms, setMs] = useState(''); const [msDue, setMsDue] = useState('');
  const [delay, setDelay] = useState(p.delayReason);
  const [evL, setEvL] = useState(''); const [evD, setEvD] = useState('');
  const pre = PRE.includes(p.status);
  return (
    <Drawer open onClose={onClose} wide subtitle={`${p.id} · ${data.villages.find((v) => v.id === p.villageId)?.name} · ${p.category}`} title={p.title}
      footer={<div className="flex items-center justify-between gap-2"><span className="text-xs text-stone-500">Illustrative demo data — not official records.</span><Button size="sm" onClick={onEdit}><Pencil size={15} />Edit project</Button></div>}>
      <div className="space-y-6" data-testid="project-panel">
        <div className="grid gap-3 sm:grid-cols-4">
          {[['Stage', <ProjectBadge s={p.status} />], ['Responsible', p.agency], ['Budget', budgetText(p)], ['Next review', fmtDate(p.nextReviewDate)]].map(([k, v], n) => <div key={n} className="rounded-xl bg-cream-100 p-3"><p className="text-[11px] text-stone-500">{k}</p><div className="mt-1 text-sm font-medium">{v}</div></div>)}
        </div>
        {pre && <p className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-sm text-stone-700">This project is <b>{p.status.toLowerCase()}</b>. It is not approved or funded; no budget is shown.</p>}
        <section data-tour="project-milestones" className="rounded-2xl border border-stone-200 p-4">
          <h4 className="mb-3 text-sm font-semibold">Milestones & timeline</h4>
          <ol className="space-y-2">{p.milestones.map((m) => (
            <li key={m.id}><label className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl px-2 hover:bg-cream-50">
              <input type="checkbox" className="h-5 w-5 accent-forest-700" checked={m.done} onChange={() => { updateProject(p.id, { milestones: p.milestones.map((x) => (x.id === m.id ? { ...x, done: !x.done } : x)) }, `Milestone "${m.title}" marked ${m.done ? 'pending' : 'complete'}`); toast('Milestone updated'); }} />
              <span className={cx('flex-1 text-sm', m.done && 'text-stone-500 line-through')}>{m.title}</span><span className="text-xs text-stone-500">{fmtDate(m.due)}</span>
            </label></li>))}</ol>
          <form className="mt-3 flex flex-col gap-2 sm:flex-row" onSubmit={(e) => { e.preventDefault(); if (!ms.trim()) return; updateProject(p.id, { milestones: [...p.milestones, { id: 'm' + Date.now(), title: ms.trim(), due: msDue, done: false }] }, `Milestone added: ${ms.trim()}`); setMs(''); setMsDue(''); toast('Milestone added'); }}>
            <input className={inputCls} placeholder="New milestone" value={ms} onChange={(e) => setMs(e.target.value)} aria-label="New milestone" /><input type="date" className={cx(inputCls, 'sm:w-44')} value={msDue} onChange={(e) => setMsDue(e.target.value)} aria-label="Milestone due date" /><Button type="submit" disabled={!ms.trim()}>Add</Button>
          </form>
          {p.status === 'Delayed' && <p className="mt-3 flex gap-1.5 rounded-lg bg-red-50 p-2.5 text-sm text-red-800"><AlertTriangle size={16} className="mt-0.5 shrink-0" /><span><b>Delay reason:</b> {p.delayReason}</span></p>}
        </section>
        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-stone-200 p-4">
            <h4 className="mb-2 text-sm font-semibold">Update progress</h4>
            <div className="flex items-center gap-3"><input type="range" min={0} max={100} step={5} value={prog} onChange={(e) => setProg(+e.target.value)} className="flex-1 accent-forest-700" aria-label="Progress percent" disabled={pre} /><span className="w-12 text-right text-sm font-semibold tabular-nums">{prog}%</span></div>
            <textarea className={cx(inputCls, 'mt-2 min-h-[64px]')} placeholder="Progress note, e.g. Pipeline laid up to ward 3" value={upd} onChange={(e) => setUpd(e.target.value)} aria-label="Progress note" />
            <Button className="mt-2" size="sm" variant="primary" data-testid="save-progress" onClick={() => { if (pre && prog !== p.progress) { toast('Progress cannot be recorded before approval', 'error'); return; } const st: ProjectStatus = prog === 100 && ['In Progress', 'Delayed', 'Approved'].includes(p.status) ? 'Completed' : prog > 0 && p.status === 'Approved' ? 'In Progress' : p.status; updateProject(p.id, { progress: prog, status: st }, upd.trim() || `Progress updated to ${prog}%`); setUpd(''); toast(`Progress saved (${prog}%)`); }}>Save progress</Button>
          </div>
          <div className="rounded-2xl border border-stone-200 p-4">
            <h4 className="mb-2 text-sm font-semibold">Record delay</h4>
            <textarea className={cx(inputCls, 'min-h-[64px]')} placeholder="Reason for delay" value={delay} onChange={(e) => setDelay(e.target.value)} aria-label="Delay reason" />
            <div className="mt-2 flex flex-wrap gap-2">
              <Button size="sm" variant="danger" disabled={!delay.trim() || pre} onClick={() => { updateProject(p.id, { status: 'Delayed', delayReason: delay.trim() }, `Delay recorded: ${delay.trim()}`); toast('Delay recorded'); }}>Mark delayed</Button>
              {p.status === 'Delayed' && <Button size="sm" onClick={() => { updateProject(p.id, { status: 'In Progress', delayReason: '' }, 'Work resumed — delay cleared'); setDelay(''); toast('Delay cleared, back to In Progress'); }}>Clear delay</Button>}
            </div>
          </div>
        </section>
        <section>
          <h4 className="mb-2 text-sm font-semibold">Change stage</h4>
          <div className="flex flex-wrap gap-2">{PROJECT_STATUSES.map((s) => <Button key={s} size="sm" variant={s === p.status ? 'primary' : 'secondary'} onClick={() => {
            if (s === p.status) return;
            if (s === 'Completion Verified' && p.status !== 'Completed') { toast('Only Completed projects can be marked Completion Verified', 'error'); return; }
            if (s === 'Completion Verified' && !p.evidence.some((e) => e.kind === 'Inspection note' || e.label.toLowerCase().includes('completion'))) { toast('Attach a completion inspection evidence placeholder before verifying', 'error'); return; }
            if (!PRE.includes(s) && PRE.includes(p.status) && s !== 'Approved') { toast('Record approval first (move to Approved)', 'error'); return; }
            if (s === 'Approved' && PRE.includes(p.status) && p.budgetLakh == null) { setTimeout(onEdit, 0); toast('Enter the approved (illustrative) budget and dates', 'info'); return; }
            updateProject(p.id, { status: s, budgetLakh: PRE.includes(s) ? null : p.budgetLakh }, `Stage changed to ${s}`); toast(`Stage changed to ${s}`);
          }}>{s === p.status && <Check size={14} />}{s}</Button>)}</div>
        </section>
        <section>
          <h4 className="mb-2 text-sm font-semibold">Evidence</h4>
          <form className="mb-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]" onSubmit={(e) => { e.preventDefault(); if (!evL.trim()) return; addProjectEvidence(p.id, { label: evL.trim(), description: evD.trim() || 'Placeholder — no file stored in demo', kind: /inspection|completion/i.test(evL) ? 'Inspection note' : /order|document|bill/i.test(evL) ? 'Document' : 'Photo' }); setEvL(''); setEvD(''); toast('Evidence placeholder attached'); }}>
            <input className={inputCls} placeholder="e.g. Completion inspection note" value={evL} onChange={(e) => setEvL(e.target.value)} aria-label="Evidence title" />
            <input className={inputCls} placeholder="Description" value={evD} onChange={(e) => setEvD(e.target.value)} aria-label="Evidence description" />
            <Button type="submit" disabled={!evL.trim()}><Camera size={16} />Attach</Button>
          </form>
          <EvidenceList items={p.evidence} />
        </section>
        <section>
          <h4 className="mb-2 text-sm font-semibold">Progress log</h4>
          <ol className="relative space-y-3 border-l-2 border-stone-200 pl-5">{p.updates.map((u) => <li key={u.id} className="relative"><span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-forest-600 ring-4 ring-white" /><p className="text-sm">{u.text}</p><p className="text-[11px] text-stone-500">{fmtDateTime(u.at)} · {u.by}</p></li>)}</ol>
        </section>
      </div>
    </Drawer>
  );
}

function ProjectForm({ p, onClose, onSaved }: { p?: Project; onClose: () => void; onSaved: (id: string) => void }) {
  const { data, createProject, updateProject, toast } = useData();
  const [f, setF] = useState({ title: p?.title ?? '', villageId: p?.villageId ?? data.villages[0].id, category: p?.category ?? 'Roads', agency: p?.agency ?? DEPARTMENTS[1], status: (p?.status ?? 'Proposed') as ProjectStatus, budget: p?.budgetLakh != null ? String(p.budgetLakh) : '', startDate: p?.startDate ?? '', expectedCompletion: p?.expectedCompletion ?? '', nextReviewDate: p?.nextReviewDate ?? '', nextAction: p?.nextAction ?? 'Prepare estimate with engineering wing' });
  const [err, setErr] = useState('');
  const pre = PRE.includes(f.status);
  const set = (k: keyof typeof f) => (v: string) => setF({ ...f, [k]: v });
  const save = () => {
    if (f.title.trim().length < 5) return setErr('Enter a project title.');
    if (!pre && (!f.budget || isNaN(+f.budget))) return setErr('Approved-stage projects need an illustrative approved budget (₹ lakh).');
    if (!pre && (!f.startDate || !f.expectedCompletion)) return setErr('Approved-stage projects need start and expected completion dates.');
    const base = { title: f.title.trim(), villageId: f.villageId, category: f.category, agency: f.agency, status: f.status, budgetLakh: pre ? null : +f.budget, startDate: pre ? '' : f.startDate, expectedCompletion: pre ? '' : f.expectedCompletion, nextReviewDate: f.nextReviewDate, nextAction: f.nextAction };
    if (p) { updateProject(p.id, base, 'Project details edited'); toast('Project updated'); onSaved(p.id); }
    else { const id = createProject({ ...base, progress: 0, delayReason: '', milestones: [{ id: 'm' + Date.now(), title: 'Site survey & estimate', due: '', done: false }] }); toast(`${id} added to ledger`); onSaved(id); }
  };
  return (
    <Modal open onClose={onClose} title={p ? `Edit ${p.id}` : 'Add project'} footer={<><Button onClick={onClose}>Cancel</Button><Button variant="primary" onClick={save} data-testid="save-project">Save</Button></>}>
      <div className="space-y-3.5">
        <Field label="Project title"><input className={inputCls} value={f.title} onChange={(e) => set('title')(e.target.value)} placeholder="e.g. CC road — temple street" /></Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Village"><Select value={f.villageId} onChange={set('villageId')} options={data.villages.map((v) => ({ value: v.id, label: v.name }))} /></Field>
          <Field label="Category"><Select value={f.category} onChange={set('category')} options={['Roads', 'Drinking water', 'Sanitation', 'Streetlights', 'Education', 'Healthcare', 'Agriculture', 'Transport', 'Community', 'Child welfare']} /></Field>
          <Field label="Responsible department / agency"><Select value={f.agency} onChange={set('agency')} options={DEPARTMENTS} /></Field>
          <Field label="Stage"><Select value={f.status} onChange={set('status')} options={PROJECT_STATUSES} /></Field>
          {pre ? <p className="rounded-xl bg-stone-100 p-3 text-xs text-stone-600 sm:col-span-2">Budget and dates are only recorded once a project is approved. Proposed / awaiting-approval works are shown as “Not approved / not funded”.</p> : <>
            <Field label="Approved budget (₹ lakh, illustrative)"><input className={inputCls} inputMode="decimal" value={f.budget} onChange={(e) => set('budget')(e.target.value)} /></Field>
            <Field label="Start date"><input type="date" className={inputCls} value={f.startDate} onChange={(e) => set('startDate')(e.target.value)} /></Field>
            <Field label="Expected completion"><input type="date" className={inputCls} value={f.expectedCompletion} onChange={(e) => set('expectedCompletion')(e.target.value)} /></Field></>}
          <Field label="Next review date"><input type="date" className={inputCls} value={f.nextReviewDate} onChange={(e) => set('nextReviewDate')(e.target.value)} /></Field>
        </div>
        <Field label="Next action"><input className={inputCls} value={f.nextAction} onChange={(e) => set('nextAction')(e.target.value)} /></Field>
        {err && <p role="alert" className="text-sm text-red-700">{err}</p>}
      </div>
    </Modal>
  );
}
