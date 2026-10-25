import React, { useEffect, useRef } from 'react';
import { X, Check, Inbox, Camera, FileText, ClipboardCheck } from 'lucide-react';
import { ISSUE_STATUSES, IssueStatus, Priority, ProjectStatus, Evidence } from '../data/types';

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');
export const fmtDate = (s: string) => (s ? new Date(s.length === 10 ? s + 'T00:00:00' : s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
export const fmtDateTime = (s: string) => new Date(s).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
export function ago(s: string) {
  const d = (Date.now() - new Date(s).getTime()) / 1000;
  if (d < 60) return 'just now'; if (d < 3600) return `${Math.floor(d / 60)} min ago`; if (d < 86400) return `${Math.floor(d / 3600)} h ago`;
  const days = Math.floor(d / 86400); return days < 30 ? `${days} d ago` : fmtDate(s);
}

export function Card({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cx('rounded-2xl border border-stone-200/80 bg-white shadow-card', className)} {...rest}>{children}</div>;
}
export function CardHeader({ title, subtitle, action }: { title: React.ReactNode; subtitle?: React.ReactNode; action?: React.ReactNode }) {
  return <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3"><div className="min-w-0"><h3 className="text-[15px] font-semibold text-stone-900">{title}</h3>{subtitle && <p className="mt-0.5 text-xs text-stone-500">{subtitle}</p>}</div>{action && <div className="shrink-0">{action}</div>}</div>;
}
type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'saffron' | 'danger'; size?: 'sm' | 'md' };
export function Button({ variant = 'secondary', size = 'md', className, ...rest }: BtnProps) {
  const v = { primary: 'bg-forest-700 text-white hover:bg-forest-800 shadow-sm', secondary: 'bg-white text-stone-800 border border-stone-300 hover:bg-stone-50', ghost: 'text-stone-700 hover:bg-stone-100', saffron: 'bg-saffron-500 text-white hover:bg-saffron-600 shadow-sm', danger: 'bg-white text-red-700 border border-red-200 hover:bg-red-50' }[variant];
  return <button className={cx('inline-flex items-center justify-center gap-2 rounded-xl font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed', size === 'sm' ? 'h-9 px-3 text-sm' : 'h-11 px-4 text-sm', v, className)} {...rest} />;
}
export function Badge({ children, tone = 'grey', className }: { children: React.ReactNode; tone?: 'green' | 'saffron' | 'grey' | 'red' | 'amber' | 'teal' | 'violet' | 'blue'; className?: string }) {
  const t = { green: 'bg-forest-50 text-forest-800 ring-forest-200', saffron: 'bg-saffron-50 text-saffron-700 ring-saffron-200', grey: 'bg-stone-100 text-stone-700 ring-stone-200', red: 'bg-red-50 text-red-700 ring-red-200', amber: 'bg-amber-50 text-amber-800 ring-amber-200', teal: 'bg-teal-50 text-teal-800 ring-teal-200', violet: 'bg-violet-50 text-violet-800 ring-violet-200', blue: 'bg-sky-50 text-sky-800 ring-sky-200' }[tone];
  return <span className={cx('inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset', t, className)}>{children}</span>;
}
export const STATUS_TONE: Record<IssueStatus, Parameters<typeof Badge>[0]['tone']> = { 'Submitted': 'grey', 'Under Review': 'blue', 'Referred': 'violet', 'In Progress': 'teal', 'Awaiting External Action': 'amber', 'Resolved': 'saffron', 'Verified': 'green' };
export const StatusBadge = ({ s }: { s: IssueStatus }) => <Badge tone={STATUS_TONE[s]}>{s === 'Verified' && <Check size={12} />}{s}</Badge>;
export const PRIORITY_TONE: Record<Priority, Parameters<typeof Badge>[0]['tone']> = { Critical: 'red', High: 'saffron', Medium: 'amber', Low: 'grey' };
export const PriorityBadge = ({ p }: { p: Priority }) => <Badge tone={PRIORITY_TONE[p]}>{p}</Badge>;
export const PROJECT_TONE: Record<ProjectStatus, Parameters<typeof Badge>[0]['tone']> = { 'Proposed': 'grey', 'Awaiting Approval': 'blue', 'Approved': 'violet', 'In Progress': 'teal', 'Delayed': 'red', 'Completed': 'saffron', 'Completion Verified': 'green' };
export const ProjectBadge = ({ s }: { s: ProjectStatus }) => <Badge tone={PROJECT_TONE[s]}>{s === 'Completion Verified' && <Check size={12} />}{s}</Badge>;

export function Stepper({ status }: { status: IssueStatus }) {
  const cur = ISSUE_STATUSES.indexOf(status);
  return (
    <ol className="flex w-full items-start" aria-label="Issue status progress">
      {ISSUE_STATUSES.map((s, i) => (
        <li key={s} className="relative flex flex-1 flex-col items-center text-center">
          {i > 0 && <span className={cx('absolute right-1/2 top-3 h-0.5 w-full', i <= cur ? 'bg-forest-600' : 'bg-stone-200')} />}
          <span className={cx('relative z-10 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ring-2', i < cur ? 'bg-forest-600 text-white ring-forest-600' : i === cur ? (s === 'Verified' ? 'bg-forest-600 text-white ring-forest-200' : 'bg-saffron-500 text-white ring-saffron-200') : 'bg-white text-stone-400 ring-stone-200')} aria-current={i === cur ? 'step' : undefined}>
            {i < cur || (i === cur && s === 'Verified') ? <Check size={13} /> : i + 1}
          </span>
          <span className={cx('mt-1.5 hidden px-0.5 text-[10.5px] leading-tight sm:block', i === cur ? 'font-semibold text-stone-900' : 'text-stone-500')}>{s}</span>
        </li>
      ))}
    </ol>
  );
}
export function Progress({ value, tone = 'green' }: { value: number; tone?: 'green' | 'red' | 'saffron' | 'grey' }) {
  const c = { green: 'bg-forest-600', red: 'bg-red-500', saffron: 'bg-saffron-500', grey: 'bg-stone-300' }[tone];
  return <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}><div className={cx('h-full rounded-full transition-all duration-700', c)} style={{ width: `${value}%` }} /></div>;
}
export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: React.ReactNode }) {
  return <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-cream-50 px-6 py-12 text-center"><Inbox className="text-stone-400" size={28} /><p className="mt-3 font-medium text-stone-800">{title}</p>{hint && <p className="mt-1 max-w-sm text-sm text-stone-500">{hint}</p>}{action && <div className="mt-4">{action}</div>}</div>;
}
export function Skeleton({ className }: { className?: string }) { return <div className={cx('animate-pulse rounded-xl bg-stone-200/70', className)} />; }

export function Drawer({ open, onClose, title, subtitle, children, footer, wide }: { open: boolean; onClose: () => void; title: React.ReactNode; subtitle?: React.ReactNode; children: React.ReactNode; footer?: React.ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (!open) return; const k = (e: KeyboardEvent) => { if (e.key === 'Escape' && !document.body.dataset.tour) onClose(); }; window.addEventListener('keydown', k); ref.current?.focus(); return () => window.removeEventListener('keydown', k); }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 no-print" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-stone-900/30 backdrop-blur-[1px]" onClick={onClose} />
      <div ref={ref} tabIndex={-1} data-drawer className={cx('absolute right-0 top-0 flex h-full w-full flex-col bg-white shadow-2xl outline-none animate-slideIn', wide ? 'max-w-3xl' : 'max-w-2xl')}>
        <div className="flex items-start justify-between gap-3 border-b border-stone-200 px-5 py-4 sm:px-6"><div className="min-w-0">{subtitle && <div className="mb-1 text-xs text-stone-500">{subtitle}</div>}<h2 className="text-lg font-semibold text-stone-900">{title}</h2></div><button aria-label="Close panel" onClick={onClose} className="rounded-lg p-2 text-stone-500 hover:bg-stone-100"><X size={20} /></button></div>
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer && <div className="border-t border-stone-200 bg-cream-50 px-5 py-3 sm:px-6">{footer}</div>}
      </div>
    </div>
  );
}
export function Modal({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; footer?: React.ReactNode }) {
  useEffect(() => { if (!open) return; const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4 no-print" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-stone-900/40" onClick={onClose} />
      <div className="relative flex max-h-[92vh] w-full max-w-xl flex-col rounded-t-2xl bg-white shadow-2xl animate-fadeUp sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4"><h2 className="text-lg font-semibold">{title}</h2><button aria-label="Close" onClick={onClose} className="rounded-lg p-2 text-stone-500 hover:bg-stone-100"><X size={20} /></button></div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-stone-200 px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}
export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return <label className="block"><span className="mb-1.5 block text-sm font-medium text-stone-700">{label}</span>{children}{hint && <span className="mt-1 block text-xs text-stone-500">{hint}</span>}</label>;
}
export const inputCls = 'w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-100';
export function Select({ value, onChange, options, label, className, ...rest }: { value: string; onChange: (v: string) => void; options: readonly (string | { value: string; label: string })[]; label?: string; className?: string } & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'>) {
  return <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className={cx(inputCls, 'h-11 py-0 pr-8', className)} {...rest}>{options.map((o) => typeof o === 'string' ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}</select>;
}
export function EvidenceList({ items }: { items: Evidence[] }) {
  if (!items.length) return <p className="rounded-xl border border-dashed border-stone-300 bg-cream-50 p-4 text-sm text-stone-500">No evidence attached yet.</p>;
  const Icon = (k: Evidence['kind']) => (k === 'Photo' ? Camera : k === 'Document' ? FileText : ClipboardCheck);
  return <div className="grid gap-2 sm:grid-cols-2">{items.map((e) => { const I = Icon(e.kind); return (
    <div key={e.id} className="flex gap-3 rounded-xl border border-stone-200 bg-cream-50 p-3">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-forest-50 to-stone-100 text-forest-700"><I size={20} /></div>
      <div className="min-w-0 text-sm"><p className="font-medium text-stone-800">{e.label}</p><p className="text-xs text-stone-500">{e.description}</p><p className="mt-0.5 text-[11px] text-stone-400">{e.kind} placeholder · {fmtDate(e.addedAt)} · {e.addedBy}</p></div>
    </div>); })}</div>;
}
export function DemoNote({ className }: { className?: string }) {
  return <p className={cx('text-xs text-stone-500', className)}>Illustrative demo data — not official constituency records.</p>;
}
export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-[28px]">{title}</h1>{subtitle && <p className="mt-1 max-w-2xl text-sm text-stone-600">{subtitle}</p>}</div>{actions && <div className="flex flex-wrap gap-2">{actions}</div>}</div>;
}
export function Stat({ label, value, hint, icon, tone = 'green' }: { label: string; value: React.ReactNode; hint?: string; icon?: React.ReactNode; tone?: 'green' | 'saffron' | 'grey' }) {
  const t = { green: 'bg-forest-50 text-forest-700', saffron: 'bg-saffron-50 text-saffron-700', grey: 'bg-stone-100 text-stone-700' }[tone];
  return <Card className="p-4 sm:p-5 animate-fadeUp"><div className="flex items-start justify-between gap-2"><p className="text-[13px] font-medium text-stone-600">{label}</p>{icon && <span className={cx('rounded-lg p-1.5', t)}>{icon}</span>}</div><p className="mt-2 text-3xl font-semibold tracking-tight text-stone-900 tabular-nums">{value}</p>{hint && <p className="mt-1 text-xs text-stone-500">{hint}</p>}</Card>;
}
