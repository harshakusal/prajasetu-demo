import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Info, Plus, Search, ShieldAlert } from 'lucide-react';
import { useData } from '../data/store';
import { STAFF } from '../data/seed';
import { ELIGIBILITY, REFERRAL, SCHEME_CATEGORIES, SchemeRequest } from '../data/types';
import { Badge, Button, Card, EmptyState, Field, Modal, PageHeader, Select, cx, fmtDate, inputCls, DemoNote } from '../components/ui';

const DOCS = ['Identity proof (as specified by official source)', 'Address / residence proof', 'Category-specific documents — verify with official source', 'Bank account details (if required by official process)', 'Recent photograph (if required)'];
export default function Schemes() {
  const { data } = useData(); const [sp, setSp] = useSearchParams();
  const [q, setQ] = useState(''); const [cat, setCat] = useState('All');
  const [edit, setEdit] = useState<{ open: boolean; s?: SchemeRequest }>({ open: false });
  const vn = (id: string) => data.villages.find((v) => v.id === id)?.name ?? '';
  const list = useMemo(() => data.schemes.filter((s) => (cat === 'All' || s.category === cat) && (!q || [s.id, s.summary, vn(s.villageId), s.category].join(' ').toLowerCase().includes(q.toLowerCase()))), [data, q, cat]); // eslint-disable-line
  const hi = sp.get('id');
  return (
    <div>
      <PageHeader title="Scheme Assistance" subtitle="Record a citizen's request for scheme information and track the referral. Minimal data only — no ID numbers are collected in this demo." actions={<Button variant="primary" onClick={() => setEdit({ open: true })}><Plus size={18} />New request</Button>} />
      <div className="mb-5 flex gap-3 rounded-2xl border border-saffron-200 bg-saffron-50 p-4 text-sm text-stone-800" role="note">
        <ShieldAlert size={20} className="mt-0.5 shrink-0 text-saffron-600" />
        <div><p className="font-semibold">Eligibility depends on current official rules.</p><p className="mt-0.5 text-stone-700">This demo does not determine or guarantee eligibility, approval or benefits, and is not connected to any government system. Staff must confirm requirements with the official scheme source. Scheme details below are <b>placeholders for verified official scheme information</b>.</p></div>
      </div>
      <Card className="mb-4 grid gap-2.5 p-3 sm:grid-cols-[1fr_240px] sm:p-4">
        <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search requests…" aria-label="Search scheme requests" className={cx(inputCls, 'h-11 pl-9')} /></div>
        <Select label="Category" value={cat} onChange={setCat} options={[{ value: 'All', label: 'All categories' }, ...SCHEME_CATEGORIES]} />
      </Card>
      {list.length === 0 ? <EmptyState title="No requests found" hint="Record a new request or clear the filters." /> : (
        <div className="grid gap-4 md:grid-cols-2">{list.map((s) => (
          <Card key={s.id} className={cx('p-5', hi === s.id && 'ring-2 ring-saffron-400')} data-testid="scheme-card">
            <div className="flex items-start justify-between gap-2"><div><p className="text-xs text-stone-500">{s.id} · {vn(s.villageId)} · {fmtDate(s.createdAt)}</p><h3 className="mt-1 font-semibold">{s.summary}</h3></div><Badge tone="green">{s.category}</Badge></div>
            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <div><dt className="text-xs text-stone-500">Eligibility check</dt><dd className="font-medium">{s.eligibility}</dd></div>
              <div><dt className="text-xs text-stone-500">Referral / follow-up</dt><dd className="font-medium">{s.referral}</dd></div>
              <div className="sm:col-span-2"><dt className="text-xs text-stone-500">Documents applicant may need (verify with official source)</dt><dd><ul className="mt-1 list-disc pl-5 text-stone-700">{s.documents.map((d) => <li key={d}>{d}</li>)}</ul></dd></div>
              <div className="sm:col-span-2"><dt className="text-xs text-stone-500">Next action</dt><dd className="font-medium">{s.nextAction}</dd></div>
            </dl>
            <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-stone-50 p-2.5 text-xs text-stone-500"><span className="flex items-center gap-1.5"><Info size={14} />Verified official scheme info: placeholder</span><Button size="sm" onClick={() => setEdit({ open: true, s })}>Update</Button></div>
          </Card>))}</div>)}
      <DemoNote className="mt-4" />
      {edit.open && <SchemeForm s={edit.s} onClose={() => { setEdit({ open: false }); setSp({}); }} />}
    </div>
  );
}

function SchemeForm({ s, onClose }: { s?: SchemeRequest; onClose: () => void }) {
  const { data, saveScheme, toast } = useData();
  const [f, setF] = useState({ villageId: s?.villageId ?? data.villages[0].id, category: s?.category ?? 'Pension', summary: s?.summary ?? '', eligibility: s?.eligibility ?? ELIGIBILITY[0], referral: s?.referral ?? REFERRAL[0], documents: s?.documents ?? DOCS.slice(0, 3), nextAction: s?.nextAction ?? 'Share official information source with applicant', staff: s?.staff ?? STAFF[3] });
  const [err, setErr] = useState('');
  const save = () => {
    if (f.summary.trim().length < 8) return setErr('Briefly describe what the person asked about (no personal ID numbers).');
    const id = s ? saveScheme({ ...s, ...f } as SchemeRequest) : saveScheme(f as Omit<SchemeRequest, 'id' | 'createdAt'>);
    toast(s ? `${id} updated` : `${id} recorded (demo — no eligibility decision made)`); onClose();
  };
  return (
    <Modal open onClose={onClose} title={s ? `Update ${s.id}` : 'New scheme assistance request'} footer={<><Button onClick={onClose}>Cancel</Button><Button variant="primary" onClick={save} data-testid="save-scheme">Save request</Button></>}>
      <div className="space-y-3.5">
        <p className="rounded-xl bg-cream-100 p-3 text-xs text-stone-600">Do not record Aadhaar, ration card, bank or phone numbers in this demo. Eligibility is decided only by the official process.</p>
        <Field label="What did the person ask about?"><input className={inputCls} value={f.summary} onChange={(e) => setF({ ...f, summary: e.target.value })} placeholder="e.g. Elderly resident asked about pension process" /></Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Village"><Select value={f.villageId} onChange={(v) => setF({ ...f, villageId: v })} options={data.villages.map((v) => ({ value: v.id, label: v.name }))} /></Field>
          <Field label="Assistance category"><Select value={f.category} onChange={(v) => setF({ ...f, category: v as SchemeRequest['category'] })} options={SCHEME_CATEGORIES} /></Field>
          <Field label="Eligibility-check status"><Select value={f.eligibility} onChange={(v) => setF({ ...f, eligibility: v as SchemeRequest['eligibility'] })} options={ELIGIBILITY} /></Field>
          <Field label="Referral / follow-up"><Select value={f.referral} onChange={(v) => setF({ ...f, referral: v as SchemeRequest['referral'] })} options={REFERRAL} /></Field>
        </div>
        <fieldset><legend className="mb-1.5 text-sm font-medium text-stone-700">Documents applicant may need <span className="font-normal text-stone-500">(generic — verify with official source)</span></legend>
          <div className="space-y-1">{DOCS.map((d) => <label key={d} className="flex min-h-[40px] items-center gap-2.5 text-sm"><input type="checkbox" className="h-5 w-5 accent-forest-700" checked={f.documents.includes(d)} onChange={() => setF({ ...f, documents: f.documents.includes(d) ? f.documents.filter((x) => x !== d) : [...f.documents, d] })} />{d}</label>)}</div>
        </fieldset>
        <Field label="Next action"><input className={inputCls} value={f.nextAction} onChange={(e) => setF({ ...f, nextAction: e.target.value })} /></Field>
        {err && <p role="alert" className="text-sm text-red-700">{err}</p>}
      </div>
    </Modal>
  );
}
