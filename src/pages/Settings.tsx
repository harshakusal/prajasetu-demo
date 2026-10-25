import { useState } from 'react';
import { RotateCcw, Languages, Info, Database } from 'lucide-react';
import { useData } from '../data/store';
import { Button, Card, Modal, PageHeader } from '../components/ui';
import { CONSTITUENCY_FULL } from '../data/seed';

export default function Settings() {
  const { reset, toast, data } = useData(); const [confirm, setConfirm] = useState(false);
  return (
    <div className="max-w-3xl space-y-5">
      <PageHeader title="Settings" subtitle="Demo data, language and about." />
      <Card className="p-5"><div className="flex gap-3"><Database className="mt-0.5 text-forest-700" size={20} /><div className="flex-1"><h3 className="font-semibold">Demo data</h3><p className="mt-1 text-sm text-stone-600">Your changes are stored only in this browser (localStorage). Currently: {data.issues.length} issues, {data.projects.length} projects, {data.visits.length} field visits, {data.schemes.length} scheme requests.</p><Button className="mt-3" variant="danger" onClick={() => setConfirm(true)} data-testid="reset-data"><RotateCcw size={16} />Reset demo data</Button></div></div></Card>
      <Card className="p-5"><div className="flex gap-3"><Languages className="mt-0.5 text-forest-700" size={20} /><div><h3 className="font-semibold">Language</h3><p className="mt-1 text-sm text-stone-600">This demo is in English. A production version would offer Telugu (తెలుగు) and English, with all labels, statuses and the public report translated and reviewed by native speakers.</p></div></div></Card>
      <Card className="p-5"><div className="flex gap-3"><Info className="mt-0.5 text-forest-700" size={20} /><div className="space-y-2 text-sm text-stone-700"><h3 className="text-base font-semibold text-stone-900">About PrajaSetu (demo)</h3>
        <p>PrajaSetu — One Constituency. Every Village. Every Issue Accounted For. A concept for constituency-level public-service and development tracking: village problem → responsible department → action tracking → evidence → verified outcome.</p>
        <p><b>Disclaimer.</b> Illustrative demo data — not official constituency records. “{CONSTITUENCY_FULL}”, its villages, mandals, staff names, issues, projects and figures are fictional. This demo is not affiliated with or approved by any government body, elected representative or political party. It does not submit anything to any department, does not determine scheme eligibility, and has no real login.</p>
        <p>Works offline once loaded; no external services are called.</p></div></div></Card>
      <Modal open={confirm} onClose={() => setConfirm(false)} title="Reset demo data?" footer={<><Button onClick={() => setConfirm(false)}>Cancel</Button><Button variant="primary" data-testid="confirm-reset" onClick={() => { reset(); setConfirm(false); toast('Demo data reset to the original seeded records'); }}>Reset</Button></>}>
        <p className="text-sm text-stone-700">All changes made in this browser will be discarded and the original illustrative dataset restored.</p>
      </Modal>
    </div>
  );
}
