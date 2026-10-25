import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CalendarDays, Camera, CheckCircle2, Plus, UserRound } from 'lucide-react';
import { useData, statusIdx } from '../data/store';
import { STAFF, STAFF_ROLES } from '../data/seed';
import { FieldVisit } from '../data/types';
import { Badge, Button, Card, Drawer, EmptyState, EvidenceList, Field as F, Modal, PageHeader, Select, StatusBadge, cx, fmtDate, inputCls, DemoNote } from '../components/ui';

const CHECK = ['Inspect open issues on site', 'Meet village secretariat staff', 'Check drinking water points', 'Check school & anganwadi facilities', 'Photograph evidence (placeholder)', 'Collect resident feedback'];
export default function Field() {
  const { data } = useData(); const [sp, setSp] = useSearchParams();
  const [tab, setTab] = useState<'Scheduled' | 'Completed'>('Scheduled'); const [create, setCreate] = useState(false);
  const vn = (id: string) => data.villages.find((v) => v.id === id)?.name ?? '';
  const list = data.visits.filter((v) => v.status === tab).sort((a, b) => (tab === 'Scheduled' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)));
  const active = data.visits.find((v) => v.id === sp.get('id'));
  return (
    <div>
      <PageHeader title="Field Operations" subtitle="Plan village visits, inspect open issues, tick off checklists and record notes and evidence." actions={<Button variant="primary" onClick={() => setCreate(true)} data-testid="new-visit"><Plus size={18} />Schedule visit</Button>} />
      <div className="mb-4 inline-flex rounded-xl border border-stone-200 bg-white p-1">{(['Scheduled', 'Completed'] as const).map((t) => <button key={t} onClick={() => setTab(t)} className={cx('h-10 rounded-lg px-4 text-sm font-medium', tab === t ? 'bg-forest-700 text-white' : 'text-stone-600 hover:bg-stone-50')}>{t} ({data.visits.filter((v) => v.status === t).length})</button>)}</div>
      {list.length === 0 ? <EmptyState title={`No ${tab.toLowerCase()} visits`} action={<Button onClick={() => setCreate(true)}>Schedule a visit</Button>} /> : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{list.map((v) => { const done = v.checklist.filter((c) => c.done).length; return (
          <Card key={v.id} className="p-5" data-testid="visit-card">
            <div className="flex items-start gap-3"><div className="w-14 shrink-0 rounded-xl bg-forest-50 py-1.5 text-center"><p className="text-[10px] uppercase text-forest-700">{new Date(v.date).toLocaleDateString('en-IN', { month: 'short' })}</p><p className="text-lg font-semibold text-forest-800">{new Date(v.date).getDate()}</p></div>
              <div className="min-w-0 flex-1"><p className="text-xs text-stone-500">{v.id}</p><h3 className="font-semibold">{vn(v.villageId)}</h3><p className="text-sm text-stone-600">{v.purpose}</p></div></div>
            <p className="mt-3 flex items-center gap-1.5 text-sm text-stone-700"><UserRound size={15} />{v.staff}</p>
            <div className="mt-3"><div className="mb-1 flex justify-between text-xs text-stone-500"><span>Checklist</span><span>{done}/{v.checklist.length}</span></div><div className="h-2 rounded-full bg-stone-100"><div className="h-2 rounded-full bg-forest-600 transition-all" style={{ width: `${(done / v.checklist.length) * 100}%` }} /></div></div>
            <div className="mt-4 flex items-center justify-between"><span className="text-xs text-stone-500">{v.issueIds.length} issues to inspect</span><Button size="sm" onClick={() => setSp({ id: v.id })}>Open visit</Button></div>
          </Card>); })}</div>)}
      <DemoNote className="mt-4" />
      {active && <VisitPanel v={active} onClose={() => setSp({})} />}
      {create && <VisitForm onClose={() => setCreate(false)} onSaved={(id) => { setCreate(false); setTab('Scheduled'); setSp({ id }); }} />}
    </div>
  );
}

function VisitPanel({ v, onClose }: { v: FieldVisit; onClose: () => void }) {
  const { data, saveVisit, toast } = useData(); const nav = useNavigate();
  const [notes, setNotes] = useState(v.notes); const [fu, setFu] = useState(''); const [ev, setEv] = useState('');
  const village = data.villages.find((x) => x.id === v.villageId);
  const issues = data.issues.filter((i) => v.issueIds.includes(i.id));
  const suggest = data.issues.filter((i) => i.villageId === v.villageId && statusIdx(i.status) < 6 && !v.issueIds.includes(i.id));
  const save = (patch: Partial<FieldVisit>, msg?: string, t?: string) => { saveVisit({ ...v, ...patch }, msg); if (t) toast(t); };
  return (
    <Drawer open onClose={onClose} title={`${village?.name} — ${v.purpose}`} subtitle={`${v.id} · ${fmtDate(v.date)}`} wide footer={<div className="flex flex-wrap justify-between gap-2"><span className="text-xs text-stone-500">Illustrative demo data.</span>{v.status === 'Scheduled' ? <Button size="sm" variant="primary" onClick={() => save({ status: 'Completed', notes }, `Field visit completed at ${village?.name} by ${v.staff}`, 'Visit marked completed')}><CheckCircle2 size={15} />Mark visit completed</Button> : <Badge tone="green">Completed</Badge>}</div>}>
      <div className="space-y-6" data-testid="visit-panel">
        <div className="grid gap-3 sm:grid-cols-3">
          <F label="Assigned staff"><Select label="Assigned staff" value={v.staff} onChange={(s) => save({ staff: s }, undefined, `Visit assigned to ${s}`)} options={STAFF.map((s) => ({ value: s, label: `${s} — ${STAFF_ROLES[s]}` }))} /></F>
          <F label="Visit date"><input type="date" className={inputCls} value={v.date} onChange={(e) => save({ date: e.target.value }, undefined, 'Visit date updated')} /></F>
          <F label="Next visit date"><input type="date" className={inputCls} value={v.nextVisitDate} onChange={(e) => save({ nextVisitDate: e.target.value }, undefined, 'Next visit date saved')} /></F>
        </div>
        <section><h4 className="mb-2 text-sm font-semibold">Village visit checklist</h4>
          <ul className="space-y-1">{v.checklist.map((c) => <li key={c.id}><label className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl border border-stone-200 px-3 hover:bg-cream-50"><input type="checkbox" data-testid="check-item" className="h-5 w-5 accent-forest-700" checked={c.done} onChange={() => save({ checklist: v.checklist.map((x) => (x.id === c.id ? { ...x, done: !x.done } : x)) }, undefined, c.done ? 'Checklist item reopened' : 'Checklist item completed')} /><span className={cx('text-sm', c.done && 'text-stone-500 line-through')}>{c.label}</span></label></li>)}</ul>
        </section>
        <section><h4 className="mb-2 text-sm font-semibold">Issues to inspect</h4>
          {issues.length === 0 ? <p className="text-sm text-stone-500">No issues linked.</p> : <ul className="divide-y divide-stone-100 rounded-xl border border-stone-200">{issues.map((i) => <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5"><button onClick={() => nav(`/issues?id=${i.id}`)} className="text-left text-sm hover:underline"><span className="text-xs text-stone-500">{i.id}</span> {i.title}</button><span className="flex items-center gap-2"><StatusBadge s={i.status} /><button className="text-xs text-stone-500 hover:text-red-600" onClick={() => save({ issueIds: v.issueIds.filter((x) => x !== i.id) }, undefined, 'Issue removed from visit')}>Remove</button></span></li>)}</ul>}
          {suggest.length > 0 && <div className="mt-2"><Select label="Link another issue" value="" onChange={(id) => id && save({ issueIds: [...v.issueIds, id] }, undefined, `${id} added to inspection list`)} options={[{ value: '', label: '+ Link another open issue in this village' }, ...suggest.map((i) => ({ value: i.id, label: `${i.id} · ${i.title}` }))]} /></div>}
        </section>
        <section><h4 className="mb-2 text-sm font-semibold">Follow-up tasks</h4>
          <ul className="space-y-1">{v.followUps.map((c) => <li key={c.id}><label className="flex min-h-[44px] items-center gap-3 rounded-xl px-2 hover:bg-cream-50"><input type="checkbox" className="h-5 w-5 accent-forest-700" checked={c.done} onChange={() => save({ followUps: v.followUps.map((x) => (x.id === c.id ? { ...x, done: !x.done } : x)) }, undefined, 'Follow-up updated')} /><span className={cx('text-sm', c.done && 'line-through text-stone-500')}>{c.label}</span></label></li>)}</ul>
          <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (!fu.trim()) return; save({ followUps: [...v.followUps, { id: 'f' + Date.now(), label: fu.trim(), done: false }] }, undefined, 'Follow-up task added'); setFu(''); }}><input className={inputCls} value={fu} onChange={(e) => setFu(e.target.value)} placeholder="Add follow-up task" aria-label="Follow-up task" /><Button type="submit" disabled={!fu.trim()}>Add</Button></form>
        </section>
        <section><h4 className="mb-2 text-sm font-semibold">Visit notes</h4>
          <textarea className={cx(inputCls, 'min-h-[100px]')} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What was observed, who was met, what was agreed" aria-label="Visit notes" data-testid="visit-notes" />
          <Button className="mt-2" size="sm" variant="primary" onClick={() => save({ notes }, undefined, 'Visit notes saved')} data-testid="save-notes">Save notes</Button>
        </section>
        <section><h4 className="mb-2 text-sm font-semibold">Evidence</h4>
          <form className="mb-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (!ev.trim()) return; save({ evidence: [...v.evidence, { id: 'ev' + Date.now(), label: ev.trim(), description: 'Placeholder — no file stored in demo', addedAt: new Date().toISOString(), addedBy: v.staff, kind: 'Photo' }] }, undefined, 'Evidence placeholder attached'); setEv(''); }}><input className={inputCls} value={ev} onChange={(e) => setEv(e.target.value)} placeholder="Evidence title, e.g. Drain photo near market" aria-label="Evidence title" /><Button type="submit" disabled={!ev.trim()}><Camera size={16} />Attach</Button></form>
          <EvidenceList items={v.evidence} />
        </section>
      </div>
    </Drawer>
  );
}

function VisitForm({ onClose, onSaved }: { onClose: () => void; onSaved: (id: string) => void }) {
  const { data, saveVisit, toast } = useData();
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const [f, setF] = useState({ villageId: data.villages[0].id, date: tomorrow, staff: STAFF[0], purpose: 'Inspection of open issues' });
  const save = () => {
    if (!f.date) return toast('Choose a visit date', 'error');
    const issueIds = data.issues.filter((i) => i.villageId === f.villageId && statusIdx(i.status) < 6).slice(0, 4).map((i) => i.id);
    const id = saveVisit({ ...f, status: 'Scheduled', checklist: CHECK.map((c, k) => ({ id: `c${Date.now()}-${k}`, label: c, done: false })), issueIds, followUps: [], notes: '', evidence: [], nextVisitDate: new Date(new Date(f.date).getTime() + 21 * 86400000).toISOString().slice(0, 10) });
    toast(`Visit ${id} scheduled and assigned to ${f.staff}`); onSaved(id);
  };
  return (
    <Modal open onClose={onClose} title="Schedule field visit" footer={<><Button onClick={onClose}>Cancel</Button><Button variant="primary" onClick={save} data-testid="save-visit"><CalendarDays size={16} />Schedule</Button></>}>
      <div className="grid gap-3.5 sm:grid-cols-2">
        <F label="Village"><Select value={f.villageId} onChange={(v) => setF({ ...f, villageId: v })} options={data.villages.map((v) => ({ value: v.id, label: v.name }))} /></F>
        <F label="Date"><input type="date" className={inputCls} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></F>
        <F label="Assign to"><Select value={f.staff} onChange={(v) => setF({ ...f, staff: v })} options={STAFF.map((s) => ({ value: s, label: `${s} — ${STAFF_ROLES[s]}` }))} /></F>
        <F label="Purpose"><Select value={f.purpose} onChange={(v) => setF({ ...f, purpose: v })} options={['Inspection of open issues', 'Pre-monsoon drainage inspection', 'Drinking water review', 'Project site review', 'Verification of resolved issues']} /></F>
        <p className="text-xs text-stone-500 sm:col-span-2">Open issues in the selected village are linked automatically; the standard checklist is added.</p>
      </div>
    </Modal>
  );
}
