import { useState } from "react";
import { Button } from "@/components/ui/button";
import { KanbanColumn } from "@/components/KanbanColumn";
import { AddLeadDialog } from "@/components/AddLeadDialog";
import { LeadDetailSheet } from "@/components/LeadDetailSheet";
import { useLeads } from "@/hooks/useLeads";
import { LEAD_STATUSES, type Lead } from "@/types/lead";
import { Plus, Users } from "lucide-react";

const Index = () => {
  const { leads, addLead, updateLead, deleteLead, moveLeadToStatus } = useLeads();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setSheetOpen(true);
  };

  // Keep selectedLead in sync with leads array
  const activeLead = selectedLead ? leads.find((l) => l.id === selectedLead.id) ?? null : null;

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Users className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-foreground">LinkedIn CRM</h1>
              <p className="text-xs text-muted-foreground">{leads.length} lead{leads.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
          <Button size="sm" onClick={() => setAddDialogOpen(true)} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add Lead
          </Button>
        </div>
      </header>

      {/* Kanban Board */}
      <main className="flex-1 overflow-x-auto overflow-y-hidden p-6 scrollbar-thin">
        <div className="flex gap-5 h-full">
          {LEAD_STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              leads={leads.filter((l) => l.status === status)}
              onLeadClick={handleLeadClick}
              onDrop={moveLeadToStatus}
            />
          ))}
        </div>
      </main>

      <AddLeadDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} onAdd={addLead} />
      <LeadDetailSheet
        lead={activeLead}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onUpdate={updateLead}
        onDelete={deleteLead}
      />
    </div>
  );
};

export default Index;
