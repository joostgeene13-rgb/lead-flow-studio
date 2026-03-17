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
  color: string; // HSL string for the highlight color
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
  notes: string;
  codedSegments?: CodedSegment[];
  createdAt: string;
  updatedAt: string;
}

// Default code colors (HSL)
export const DEFAULT_CODE_COLORS = [
  "210 100% 56%",  // blue
  "142 71% 45%",   // green
  "38 92% 50%",    // amber
  "0 84% 60%",     // red
  "262 83% 58%",   // purple
  "174 72% 40%",   // teal
  "330 81% 60%",   // pink
  "25 95% 53%",    // orange
];
