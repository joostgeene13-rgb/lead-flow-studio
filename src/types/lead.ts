export const LEAD_STATUSES = [
  "To Contact",
  "Message Sent",
  "In Conversation",
  "Interview Scheduled",
  "Completed",
  "Dropped",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export interface NoteCode {
  id: string;
  label: string;
  color: string;
}

export interface CodedSegment {
  id: string;
  codeId: string;
  startIndex: number;
  endIndex: number;
  text: string;
}

export interface Lead {
  id: string;
  fullName: string;
  jobTitle: string;
  company: string;
  status: LeadStatus;
  statusDate: string; // ISO timestamp — updates on every status change
  notes: string;
  codedSegments?: CodedSegment[];
  createdAt: string;
  updatedAt: string;
}

// Default code colors (HSL)
export const DEFAULT_CODE_COLORS = [
  "210 100% 56%",
  "142 71% 45%",
  "38 92% 50%",
  "0 84% 60%",
  "262 83% 58%",
  "174 72% 40%",
  "330 81% 60%",
  "25 95% 53%",
];

/** Days before a "Message Sent" lead is considered stale */
export const STALE_DAYS = 5;
