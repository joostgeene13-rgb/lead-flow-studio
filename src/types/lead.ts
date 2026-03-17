export const LEAD_STATUSES = [
  "To Contact",
  "Message Sent",
  "In Conversation",
  "Interview Scheduled",
  "Completed",
  "Dropped",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export interface Lead {
  id: string;
  fullName: string;
  jobTitle: string;
  company: string;
  status: LeadStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}
