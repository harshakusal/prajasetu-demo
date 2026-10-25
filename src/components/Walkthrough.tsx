import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { useData } from '../data/store';
import { cx } from './ui';

interface Step { title: string; body: string; route: string; target: string }

export default function Walkthrough({ onExit }: { onExit: () => void }) {
  const { data } = useData();
  const nav = useNavigate();
  const steps: Step[] = useMemo(() => {
    const acc = data.issues.find((i) => i.status === 'Awaiting External Action') ?? data.issues.find((i) => i.department) ?? data.issues[0];
    const delayed = data.projects.find((p) => p.status === 'Delayed') ?? data.projects[0];
    return [
      { title: 'See the whole constituency', body: 'Every village on one screen — open issues, active works and a simple status signal, all computed from the same records.', route: '/', target: 'village-overview' },
      { title: 'Identify urgent problems', body: 'Filter and prioritise. Here the issue list is filtered to Critical priority so staff see what needs attention first.', route: '/issues?priority=Critical', target: 'issue-list' },
      { title: 'Track accountability', body: 'Each issue shows the responsible staff member, the department it is referred to, the next action and the follow-up date.', route: `/issues?id=${acc.id}`, target: 'accountability' },
      { title: 'Monitor development', body: 'Projects carry milestones, delay reasons, evidence and a next review date — and proposed works are never shown as funded.', route: `/projects?id=${delayed.id}`, target: 'project-milestones' },
      { title: 'Measure real outcomes', body: '“Resolved” is the department’s claim. “Verified” needs independent evidence. PrajaSetu keeps the two apart.', route: '/report', target: 'resolved-vs-verified' },
      { title: 'Build public trust', body: 'Generate a transparent, printable impact report by period — clearly labelled as illustrative in this demo.', route: '/report', target: 'report-preview' },
    ];
  }, [data]);
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const step = steps[i];

  useEffect(() => { document.body.dataset.tour = '1'; return () => { delete document.body.dataset.tour; }; }, []);
  useEffect(() => { nav(step.route); }, [i]); // eslint-disable-line
  useLayoutEffect(() => {
    let raf = 0; let tries = 0; let scrolled = false;
    const tick = () => {
      const el = document.querySelector(`[data-tour="${step.target}"]`) as HTMLElement | null;
      if (el) {
        if (!scrolled) { el.scrollIntoView({ block: 'center', behavior: 'auto' }); scrolled = true; }
        const r = el.getBoundingClientRect(); setRect((prev) => (prev && prev.top === r.top && prev.left === r.left && prev.width === r.width && prev.height === r.height ? prev : r));
      } else if (tries++ > 120) setRect(null);
      raf = requestAnimationFrame(tick);
    };
    setRect(null); raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [i, step.target]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); onExit(); }
      if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); i < steps.length - 1 ? setI(i + 1) : onExit(); }
      if (e.key === 'ArrowLeft' && i > 0) { e.preventDefault(); setI(i - 1); }
    };
    window.addEventListener('keydown', k, true); return () => window.removeEventListener('keydown', k, true);
  }, [i, steps.length, onExit]);

  const pad = 8;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const cardBottom = rect && rect.top + rect.height / 2 > vh / 2 ? false : true;
  return (
    <div className="fixed inset-0 z-[60] no-print" data-testid="walkthrough">
      {rect ? (
        <div className="pointer-events-none absolute rounded-2xl ring-4 ring-saffron-400 transition-all duration-300" style={{ top: Math.max(rect.top - pad, 4), left: Math.max(rect.left - pad, 4), width: Math.min(rect.width + pad * 2, window.innerWidth - 8), height: Math.min(rect.height + pad * 2, vh - 8), boxShadow: '0 0 0 9999px rgba(12,28,20,.55)' }} data-testid="spotlight" />
      ) : <div className="absolute inset-0 bg-[rgba(12,28,20,.55)]" />}
      <div role="dialog" aria-label={`MLA demo step ${i + 1} of ${steps.length}`} className={cx('absolute left-3 right-3 mx-auto max-w-md rounded-2xl bg-white p-5 shadow-2xl animate-fadeUp sm:left-auto sm:right-6 sm:mx-0', cardBottom ? 'bottom-4 sm:bottom-8' : 'top-4 sm:top-20')} key={i}>
        <div className="flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-wider text-saffron-600">MLA Demo · Step {i + 1} of {steps.length}</span><button aria-label="Exit demo" onClick={onExit} className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100"><X size={18} /></button></div>
        <h2 className="mt-2 text-lg font-semibold text-stone-900">{step.title}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{step.body}</p>
        <div className="mt-4 flex gap-1.5">{steps.map((_, k) => <button key={k} aria-label={`Go to step ${k + 1}`} onClick={() => setI(k)} className={cx('h-1.5 flex-1 rounded-full', k <= i ? 'bg-forest-600' : 'bg-stone-200')} />)}</div>
        <div className="mt-4 flex items-center justify-between gap-2">
          <button onClick={onExit} className="h-10 rounded-xl px-3 text-sm font-medium text-stone-600 hover:bg-stone-100">Exit</button>
          <div className="flex gap-2">
            <button onClick={() => setI(i - 1)} disabled={i === 0} className="inline-flex h-10 items-center gap-1 rounded-xl border border-stone-300 px-3 text-sm font-medium disabled:opacity-40"><ArrowLeft size={16} />Back</button>
            <button onClick={() => (i < steps.length - 1 ? setI(i + 1) : onExit())} className="inline-flex h-10 items-center gap-1 rounded-xl bg-forest-700 px-4 text-sm font-medium text-white hover:bg-forest-800">{i < steps.length - 1 ? <>Next<ArrowRight size={16} /></> : 'Finish'}</button>
          </div>
        </div>
        <p className="mt-3 hidden text-[11px] text-stone-400 sm:block">Keyboard: → / Enter next · ← back · Esc exit</p>
      </div>
    </div>
  );
}
