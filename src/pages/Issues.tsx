import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, CalendarClock, Camera, CheckCircle2, Pencil, Plus, ShieldCheck, UserCheck, Building, ArrowRightCircle, Search } from 'lucide-react';
import { useData, statusIdx } from '../data/store';
import { DEPARTMENTS, STAFF, STAFF_ROLES } from '../data/seed';
import { ISSUE_CATEGORIES, ISSUE_STATUSES, Issue, IssueCategory, IssueStatus, PRIORITIES, Priority } from '../data/types';
import { Button, Card, Drawer, EmptyState, EvidenceList, Field, Modal, PageHeader, PriorityBadge, Select, StatusBadge, Stepper, cx, fmtDate, fmtDateTime, inputCls, DemoNote } from '../components/ui';

const ALL = 'All';
export default function Issues() {
  const { data } = useData();
  const [sp, setSp] = useSearchParams();
  const [q, setQ] = useState('');
  const status = sp.get('status') ?? ALL, priority = sp.get('priority') ?? ALL, category = sp.get('category') ?? ALL, village = sp.get('village') ?? ALL;
  const setF = (k: string, v: string) => { const n = new URLSearchParams(sp); v === ALL ? n.delete(k) : n.set(k, v); n.delete('id'); setSp(n, { replace: true }); };
  const openId = sp.get('id');
  const [form, setForm] = useState<{ open: boolean; issue?: Issue }>({ open: false });
  const vn = (id: string) => data.villages.find((v) => v.id === id)?.name ?? '';
  const list = useMemo(() => data.issues.filter((i) => (status === ALL || (status === 'Open' ? statusIdx(i.status) < 5 : i.status === status)) && (priority === ALL || i.priority === priority) && (category === ALL || i.category === category) && (village === ALL || i.villageId === village)
    && (!q || [i.id, i.title, i.description, vn(i.villageId), i.assignedTo, i.department].join(' ').toLowerCase().includes(q.toLowerCase()))), [data, status, priority, category, village, q]); // eslint-disable-line
  const counts = ISSUE_STATUSES.map((s) => ({ s, n: data.issues.filter((i) => i.status === s).length }));
  const open = (id: string | null) => { const n = new URLSearchParams(sp); id ? n.set('id', id) : n.delete('id'); setSp(n); };
  const active = data.issues.find((i) => i.id === openId);
  const filtersOn = status !== ALL || priority !== ALL || category !== ALL || village !== ALL || q;

  return (
    <div>
      <PageHeader title="People's Issues" subtitle="Every issue carries an owner, a department, a next action and a follow-up date — from submission to independently verified outcome." actions={<Button variant="primary" onClick={() => setForm({ open: true })}><Plus size={18} />Record new issue</Button>} />
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1" aria-label="Status pipeline">
        {counts.map(({ s, n }, k) => (
          <button key={s} onClick={() => setF('status', status === s ? ALL : s)} className={cx('min-w-[118px] flex-1 rounded-xl border px-3 py-2.5 text-left transition', status === s ? 'border-forest-600 bg-forest-50 ring-1 ring-forest-600' : 'border-stone-200 bg-white hover:border-stone-300')}>
            <p className="text-[11px] text-stone-500">{k + 1}. {s}</p><p className="text-xl font-semibold tabular-nums">{n}</p>
          </button>))}
      </div>
      <Card className="mb-4 p-3 sm:p-4" data-tour="issue-filters">
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1fr_auto]">
          <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search ID, title, village, staff…" aria-label="Search issues" className={cx(inputCls, 'h-11 pl-9')} /></div>
          <Select label="Filter by status" value={status} onChange={(v) => setF('status', v)} options={[{ value: ALL, label: 'All statuses' }, { value: 'Open', label: 'All open (not resolved)' }, ...ISSUE_STATUSES]} />
          <Select label="Filter by priority" value={priority} onChange={(v) => setF('priority', v)} options={[{ value: ALL, label: 'All priorities' }, ...PRIORITIES]} />
          <Select label="Filter by category" value={category} onChange={(v) => setF('category', v)} options={[{ value: ALL, label: 'All categories' }, ...ISSUE_CATEGORIES]} />
          <Select label="Filter by village" value={village} onChange={(v) => setF('village', v)} options={[{ value: ALL, label: 'All villages' }, ...data.villages.map((v) => ({ value: v.id, label: v.name }))]} />
          <Button variant="ghost" disabled={!filtersOn} onClick={() => { setQ(''); setSp(new URLSearchParams()); }}>Clear</Button>
        </div>
      </Card>
      <p className="mb-2 text-sm text-stone-600" data-testid="issue-count">{list.length} of {data.issues.length} issues</p>
      <div data-tour="issue-list">
        {list.length === 0 ? <EmptyState title="No issues match these filters" hint="Try clearing filters or searching a different village." action={<Button onClick={() => { setQ(''); setSp(new URLSearchParams()); }}>Clear filters</Button>} /> : (
          <Card className="overflow-hidden">
            <div className="hidden grid-cols-[110px_1.8fr_1fr_90px_160px_1fr_110px] gap-3 border-b border-stone-200 bg-cream-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-stone-500 lg:grid"><span>ID</span><span>Issue</span><span>Village</span><span>Priority</span><span>Status</span><span>Owner / dept.</span><span>Follow-up</span></div>
            <ul className="divide-y divide-stone-100">{list.map((i) => (
              <li key={i.id}><button onClick={() => open(i.id)} data-testid="issue-row" className="grid w-full gap-1.5 px-4 py-3.5 text-left transition hover:bg-forest-50/50 lg:grid-cols-[110px_1.8fr_1fr_90px_160px_1fr_110px] lg:items-center lg:gap-3">
                <span className="text-xs font-medium text-stone-500">{i.id}</span>
                <span><span className="block text-sm font-medium text-stone-900">{i.title}</span><span className="block text-xs text-stone-500">{i.category} · {fmtDate(i.submittedAt)}</span></span>
                <span className="text-sm text-stone-700">{vn(i.villageId)}</span>
                <span><PriorityBadge p={i.priority} /></span>
                <span><StatusBadge s={i.status} /></span>
                <span className="text-xs text-stone-600">{i.assignedTo}<br /><span className="text-stone-400">{i.department || 'Dept. not yet identified'}</span></span>
                <span className="text-xs text-stone-600">{i.followUpDate ? fmtDate(i.followUpDate) : '—'}</span>
              </button></li>))}</ul>
          </Card>)}
      </div>
      <DemoNote className="mt-4" />
      {active && <IssuePanel issue={active} onClose={() => open(null)} onEdit={() => setForm({ open: true, issue: active })} />}
      {form.open && <IssueForm issue={form.issue} onClose={() => setForm({ open: false })} onSaved={(id) => { setForm({ open: false }); open(id); }} />}
    </div>
  );
}

function IssuePanel({ issue: i, onClose, onEdit }: { issue: Issue; onClose: () => void; onEdit: () => void }) {
  const { data, setIssueStatus, updateIssue, addIssueEvidence, toast } = useData();
  const v = data.villages.find((x) => x.id === i.villageId);
  const [next, setNext] = useState<IssueStatus>(i.status);
  const [err, setErr] = useState('');
  const [note, setNote] = useState(''); const [noteType, setNoteType] = useState<'note' | 'update'>('update');
  const [evOpen, setEvOpen] = useState(false); const [evLabel, setEvLabel] = useState(''); const [evDesc, setEvDesc] = useState(''); const [evKind, setEvKind] = useState<'Photo' | 'Document' | 'Inspection note'>('Photo');
  useEffect(() => { setNext(i.status); setErr(''); }, [i.id, i.status]);
  const change = (s: IssueStatus) => {
    const r = setIssueStatus(i.id, s);
    if (!r.ok) { setErr(r.message); toast(r.message, 'error'); if (s === 'Verified') setEvOpen(true); } else { setErr(''); toast(r.message); }
  };
  const latest = [...i.history].reverse().find((h) => h.type === 'update' || h.type === 'status' || h.type === 'note');
  const cur = statusIdx(i.status);
  return (
    <Drawer open onClose={onClose} wide subtitle={<span className="flex flex-wrap items-center gap-2">{i.id} · {v?.name} · {i.category} <PriorityBadge p={i.priority} /></span>} title={i.title}
      footer={<div className="flex flex-wrap items-center justify-between gap-2"><span className="text-xs text-stone-500">Local demo — not submitted to any real department.</span><Button size="sm" onClick={onEdit}><Pencil size={15} />Edit issue</Button></div>}>
      <div className="space-y-6" data-testid="issue-panel">
        <div className="rounded-2xl border border-stone-200 p-4"><Stepper status={i.status} /><p className="mt-3 text-center text-sm sm:hidden">Current: <StatusBadge s={i.status} /></p></div>
        <p className="text-sm leading-relaxed text-stone-700">{i.description}</p>
        <div className="grid gap-3 rounded-2xl border border-forest-200 bg-forest-50/50 p-4 sm:grid-cols-2" data-tour="accountability">
          <p className="col-span-full text-xs font-semibold uppercase tracking-wider text-forest-800">Accountability</p>
          <Field label="Assigned staff"><Select label="Assign responsible person" value={i.assignedTo} onChange={(s) => { updateIssue(i.id, { assignedTo: s }, { type: 'assign', text: `Assigned to ${s}` }); toast(`Assigned to ${s}`); }} options={STAFF.map((s) => ({ value: s, label: `${s} — ${STAFF_ROLES[s]}` }))} /></Field>
          <Field label="Responsible department"><Select label="Responsible department" value={i.department} onChange={(s) => { updateIssue(i.id, { department: s }, { type: 'edit', text: s ? `Responsible department identified: ${s}` : 'Department cleared' }); toast('Department updated'); }} options={[{ value: '', label: 'Not yet identified' }, ...DEPARTMENTS]} /></Field>
          <Field label="Next action"><input className={inputCls} defaultValue={i.nextAction} key={i.nextAction} onBlur={(e) => { if (e.target.value !== i.nextAction) { updateIssue(i.id, { nextAction: e.target.value }, { type: 'edit', text: `Next action: ${e.target.value}` }); toast('Next action saved'); } }} aria-label="Next action" /></Field>
          <Field label="Follow-up date"><input type="date" className={inputCls} value={i.followUpDate} onChange={(e) => { updateIssue(i.id, { followUpDate: e.target.value }, { type: 'followup', text: `Follow-up date set to ${fmtDate(e.target.value)}` }); toast('Follow-up date recorded'); }} aria-label="Follow-up date" /></Field>
          <div className="col-span-full grid gap-1 text-xs text-stone-600 sm:grid-cols-3"><span className="flex items-center gap-1.5"><UserCheck size={14} />{STAFF_ROLES[i.assignedTo] ?? 'Staff'}</span><span className="flex items-center gap-1.5"><Building size={14} />{i.department || 'Department to be identified'}</span><span className="flex items-center gap-1.5"><CalendarClock size={14} />{i.followUpDate ? `Follow up ${fmtDate(i.followUpDate)}` : 'No follow-up pending'}</span></div>
        </div>

        <section>
          <h4 className="mb-2 text-sm font-semibold">Change status</h4>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Select label="New status" value={next} onChange={(s) => setNext(s as IssueStatus)} options={ISSUE_STATUSES} className="sm:max-w-xs" />
            <Button variant="primary" onClick={() => change(next)} disabled={next === i.status} data-testid="apply-status"><ArrowRightCircle size={17} />Update status</Button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {cur < 5 && <Button size="sm" variant="saffron" onClick={() => change('Resolved')}><CheckCircle2 size={15} />Mark resolved</Button>}
            {cur === 5 && <Button size="sm" variant="primary" onClick={() => change('Verified')} data-testid="mark-verified"><ShieldCheck size={15} />Mark verified</Button>}
          </div>
          {err && <div role="alert" data-testid="status-error" className="mt-3 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"><AlertCircle size={18} className="mt-0.5 shrink-0" />{err}</div>}
          <p className="mt-2 text-xs text-stone-500"><b>Resolved</b> = action reported complete. <b>Verified</b> = independently confirmed with evidence recorded after resolution.</p>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between"><h4 className="text-sm font-semibold">Evidence</h4><Button size="sm" onClick={() => setEvOpen(!evOpen)} data-testid="add-evidence"><Camera size={15} />Attach evidence</Button></div>
          {evOpen && (
            <form className="mb-3 grid gap-2 rounded-2xl border border-stone-200 bg-cream-50 p-3 sm:grid-cols-[1fr_140px]" onSubmit={(e) => { e.preventDefault(); if (!evLabel.trim()) { toast('Give the evidence a short title', 'error'); return; } addIssueEvidence(i.id, { label: evLabel.trim(), description: evDesc.trim() || 'Placeholder — no file stored in demo', kind: evKind }); setEvLabel(''); setEvDesc(''); setEvOpen(false); setErr(''); toast('Evidence placeholder attached'); }}>
              <input className={inputCls} placeholder="Evidence title, e.g. After-repair photo" value={evLabel} onChange={(e) => setEvLabel(e.target.value)} aria-label="Evidence title" />
              <Select label="Evidence type" value={evKind} onChange={(k) => setEvKind(k as typeof evKind)} options={['Photo', 'Document', 'Inspection note']} />
              <input className={cx(inputCls, 'sm:col-span-2')} placeholder="Description (who verified, what was observed)" value={evDesc} onChange={(e) => setEvDesc(e.target.value)} aria-label="Evidence description" />
              <div className="flex items-center justify-between gap-2 sm:col-span-2"><span className="text-xs text-stone-500">File upload is a placeholder in this demo.</span><Button size="sm" variant="primary" type="submit" data-testid="save-evidence">Save evidence</Button></div>
            </form>)}
          <EvidenceList items={i.evidence} />
        </section>

        <section>
          <h4 className="mb-2 text-sm font-semibold">Add action update or staff note</h4>
          <form className="space-y-2" onSubmit={(e) => { e.preventDefault(); if (!note.trim()) return; updateIssue(i.id, {}, { type: noteType, text: (noteType === 'note' ? 'Staff note: ' : 'Action update: ') + note.trim() }); setNote(''); toast(noteType === 'note' ? 'Staff note added' : 'Action update added'); }}>
            <div className="flex gap-2">{(['update', 'note'] as const).map((t) => <button type="button" key={t} onClick={() => setNoteType(t)} className={cx('h-9 rounded-lg px-3 text-sm', noteType === t ? 'bg-forest-700 text-white' : 'bg-stone-100 text-stone-700')}>{t === 'update' ? 'Action update' : 'Staff note'}</button>)}</div>
            <textarea className={cx(inputCls, 'min-h-[76px]')} placeholder={noteType === 'update' ? 'e.g. Spoke to AE, pipeline repair scheduled for Thursday' : 'Internal note for the team'} value={note} onChange={(e) => setNote(e.target.value)} aria-label="Update text" />
            <Button type="submit" size="sm" variant="primary" disabled={!note.trim()}>Add {noteType === 'update' ? 'update' : 'note'}</Button>
          </form>
        </section>

        <section>
          <h4 className="mb-2 text-sm font-semibold">Timeline</h4>
          {latest && <p className="mb-3 rounded-xl bg-saffron-50 px-3 py-2 text-sm text-stone-700"><b>Latest:</b> {latest.text}</p>}
          <ol className="relative space-y-4 border-l-2 border-stone-200 pl-5">{[...i.history].reverse().map((h) => (
            <li key={h.id} className="relative"><span className={cx('absolute -left-[27px] top-1 h-3 w-3 rounded-full ring-4 ring-white', h.type === 'status' ? 'bg-forest-600' : h.type === 'evidence' ? 'bg-saffron-500' : 'bg-stone-400')} />
              <p className="text-sm text-stone-800">{h.text}</p><p className="text-[11px] text-stone-500">{fmtDateTime(h.at)} · {h.by}</p></li>))}</ol>
        </section>
        <p className="text-xs text-stone-500">Submitted {fmtDateTime(i.submittedAt)} via {i.source}. Illustrative demo data — not official constituency records.</p>
      </div>
    </Drawer>
  );
}

function IssueForm({ issue, onClose, onSaved }: { issue?: Issue; onClose: () => void; onSaved: (id: string) => void }) {
  const { data, createIssue, updateIssue, toast } = useData();
  const [f, setF] = useState({ title: issue?.title ?? '', description: issue?.description ?? '', villageId: issue?.villageId ?? data.villages[0].id, category: (issue?.category ?? 'Drinking Water') as IssueCategory, priority: (issue?.priority ?? 'Medium') as Priority, assignedTo: issue?.assignedTo ?? STAFF[0], department: issue?.department ?? '', nextAction: issue?.nextAction ?? 'Staff to review details and confirm location', followUpDate: issue?.followUpDate ?? '', source: issue?.source ?? 'Walk-in at office' });
  const [err, setErr] = useState('');
  const set = (k: keyof typeof f) => (v: string) => setF({ ...f, [k]: v });
  const save = () => {
    if (f.title.trim().length < 5) return setErr('Please enter a short title (at least 5 characters).');
    if (f.description.trim().length < 10) return setErr('Please describe the issue (at least 10 characters).');
    if (issue) { updateIssue(issue.id, f, { type: 'edit', text: 'Issue details edited' }); toast(`${issue.id} updated`); onSaved(issue.id); }
    else { const id = createIssue(f); toast(`${id} recorded locally (demo — not sent to any department)`); onSaved(id); }
  };
  return (
    <Modal open onClose={onClose} title={issue ? `Edit ${issue.id}` : 'Record new issue'} footer={<><Button onClick={onClose}>Cancel</Button><Button variant="primary" onClick={save} data-testid="save-issue">{issue ? 'Save changes' : 'Record issue'}</Button></>}>
      <div className="space-y-3.5">
        {!issue && <p className="rounded-xl bg-cream-100 p-3 text-xs text-stone-600">This records the issue in the local demo only. Nothing is submitted to a government department.</p>}
        <Field label="Title"><input className={inputCls} value={f.title} onChange={(e) => set('title')(e.target.value)} placeholder="e.g. Drinking water supply interruption" /></Field>
        <Field label="Description"><textarea className={cx(inputCls, 'min-h-[80px]')} value={f.description} onChange={(e) => set('description')(e.target.value)} placeholder="What, where, how many households affected" /></Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Village"><Select value={f.villageId} onChange={set('villageId')} options={data.villages.map((v) => ({ value: v.id, label: v.name }))} /></Field>
          <Field label="Category"><Select value={f.category} onChange={set('category')} options={ISSUE_CATEGORIES} /></Field>
          <Field label="Priority"><Select value={f.priority} onChange={set('priority')} options={PRIORITIES} /></Field>
          <Field label="Assigned staff"><Select value={f.assignedTo} onChange={set('assignedTo')} options={STAFF} /></Field>
          <Field label="Responsible department"><Select value={f.department} onChange={set('department')} options={[{ value: '', label: 'Not yet identified' }, ...DEPARTMENTS]} /></Field>
          <Field label="Source"><Select value={f.source} onChange={set('source')} options={['Walk-in at office', 'Phone call', 'Village visit', 'Gram sabha']} /></Field>
          <Field label="Next action"><input className={inputCls} value={f.nextAction} onChange={(e) => set('nextAction')(e.target.value)} /></Field>
          <Field label="Follow-up date"><input type="date" className={inputCls} value={f.followUpDate} onChange={(e) => set('followUpDate')(e.target.value)} /></Field>
        </div>
        {err && <p role="alert" className="text-sm text-red-700">{err}</p>}
      </div>
    </Modal>
  );
}
