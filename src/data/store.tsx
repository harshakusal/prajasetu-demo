import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { buildSeed } from './seed';
import { Activity, DemoData, Evidence, FieldVisit, HistoryEntry, ISSUE_STATUSES, Issue, IssueStatus, Project, SchemeRequest } from './types';

const KEY = 'prajasetu-demo-v1';
export const CURRENT_USER = 'Demo Staff (Coordinator)';
const uid = (p: string) => p + '-' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36);

function load(): DemoData {
  try { const raw = localStorage.getItem(KEY); if (raw) { const d = JSON.parse(raw) as DemoData; if (d.version === 1 && d.issues) return d; } } catch { /* ignore */ }
  return buildSeed();
}

export interface Toast { id: string; text: string; tone: 'success' | 'error' | 'info' }
interface Ctx {
  data: DemoData;
  toasts: Toast[];
  toast: (text: string, tone?: Toast['tone']) => void;
  dismissToast: (id: string) => void;
  reset: () => void;
  village: (id: string) => DemoData['villages'][number] | undefined;
  updateIssue: (id: string, patch: Partial<Issue>, entry?: Omit<HistoryEntry, 'id' | 'at' | 'by'>) => void;
  setIssueStatus: (id: string, status: IssueStatus, note?: string) => { ok: boolean; message: string };
  addIssueEvidence: (id: string, e: Omit<Evidence, 'id' | 'addedAt' | 'addedBy'>) => void;
  createIssue: (i: Omit<Issue, 'id' | 'history' | 'evidence' | 'status' | 'submittedAt'>) => string;
  updateProject: (id: string, patch: Partial<Project>, update?: string) => void;
  createProject: (p: Omit<Project, 'id' | 'updates' | 'evidence'>) => string;
  addProjectEvidence: (id: string, e: Omit<Evidence, 'id' | 'addedAt' | 'addedBy'>) => void;
  saveScheme: (s: SchemeRequest | Omit<SchemeRequest, 'id' | 'createdAt'>) => string;
  saveVisit: (v: FieldVisit | Omit<FieldVisit, 'id'>, msg?: string) => string;
  unread: number;
  markRead: () => void;
}
const C = createContext<Ctx | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<DemoData>(load);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [unread, setUnread] = useState(4);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* ignore */ } }, [data]);

  const toast = useCallback((text: string, tone: Toast['tone'] = 'success') => {
    const id = uid('t'); setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);
  const dismissToast = useCallback((id: string) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const vname = (d: DemoData, id: string) => d.villages.find((v) => v.id === id)?.name ?? '';
  const pushAct = (d: DemoData, a: Omit<Activity, 'id' | 'at'>): Activity[] => { setUnread((u) => u + 1); return [{ ...a, id: uid('a'), at: new Date().toISOString() }, ...d.activity].slice(0, 80); };

  const updateIssue: Ctx['updateIssue'] = (id, patch, entry) => setData((d) => {
    const issues = d.issues.map((i) => i.id !== id ? i : { ...i, ...patch, history: entry ? [...i.history, { ...entry, id: uid('h'), at: new Date().toISOString(), by: CURRENT_USER }] : i.history });
    const it = issues.find((i) => i.id === id)!;
    return { ...d, issues, activity: entry ? pushAct(d, { kind: 'issue', link: `/issues?id=${id}`, text: `${id} · ${entry.text} (${vname(d, it.villageId)})` }) : d.activity };
  });
  const setIssueStatus: Ctx['setIssueStatus'] = (id, status, note) => {
    const it = data.issues.find((i) => i.id === id);
    if (!it) return { ok: false, message: 'Issue not found' };
    if (status === 'Verified') {
      if (it.status !== 'Resolved') return { ok: false, message: 'Only issues marked Resolved can be Verified. Mark it Resolved first.' };
      const after = it.history.filter((h) => h.status === 'Resolved').map((h) => h.at).pop() ?? '';
      if (!it.evidence.some((e) => e.addedAt >= after)) return { ok: false, message: 'Evidence required: attach verification evidence (photo, document or inspection note) recorded after resolution before marking Verified.' };
    }
    if (status === 'Referred' && !it.department) return { ok: false, message: 'Identify the responsible department before marking Referred.' };
    updateIssue(id, { status, followUpDate: status === 'Verified' ? '' : it.followUpDate }, { type: 'status', status, text: `Status changed to ${status}${note ? ' — ' + note : ''}` });
    return { ok: true, message: `${id} moved to ${status}` };
  };
  const addIssueEvidence: Ctx['addIssueEvidence'] = (id, e) => setData((d) => ({
    ...d, issues: d.issues.map((i) => i.id !== id ? i : { ...i, evidence: [...i.evidence, { ...e, id: uid('ev'), addedAt: new Date().toISOString(), addedBy: CURRENT_USER }], history: [...i.history, { id: uid('h'), at: new Date().toISOString(), by: CURRENT_USER, type: 'evidence', text: `Evidence attached: ${e.label}` }] }),
    activity: pushAct(d, { kind: 'issue', link: `/issues?id=${id}`, text: `${id} · evidence attached (${e.label})` }),
  }));
  const createIssue: Ctx['createIssue'] = (i) => {
    const n = Math.max(0, ...data.issues.map((x) => parseInt(x.id.slice(7), 10))) + 1;
    const id = 'PS-ISS-' + String(n).padStart(4, '0'); const at = new Date().toISOString();
    setData((d) => ({ ...d, issues: [{ ...i, id, status: 'Submitted', submittedAt: at, evidence: [], history: [{ id: uid('h'), at, by: CURRENT_USER, type: 'created', status: 'Submitted', text: 'Issue recorded locally in demo (not sent to any department).' }] }, ...d.issues], activity: pushAct(d, { kind: 'issue', link: `/issues?id=${id}`, text: `${id} recorded — ${i.title} (${vname(d, i.villageId)})` }) }));
    return id;
  };
  const updateProject: Ctx['updateProject'] = (id, patch, update) => setData((d) => {
    const projects = d.projects.map((p) => p.id !== id ? p : { ...p, ...patch, updates: update ? [{ id: uid('u'), at: new Date().toISOString(), by: CURRENT_USER, text: update }, ...p.updates] : p.updates });
    const p = projects.find((x) => x.id === id)!;
    return { ...d, projects, activity: update ? pushAct(d, { kind: 'project', link: `/projects?id=${id}`, text: `${p.title}: ${update}` }) : d.activity };
  });
  const createProject: Ctx['createProject'] = (p) => {
    const n = Math.max(0, ...data.projects.map((x) => parseInt(x.id.slice(7), 10))) + 1; const id = 'PS-PRJ-' + String(n).padStart(3, '0');
    setData((d) => ({ ...d, projects: [{ ...p, id, evidence: [], updates: [{ id: uid('u'), at: new Date().toISOString(), by: CURRENT_USER, text: 'Project added to ledger (demo).' }] }, ...d.projects], activity: pushAct(d, { kind: 'project', link: `/projects?id=${id}`, text: `New project added: ${p.title}` }) }));
    return id;
  };
  const addProjectEvidence: Ctx['addProjectEvidence'] = (id, e) => setData((d) => ({
    ...d, projects: d.projects.map((p) => p.id !== id ? p : { ...p, evidence: [...p.evidence, { ...e, id: uid('ev'), addedAt: new Date().toISOString(), addedBy: CURRENT_USER }] }),
    activity: pushAct(d, { kind: 'project', link: `/projects?id=${id}`, text: `${id} · evidence attached (${e.label})` }),
  }));
  const saveScheme: Ctx['saveScheme'] = (s) => {
    if ('id' in s) { setData((d) => ({ ...d, schemes: d.schemes.map((x) => (x.id === s.id ? s : x)) })); return s.id; }
    const n = Math.max(0, ...data.schemes.map((x) => parseInt(x.id.slice(7), 10))) + 1; const id = 'PS-SCH-' + String(n).padStart(3, '0');
    setData((d) => ({ ...d, schemes: [{ ...s, id, createdAt: new Date().toISOString() }, ...d.schemes], activity: pushAct(d, { kind: 'scheme', link: `/schemes?id=${id}`, text: `Scheme assistance request ${id} recorded (${s.category})` }) }));
    return id;
  };
  const saveVisit: Ctx['saveVisit'] = (v, msg) => {
    if ('id' in v) { setData((d) => ({ ...d, visits: d.visits.map((x) => (x.id === v.id ? v : x)), activity: msg ? pushAct(d, { kind: 'visit', link: `/field?id=${v.id}`, text: msg }) : d.activity })); return v.id; }
    const n = Math.max(0, ...data.visits.map((x) => parseInt(x.id.slice(7), 10))) + 1; const id = 'PS-VIS-' + String(n).padStart(3, '0');
    setData((d) => ({ ...d, visits: [...d.visits, { ...v, id }], activity: pushAct(d, { kind: 'visit', link: `/field?id=${id}`, text: `Field visit ${id} scheduled at ${vname(d, v.villageId)} — ${v.staff}` }) }));
    return id;
  };
  const reset = () => { localStorage.removeItem(KEY); setData(buildSeed()); setUnread(0); };
  const village = useCallback((id: string) => data.villages.find((v) => v.id === id), [data.villages]);

  const value: Ctx = { data, toasts, toast, dismissToast, reset, village, updateIssue, setIssueStatus, addIssueEvidence, createIssue, updateProject, createProject, addProjectEvidence, saveScheme, saveVisit, unread, markRead: () => setUnread(0) };
  return <C.Provider value={value}>{children}</C.Provider>;
}
export function useData() { const c = useContext(C); if (!c) throw new Error('no provider'); return c; }

// ---------- derived metrics ----------
export const statusIdx = (s: IssueStatus) => ISSUE_STATUSES.indexOf(s);
export function reachedAt(i: Issue, s: IssueStatus): string | null {
  const h = i.history.find((x) => x.status === s); return h ? h.at : null;
}
export function issueStats(issues: Issue[]) {
  const by = (s: IssueStatus) => issues.filter((i) => i.status === s).length;
  return {
    total: issues.length,
    awaitingReview: by('Submitted') + by('Under Review'),
    referred: issues.filter((i) => statusIdx(i.status) >= 2 && i.department).length,
    inProgress: by('In Progress') + by('Awaiting External Action'),
    resolved: by('Resolved'),
    verified: by('Verified'),
    open: issues.filter((i) => statusIdx(i.status) < 5).length,
    by,
  };
}
export const ACTIVE_PROJECT: Project['status'][] = ['Approved', 'In Progress', 'Delayed'];
export function useMetrics() {
  const { data } = useData();
  return useMemo(() => {
    const s = issueStats(data.issues);
    const activeProjects = data.projects.filter((p) => ACTIVE_PROJECT.includes(p.status)).length;
    const verifiedProjects = data.projects.filter((p) => p.status === 'Completion Verified').length;
    return { ...s, activeProjects, verifiedProjects, villages: data.villages.length };
  }, [data]);
}
export function villageHealth(d: DemoData, vid: string): 'attention' | 'watch' | 'stable' {
  const open = d.issues.filter((i) => i.villageId === vid && statusIdx(i.status) < 5);
  if (open.some((i) => i.priority === 'Critical') || open.length >= 4) return 'attention';
  if (open.length >= 2 || d.projects.some((p) => p.villageId === vid && p.status === 'Delayed')) return 'watch';
  return 'stable';
}
