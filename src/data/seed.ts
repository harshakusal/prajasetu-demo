import { DemoData, Evidence, FieldVisit, HistoryEntry, INDICATORS, ISSUE_STATUSES, Issue, IssueCategory, IssueStatus, Level, Priority, Project, ProjectStatus, SchemeRequest, Village, Activity } from './types';

export const CONSTITUENCY = 'Constituency Demo';
export const CONSTITUENCY_FULL = 'Constituency Demo — Swarnapuri (fictional), Andhra Pradesh';
export const STAFF = ['K. Ravi Teja', 'P. Lakshmi Prasanna', 'M. Srinivas Rao', 'G. Anitha', 'B. Venkatesh', 'S. Haritha'];
export const STAFF_ROLES: Record<string, string> = {
  'K. Ravi Teja': 'Field Coordinator', 'P. Lakshmi Prasanna': 'Grievance Officer', 'M. Srinivas Rao': 'Projects Monitor',
  'G. Anitha': 'Welfare Desk', 'B. Venkatesh': 'Village Coordinator', 'S. Haritha': 'Village Coordinator',
};
export const DEPARTMENTS = ['Rural Water Supply', 'Panchayat Raj Engineering', 'Roads & Buildings', 'Electricity Distribution (DISCOM)', 'Gram Panchayat', 'School Education', 'Health (PHC)', 'Social Welfare / Pensions', 'Revenue (Mandal Office)', 'Agriculture', 'Public Transport (Depot)'];

function rng(seed: number) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const r = rng(20261025);
const pick = <T,>(a: readonly T[]) => a[Math.floor(r() * a.length)];
const DAY = 86400000;
export const iso = (d: Date) => d.toISOString();
export const dateOnly = (d: Date) => d.toISOString().slice(0, 10);

const VILLAGE_DEFS: [string, string, number][] = [
  ['Ammapalem', 'Swarnapuri', 3420], ['Bhavanipuram Palli', 'Swarnapuri', 2180], ['Chandravaram', 'Swarnapuri', 4860], ['Devarapalle Kota', 'Swarnapuri', 1940],
  ['Gangalakunta', 'Swarnapuri', 2730], ['Gopalapuram Lanka', 'Nallamala Thota', 1620], ['Kanakadurga Peta', 'Nallamala Thota', 5210], ['Kothapalem Sivaru', 'Nallamala Thota', 2390],
  ['Lakshmipuram Tanda', 'Nallamala Thota', 1280], ['Mallavaram', 'Nallamala Thota', 3870], ['Nagaram Palem', 'Pedda Cheruvu', 2960], ['Pedda Cheruvu', 'Pedda Cheruvu', 6140],
  ['Ramachandrapuram Agraharam', 'Pedda Cheruvu', 2050], ['Seethanagaram Palli', 'Pedda Cheruvu', 3310], ['Tummalapalle', 'Pedda Cheruvu', 1760], ['Venkatagiri Kandriga', 'Pedda Cheruvu', 2540],
];
const FACILITIES = ['Primary school', 'Upper primary school', 'Anganwadi centre', 'Village secretariat', 'Sub-health centre', 'Overhead water tank', 'Bus stop', 'Ration shop', 'Community hall', 'Library', 'High school', 'PHC (within 3 km)'];
const PRIORITY_POOL = ['Reliable drinking water in summer', 'All-weather approach road', 'Drainage before monsoon', 'Working streetlights on main lane', 'School toilet repair', 'Regular bus service to mandal HQ', 'Pension follow-ups for elderly', 'Health camp for elderly', 'Irrigation channel desilting', 'Safe crossing near school'];

type IssueTpl = [IssueCategory, string, string, string];
const ISSUE_TPLS: IssueTpl[] = [
  ['Drinking Water', 'Drinking water supply interruption', 'Piped supply to the eastern colony has been irregular for over a week; households are depending on a private tanker.', 'Rural Water Supply'],
  ['Drinking Water', 'Hand pump not working near temple street', 'Hand pump handle and chain broken; about 40 families use this source.', 'Gram Panchayat'],
  ['Drinking Water', 'Overhead tank cleaning overdue', 'Residents report sediment in tap water; tank last cleaned several months ago.', 'Rural Water Supply'],
  ['Roads', 'Damaged village road', 'Approach road to the main bazaar has deep potholes; two-wheelers slipping after rain.', 'Panchayat Raj Engineering'],
  ['Roads', 'Culvert damaged on link road', 'Culvert wall partly collapsed; heavy vehicles avoiding the route.', 'Roads & Buildings'],
  ['Roads', 'Internal CC road incomplete', 'CC road work stopped midway in SC colony lane, leaving loose gravel.', 'Panchayat Raj Engineering'],
  ['Streetlights', 'Streetlight not functioning', 'Six streetlights on the school road are not working; parents concerned about evening safety.', 'Gram Panchayat'],
  ['Streetlights', 'Streetlight pole leaning dangerously', 'Pole near bus stop leaning after strong winds; needs inspection.', 'Electricity Distribution (DISCOM)'],
  ['Drainage & Sanitation', 'Drainage blockage', 'Side drain blocked near the market; stagnant water and mosquito breeding reported.', 'Gram Panchayat'],
  ['Drainage & Sanitation', 'Garbage collection irregular', 'Door-to-door collection not happening in ward 4 for two weeks.', 'Gram Panchayat'],
  ['Pensions & Welfare', 'Pension application follow-up', 'Elderly resident applied for old-age pension; applicant wants to know current status.', 'Social Welfare / Pensions'],
  ['Pensions & Welfare', 'Widow pension disbursement query', 'Beneficiary reports missed disbursement for one month; needs follow-up with welfare office.', 'Social Welfare / Pensions'],
  ['Schools', 'Government school facility repair', 'Roof leakage in two classrooms of the primary school; classes being combined during rain.', 'School Education'],
  ['Schools', 'School toilet not usable', 'Girls\' toilet at upper primary school lacks water connection.', 'School Education'],
  ['Healthcare', 'Sub-health centre staffing', 'ANM visits reduced; residents request a fixed weekly schedule.', 'Health (PHC)'],
  ['Healthcare', 'Request for health camp', 'Residents request an eye and BP screening camp for elderly.', 'Health (PHC)'],
  ['Transport', 'Bus service discontinued', 'Morning bus to mandal headquarters stopped; students affected.', 'Public Transport (Depot)'],
  ['Electricity', 'Frequent low voltage', 'Low voltage in evenings affecting motors and household appliances.', 'Electricity Distribution (DISCOM)'],
  ['Agriculture', 'Irrigation channel desilting', 'Field channel silted; tail-end farmers not receiving water.', 'Agriculture'],
  ['Agriculture', 'Crop loss enumeration query', 'Farmers ask whether recent rain damage was enumerated.', 'Revenue (Mandal Office)'],
];
const NEXT_ACTIONS: Record<IssueStatus, string[]> = {
  'Submitted': ['Staff to review details and confirm location', 'Call resident to confirm details'],
  'Under Review': ['Identify responsible department', 'Field coordinator to inspect site'],
  'Referred': ['Follow up with department on acknowledgement', 'Share site photos with department'],
  'In Progress': ['Check work progress at site', 'Confirm expected completion date with department'],
  'Awaiting External Action': ['Await department sanction; follow up on review date', 'Escalate at mandal review meeting if no response'],
  'Resolved': ['Arrange independent verification visit', 'Collect resident confirmation and photo evidence'],
  'Verified': ['No further action — closed with evidence'],
};

function ev(label: string, description: string, at: Date, by: string, kind: Evidence['kind'] = 'Photo'): Evidence {
  return { id: 'ev-' + Math.floor(r() * 1e9).toString(36), label, description, addedAt: iso(at), addedBy: by, kind };
}

export function buildSeed(): DemoData {
  const now = new Date(); now.setHours(10, 0, 0, 0);
  const anchor = now.getTime();
  const villages: Village[] = VILLAGE_DEFS.map(([name, mandal, pop], i) => {
    const indicators = {} as Record<(typeof INDICATORS)[number], Level>;
    INDICATORS.forEach((k) => { const x = r(); indicators[k] = x < 0.45 ? 'Good' : x < 0.8 ? 'Fair' : 'Poor'; });
    const facilities = FACILITIES.filter(() => r() < 0.55).slice(0, 8);
    if (!facilities.includes('Village secretariat')) facilities.unshift('Village secretariat');
    const pr = [...PRIORITY_POOL].sort(() => r() - 0.5).slice(0, 3);
    return { id: 'V' + String(i + 1).padStart(2, '0'), name, mandal, population: pop, households: Math.round(pop / (3.6 + r())), facilities, indicators, priorities: pr, lastUpdated: iso(new Date(anchor - Math.floor(r() * 9) * DAY - Math.floor(r() * 8) * 3600000)) };
  });

  // Issues — 42, spread over ~6 months; older ones further along the pipeline.
  const issues: Issue[] = [];
  for (let i = 0; i < 42; i++) {
    const tpl = i < ISSUE_TPLS.length ? ISSUE_TPLS[i] : pick(ISSUE_TPLS);
    const v = villages[(i * 7 + Math.floor(r() * 3)) % villages.length];
    const ageDays = Math.floor(2 + (i / 42) * 170 * (0.6 + r() * 0.5));
    const submitted = new Date(anchor - ageDays * DAY - Math.floor(r() * 10) * 3600000);
    const maxIdx = ageDays < 5 ? 1 : ageDays < 14 ? 3 : ageDays < 40 ? 5 : 6;
    let idx = Math.min(maxIdx, Math.floor(r() * (maxIdx + 1.4)));
    if (ageDays > 60 && r() < 0.6) idx = Math.max(idx, 4);
    const status = ISSUE_STATUSES[idx];
    const staff = pick(STAFF);
    const by0 = 'Constituency office desk';
    const history: HistoryEntry[] = [{ id: `h${i}-0`, at: iso(submitted), by: by0, type: 'created', text: 'Issue recorded at constituency office (demo entry).', status: 'Submitted' }];
    const span = Math.max(1, ageDays - 1);
    for (let s = 1; s <= idx; s++) {
      const at = new Date(submitted.getTime() + (span * DAY * s) / (idx + 1));
      const txt: Record<number, string> = {
        1: `Reviewed by ${staff}; details confirmed with resident.`, 2: `Referred to ${tpl[3]} with site details (demo record — not an official submission).`,
        3: `${tpl[3]} acknowledged; work/inspection started.`, 4: `Awaiting sanction / material from ${tpl[3]}.`, 5: 'Department reports issue resolved; verification pending.', 6: 'Independent verification visit completed; resident confirmed outcome.',
      };
      history.push({ id: `h${i}-${s}`, at: iso(at), by: s === 6 ? 'B. Venkatesh' : staff, type: 'status', text: txt[s], status: ISSUE_STATUSES[s] });
    }
    const evidence: Evidence[] = [ev('Site photo (placeholder)', 'Photo recorded at time of complaint', submitted, by0)];
    if (idx === 6) evidence.push(ev('Verification photo (placeholder)', 'After-work photo taken during verification visit', new Date(history[history.length - 1].at), 'B. Venkatesh'));
    const lastAt = new Date(history[history.length - 1].at).getTime();
    const priority: Priority = tpl[0] === 'Drinking Water' || /dangerously|toilet/.test(tpl[1]) ? (r() < 0.6 ? 'Critical' : 'High') : (pick(['High', 'Medium', 'Medium', 'Low'] as Priority[]));
    issues.push({
      id: 'PS-ISS-' + String(i + 1).padStart(4, '0'), villageId: v.id, category: tpl[0], title: tpl[1], description: tpl[2], submittedAt: iso(submitted),
      priority, assignedTo: staff, department: idx >= 2 ? tpl[3] : '', status, nextAction: pick(NEXT_ACTIONS[status]),
      followUpDate: idx === 6 ? '' : dateOnly(new Date(Math.max(lastAt, anchor - 3 * DAY) + (2 + Math.floor(r() * 9)) * DAY)), evidence, history, source: pick(['Walk-in at office', 'Phone call', 'Village visit', 'Gram sabha']),
    });
  }
  issues.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  issues.forEach((it, i) => { it.id = 'PS-ISS-' + String(issues.length - i).padStart(4, '0'); });
  // Make sure the six headline sample issues are in the most recent set with useful statuses
  const featured: [number, IssueStatus][] = [[0, 'Submitted'], [3, 'Under Review'], [6, 'In Progress'], [8, 'Referred'], [10, 'Awaiting External Action'], [12, 'Resolved']];
  featured.forEach(([tplIdx, st], k) => {
    const it = issues[k + 1]; const tpl = ISSUE_TPLS[tplIdx];
    it.category = tpl[0]; it.title = tpl[1]; it.description = tpl[2];
    const sIdx = ISSUE_STATUSES.indexOf(st);
    it.history = it.history.filter((h) => h.type !== 'status' || ISSUE_STATUSES.indexOf(h.status!) <= sIdx);
    const curIdx = ISSUE_STATUSES.indexOf(it.history[it.history.length - 1].status ?? 'Submitted');
    for (let s = curIdx + 1; s <= sIdx; s++) it.history.push({ id: `${it.id}-f${s}`, at: iso(new Date(new Date(it.submittedAt).getTime() + s * 3600000 * 9)), by: it.assignedTo, type: 'status', text: s === 2 ? `Referred to ${tpl[3]} (demo record — not an official submission).` : `Status moved to ${ISSUE_STATUSES[s]}.`, status: ISSUE_STATUSES[s] });
    it.status = st; it.department = sIdx >= 2 ? tpl[3] : ''; it.nextAction = NEXT_ACTIONS[st][0];
    if (tplIdx === 0) it.priority = 'Critical';
    it.evidence = it.evidence.slice(0, 1);
  });

  const P: [string, string, string, string, ProjectStatus, number | null, number][] = [
    ['Protected water supply pipeline extension', 'Kanakadurga Peta', 'Drinking water', 'Rural Water Supply', 'In Progress', 48.5, 62],
    ['CC road — SC colony main lane', 'Ammapalem', 'Roads', 'Panchayat Raj Engineering', 'Completed', 18.2, 100],
    ['Primary school additional classrooms (2)', 'Chandravaram', 'Education', 'School Education', 'Delayed', 32.0, 41],
    ['LED streetlight replacement — main road', 'Pedda Cheruvu', 'Streetlights', 'Gram Panchayat', 'Completion Verified', 6.4, 100],
    ['Side drains with covers — market area', 'Mallavaram', 'Sanitation', 'Gram Panchayat', 'In Progress', 12.8, 35],
    ['Link road BT resurfacing (3.2 km)', 'Gangalakunta', 'Roads', 'Roads & Buildings', 'Approved', 96.0, 0],
    ['Overhead tank (60 KL) construction', 'Lakshmipuram Tanda', 'Drinking water', 'Rural Water Supply', 'Awaiting Approval', null, 0],
    ['Sub-health centre building repairs', 'Nagaram Palem', 'Healthcare', 'Health (PHC)', 'In Progress', 9.5, 70],
    ['Community hall renovation', 'Seethanagaram Palli', 'Community', 'Panchayat Raj Engineering', 'Proposed', null, 0],
    ['Bus shelter at junction', 'Tummalapalle', 'Transport', 'Panchayat Raj Engineering', 'Proposed', null, 0],
    ['Irrigation channel lining (1.1 km)', 'Gopalapuram Lanka', 'Agriculture', 'Agriculture', 'Delayed', 27.4, 22],
    ['School toilet block with water connection', 'Devarapalle Kota', 'Education', 'School Education', 'Completed', 7.8, 100],
    ['Anganwadi centre building', 'Kothapalem Sivaru', 'Child welfare', 'Panchayat Raj Engineering', 'Approved', 14.0, 5],
    ['Culvert reconstruction on link road', 'Venkatagiri Kandriga', 'Roads', 'Roads & Buildings', 'In Progress', 21.6, 48],
    ['Solar pumps for RO plant', 'Ramachandrapuram Agraharam', 'Drinking water', 'Rural Water Supply', 'Awaiting Approval', null, 0],
  ];
  const projects: Project[] = P.map(([title, vname, category, agency, status, budget, progress], i) => {
    const v = villages.find((x) => x.name === vname)!;
    const start = new Date(anchor - (30 + Math.floor(r() * 150)) * DAY);
    const end = new Date(start.getTime() + (90 + Math.floor(r() * 150)) * DAY);
    const ms = ['Site survey & estimate', 'Administrative sanction', 'Work order issued', 'Foundation / earthwork', 'Main structure', 'Finishing & handover'];
    const doneCount = status === 'Proposed' ? 0 : status === 'Awaiting Approval' ? 1 : status === 'Approved' ? 3 : status === 'Completed' || status === 'Completion Verified' ? 6 : Math.max(3, Math.round(progress / 20) + 2);
    const milestones = ms.map((m, k) => ({ id: `m${i}-${k}`, title: m, due: dateOnly(new Date(start.getTime() + ((end.getTime() - start.getTime()) * (k + 1)) / ms.length)), done: k < Math.min(6, doneCount) }));
    const evidence: Evidence[] = [];
    if (doneCount >= 3) evidence.push(ev('Work order copy (placeholder)', 'Document placeholder — demo only', new Date(start.getTime() + 20 * DAY), 'M. Srinivas Rao', 'Document'));
    if (progress > 30) evidence.push(ev('Site progress photo (placeholder)', `Progress around ${progress}%`, new Date(anchor - Math.floor(r() * 12) * DAY), 'M. Srinivas Rao'));
    if (status === 'Completion Verified') evidence.push(ev('Completion inspection note (placeholder)', 'Independent check by village coordinator with residents', new Date(anchor - 6 * DAY), 'S. Haritha', 'Inspection note'));
    const pre = status === 'Proposed' || status === 'Awaiting Approval';
    const updates = [{ id: `u${i}-0`, at: iso(new Date(anchor - (3 + Math.floor(r() * 20)) * DAY)), by: 'M. Srinivas Rao', text: pre ? (status === 'Proposed' ? 'Proposal documented from gram sabha request; estimate not yet prepared.' : 'Estimate submitted; awaiting administrative sanction.') : status === 'Delayed' ? 'Work paused — see delay reason.' : status === 'Approved' ? 'Sanction received; contractor mobilisation pending.' : status.startsWith('Complet') ? 'Work completed and handed over.' : `Work progressing — about ${progress}% complete.` }];
    return {
      id: 'PS-PRJ-' + String(i + 1).padStart(3, '0'), title, villageId: v.id, category, agency, status, budgetLakh: pre ? null : budget,
      startDate: pre ? '' : dateOnly(start), expectedCompletion: pre ? '' : dateOnly(end), progress, milestones, evidence,
      delayReason: status === 'Delayed' ? (category === 'Education' ? 'Contractor re-tendering after original agency withdrew.' : 'Water release in canal delayed lining work; resumes after crop season.') : '',
      nextReviewDate: dateOnly(new Date(anchor + (2 + Math.floor(r() * 20)) * DAY)),
      nextAction: pre ? (status === 'Proposed' ? 'Prepare estimate with engineering wing' : 'Follow up on sanction at district review') : status === 'Completed' ? 'Arrange independent completion verification' : status === 'Completion Verified' ? 'Monitor maintenance after 6 months' : status === 'Delayed' ? 'Escalate delay at monthly review' : 'Site inspection at next review', updates,
    };
  });

  const schemes: SchemeRequest[] = [
    ['Pension', 'Elderly resident asked about old-age pension process', 'Information shared — verify with official source', 'Follow-up pending'],
    ['Housing', 'Family asked how to apply for housing assistance', 'Documents being gathered', 'Not referred'],
    ['Agriculture support', 'Tenant farmer asked about input-support schemes', 'Referred for official eligibility check', 'Referred to concerned office'],
    ['Education', 'Parent asked about post-matric scholarship process', 'Information shared — verify with official source', 'Closed — information provided'],
    ['Health', 'Patient family asked about hospital treatment assistance', 'Referred for official eligibility check', 'Referred to concerned office'],
    ['Livelihood & skills', 'Youth asked about skill training enrolment', 'Not yet checked', 'Not referred'],
    ['Pension', 'Person with disability asked about pension application', 'Documents being gathered', 'Follow-up pending'],
    ['Agriculture support', 'Farmer asked about crop insurance claim process', 'Outcome communicated by office', 'Closed — information provided'],
  ].map(([category, summary, eligibility, referral], i) => ({
    id: 'PS-SCH-' + String(i + 1).padStart(3, '0'), villageId: villages[(i * 5 + 2) % villages.length].id, category, summary, eligibility, referral,
    documents: ['Identity proof (as specified by official source)', 'Address / residence proof', 'Category-specific documents — verify with official source'],
    nextAction: referral === 'Closed — information provided' ? 'None — closed' : 'Call applicant to confirm documents and next office visit', createdAt: iso(new Date(anchor - (2 + i * 4) * DAY)), staff: 'G. Anitha',
  })) as SchemeRequest[];

  const CHECK = ['Inspect open issues on site', 'Meet village secretariat staff', 'Check drinking water points', 'Check school & anganwadi facilities', 'Photograph evidence (placeholder)', 'Collect resident feedback'];
  const visits: FieldVisit[] = [-9, -5, -2, 1, 2, 4, 6].map((d, i) => {
    const v = villages[(i * 3 + 1) % villages.length];
    const done = d < 0;
    const vi = issues.filter((x) => x.villageId === v.id && x.status !== 'Verified').slice(0, 3).map((x) => x.id);
    return {
      id: 'PS-VIS-' + String(i + 1).padStart(3, '0'), villageId: v.id, date: dateOnly(new Date(anchor + d * DAY)), staff: STAFF[(i + 3) % STAFF.length],
      purpose: done ? 'Follow-up inspection of open issues' : pick(['Pre-monsoon drainage inspection', 'Drinking water review', 'Project site review', 'Verification of resolved issues']),
      checklist: CHECK.map((c, k) => ({ id: `c${i}-${k}`, label: c, done: done ? true : k < (d < 3 ? 1 : 0) })), issueIds: vi,
      followUps: [{ id: `f${i}-0`, label: 'Share inspection notes with grievance desk', done }, { id: `f${i}-1`, label: 'Confirm follow-up dates with departments', done: false }],
      notes: done ? 'Visited sites with village secretariat staff; residents shared priorities. (Demo note)' : '', evidence: done ? [ev('Visit photo (placeholder)', 'Group photo at secretariat — placeholder', new Date(anchor + d * DAY), STAFF[(i + 3) % STAFF.length])] : [],
      nextVisitDate: dateOnly(new Date(anchor + (d + 21) * DAY)), status: done ? 'Completed' : 'Scheduled',
    };
  });

  const data: DemoData = { version: 1, anchor: iso(now), villages, issues, projects, schemes, visits, activity: [] };
  data.activity = deriveSeedActivity(data);
  return data;
}

function deriveSeedActivity(d: DemoData): Activity[] {
  const vn = (id: string) => d.villages.find((v) => v.id === id)?.name ?? '';
  const a: Activity[] = [];
  d.issues.forEach((it) => it.history.forEach((h) => a.push({ id: 'a-' + h.id, at: h.at, kind: 'issue', link: `/issues?id=${it.id}`, text: h.type === 'created' ? `${it.id} recorded — ${it.title} (${vn(it.villageId)})` : `${it.id} → ${h.status} · ${vn(it.villageId)}` })));
  d.projects.forEach((p) => p.updates.forEach((u) => a.push({ id: 'a-' + u.id, at: u.at, kind: 'project', link: `/projects?id=${p.id}`, text: `${p.title}: ${u.text}` })));
  d.visits.filter((v) => v.status === 'Completed').forEach((v) => a.push({ id: 'a-' + v.id, at: v.date + 'T12:00:00.000Z', kind: 'visit', link: `/field?id=${v.id}`, text: `Field visit completed at ${vn(v.villageId)} by ${v.staff}` }));
  return a.sort((x, y) => y.at.localeCompare(x.at)).slice(0, 60);
}
