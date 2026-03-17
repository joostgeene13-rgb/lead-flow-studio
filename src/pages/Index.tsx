import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { KanbanColumn } from "@/components/KanbanColumn";
import { AddLeadDialog } from "@/components/AddLeadDialog";
import { LeadDetailSheet } from "@/components/LeadDetailSheet";
import { useLeads } from "@/hooks/useLeads";
import { LEAD_STATUSES, type Lead } from "@/types/lead";
import { Plus, Users, Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { NavLink } from "react-router-dom";

const Index = () => {
  const { leads, addLead, updateLead, deleteLead, moveLeadToStatus } = useLeads();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedJobTitles, setSelectedJobTitles] = useState<string[]>([]);

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setSheetOpen(true);
  };

  // Get unique job titles
  const jobTitles = useMemo(() => {
    const titles = new Set(leads.map((l) => l.jobTitle).filter(Boolean));
    return Array.from(titles).sort();
  }, [leads]);

  const toggleJobTitle = (title: string) => {
    setSelectedJobTitles((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const filteredLeads = useMemo(() => {
    if (selectedJobTitles.length === 0) return leads;
    return leads.filter((l) => selectedJobTitles.includes(l.jobTitle));
  }, [leads, selectedJobTitles]);

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
          <div className="flex items-center gap-2">
            <NavLink to="/notes">
              <Button variant="outline" size="sm">Notes Overzicht</Button>
            </NavLink>
            <NavLink to="/coding">
              <Button variant="outline" size="sm">Codeer Tool</Button>
            </NavLink>
            <Button size="sm" onClick={() => setAddDialogOpen(true)} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Add Lead
            </Button>
          </div>
        </div>
      </header>

      {/* Filter bar */}
      {jobTitles.length > 0 && (
        <div className="border-b border-border bg-card px-6 py-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-1">
              <Filter className="h-3 w-3" />
              <span>Functie:</span>
            </div>
            {jobTitles.map((title) => (
              <button
                key={title}
                onClick={() => toggleJobTitle(title)}
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${
                  selectedJobTitles.includes(title)
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-secondary"
                }`}
              >
                {title}
              </button>
            ))}
            {selectedJobTitles.length > 0 && (
              <button
                onClick={() => setSelectedJobTitles([])}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3 w-3" />
                Wis filter
              </button>
            )}
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <main className="flex-1 overflow-x-auto overflow-y-hidden p-6 scrollbar-thin">
        <div className="flex gap-5 h-full">
          {LEAD_STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              leads={filteredLeads.filter((l) => l.status === status)}
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
