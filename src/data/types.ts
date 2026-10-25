export const ISSUE_STATUSES = ['Submitted', 'Under Review', 'Referred', 'In Progress', 'Awaiting External Action', 'Resolved', 'Verified'] as const;
export type IssueStatus = (typeof ISSUE_STATUSES)[number];
export const PROJECT_STATUSES = ['Proposed', 'Awaiting Approval', 'Approved', 'In Progress', 'Delayed', 'Completed', 'Completion Verified'] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'] as const;
export type Priority = (typeof PRIORITIES)[number];
export const ISSUE_CATEGORIES = ['Drinking Water', 'Roads', 'Streetlights', 'Drainage & Sanitation', 'Pensions & Welfare', 'Schools', 'Healthcare', 'Transport', 'Electricity', 'Agriculture'] as const;
export type IssueCategory = (typeof ISSUE_CATEGORIES)[number];
export const INDICATORS = ['Water', 'Roads', 'Sanitation', 'Streetlights', 'Schools', 'Healthcare', 'Transport'] as const;
export type Indicator = (typeof INDICATORS)[number];
export type Level = 'Good' | 'Fair' | 'Poor';

export interface Evidence { id: string; label: string; description: string; addedAt: string; addedBy: string; kind: 'Photo' | 'Document' | 'Inspection note' }
export interface HistoryEntry { id: string; at: string; by: string; type: 'created' | 'status' | 'note' | 'update' | 'assign' | 'followup' | 'evidence' | 'edit'; text: string; status?: IssueStatus }

export interface Village {
  id: string; name: string; mandal: string; population: number; households: number;
  facilities: string[]; indicators: Record<Indicator, Level>; priorities: string[]; lastUpdated: string;
}
export interface Issue {
  id: string; villageId: string; category: IssueCategory; title: string; description: string; submittedAt: string;
  priority: Priority; assignedTo: string; department: string; status: IssueStatus; nextAction: string; followUpDate: string;
  evidence: Evidence[]; history: HistoryEntry[]; source: string;
}
export interface Milestone { id: string; title: string; due: string; done: boolean }
export interface ProjectUpdate { id: string; at: string; by: string; text: string }
export interface Project {
  id: string; title: string; villageId: string; category: string; agency: string; status: ProjectStatus;
  budgetLakh: number | null; startDate: string; expectedCompletion: string; progress: number; milestones: Milestone[];
  evidence: Evidence[]; delayReason: string; nextReviewDate: string; nextAction: string; updates: ProjectUpdate[];
}
export const SCHEME_CATEGORIES = ['Pension', 'Housing', 'Agriculture support', 'Education', 'Health', 'Livelihood & skills', 'Other'] as const;
export const ELIGIBILITY = ['Not yet checked', 'Information shared — verify with official source', 'Documents being gathered', 'Referred for official eligibility check', 'Outcome communicated by office'] as const;
export const REFERRAL = ['Not referred', 'Referred to concerned office', 'Follow-up pending', 'Closed — information provided'] as const;
export interface SchemeRequest {
  id: string; villageId: string; category: (typeof SCHEME_CATEGORIES)[number]; summary: string;
  eligibility: (typeof ELIGIBILITY)[number]; documents: string[]; referral: (typeof REFERRAL)[number]; nextAction: string; createdAt: string; staff: string;
}
export interface ChecklistItem { id: string; label: string; done: boolean }
export interface FieldVisit {
  id: string; villageId: string; date: string; staff: string; purpose: string; checklist: ChecklistItem[]; issueIds: string[];
  followUps: ChecklistItem[]; notes: string; evidence: Evidence[]; nextVisitDate: string; status: 'Scheduled' | 'Completed';
}
export interface Activity { id: string; at: string; text: string; kind: 'issue' | 'project' | 'visit' | 'scheme'; link: string }
export interface DemoData {
  version: number; anchor: string; villages: Village[]; issues: Issue[]; projects: Project[]; schemes: SchemeRequest[]; visits: FieldVisit[]; activity: Activity[];
}
