import type { Lead, LeadStatus } from "@/types/lead";
import { LeadCard } from "./LeadCard";
import { Badge } from "@/components/ui/badge";

interface KanbanColumnProps {
  status: LeadStatus;
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onDrop: (leadId: string, status: LeadStatus) => void;
}

export function KanbanColumn({ status, leads, onLeadClick, onDrop }: KanbanColumnProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add("bg-accent/5");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("bg-accent/5");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove("bg-accent/5");
    const leadId = e.dataTransfer.getData("text/plain");
    if (leadId) onDrop(leadId, status);
  };

  return (
    <div
      className="flex w-80 shrink-0 flex-col rounded-lg"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center gap-2 px-1 pb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {status}
        </h3>
        <Badge variant="secondary" className="h-5 min-w-[20px] justify-center rounded-full px-1.5 text-[10px] font-medium">
          {leads.length}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto scrollbar-thin pb-4">
        {leads.map((lead) => (
          <div
            key={lead.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("text/plain", lead.id);
              e.dataTransfer.effectAllowed = "move";
            }}
            className="cursor-grab active:cursor-grabbing"
          >
            <LeadCard lead={lead} onClick={onLeadClick} />
          </div>
        ))}
        {leads.length === 0 && (
          <div className="flex items-center justify-center rounded-lg border border-dashed border-border py-8 text-xs text-muted-foreground">
            Drop leads here
          </div>
        )}
      </div>
    </div>
  );
}
