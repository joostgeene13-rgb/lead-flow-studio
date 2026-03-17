import type { Lead } from "@/types/lead";
import { Building2, StickyNote } from "lucide-react";

interface LeadCardProps {
  lead: Lead;
  onClick: (lead: Lead) => void;
}

export function LeadCard({ lead, onClick }: LeadCardProps) {
  return (
    <button
      onClick={() => onClick(lead)}
      className="w-full text-left rounded-lg border border-border bg-card p-3 transition-colors duration-150 hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <p className="text-sm font-semibold text-card-foreground truncate">
        {lead.fullName}
      </p>
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
    </button>
  );
}
