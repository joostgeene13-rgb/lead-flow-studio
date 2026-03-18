import type { Lead } from "@/types/lead";
import { STALE_DAYS } from "@/types/lead";
import { Building2, StickyNote, AlertTriangle } from "lucide-react";

interface LeadCardProps {
  lead: Lead;
  onClick: (lead: Lead) => void;
}

function isStale(lead: Lead): boolean {
  if (lead.status !== "Message Sent") return false;
  const diffMs = Date.now() - new Date(lead.statusDate).getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays >= STALE_DAYS;
}

export function LeadCard({ lead, onClick }: LeadCardProps) {
  const stale = isStale(lead);

  return (
    <button
      onClick={() => onClick(lead)}
      className={`w-full text-left rounded-lg border p-3 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        stale
          ? "border-destructive bg-destructive/5 hover:bg-destructive/10"
          : "border-border bg-card hover:border-accent/40"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-card-foreground truncate">
          {lead.fullName}
        </p>
        {stale && (
          <span title="Follow-up nodig! 5+ dagen zonder reactie">
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
          </span>
        )}
      </div>
      {lead.jobTitle && (
        <p className="mt-0.5 text-xs text-muted-foreground truncate">{lead.jobTitle}</p>
      )}
      {lead.company && (
        <div className="mt-1 flex items-center gap-1.5 text-muted-foreground">
          <Building2 className="h-3 w-3 shrink-0" />
          <span className="text-xs truncate">{lead.company}</span>
        </div>
      )}
      {lead.notes && (
        <div className="mt-2 flex items-start gap-1.5 text-muted-foreground">
          <StickyNote className="h-3 w-3 shrink-0 mt-0.5" />
          <p className="text-xs line-clamp-2 leading-relaxed">{lead.notes}</p>
        </div>
      )}
      {stale && (
        <p className="mt-2 text-[10px] font-medium text-destructive">
          🚨 Follow-up nodig
        </p>
      )}
    </button>
  );
}
