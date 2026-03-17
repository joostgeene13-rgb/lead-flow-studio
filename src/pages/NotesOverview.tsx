import { useMemo } from "react";
import { useLeads } from "@/hooks/useLeads";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, StickyNote, User } from "lucide-react";

const NotesOverview = () => {
  const { leads } = useLeads();

  // Group leads by job title
  const groupedByTitle = useMemo(() => {
    const groups: Record<string, typeof leads> = {};
    leads.forEach((lead) => {
      const key = lead.jobTitle || "Geen functie";
      if (!groups[key]) groups[key] = [];
      groups[key].push(lead);
    });
    // Sort by title
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [leads]);

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NavLink to="/">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </NavLink>
            <div>
              <h1 className="text-sm font-semibold text-foreground">Notes Overzicht</h1>
              <p className="text-xs text-muted-foreground">Alle aantekeningen per functietitel</p>
            </div>
          </div>
          <NavLink to="/coding">
            <Button variant="outline" size="sm">Codeer Tool</Button>
          </NavLink>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        <div className="mx-auto max-w-3xl space-y-8">
          {groupedByTitle.length === 0 && (
            <div className="text-center py-20 text-muted-foreground text-sm">
              Nog geen leads met notities.
            </div>
          )}
          {groupedByTitle.map(([title, titleLeads]) => (
            <section key={title}>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {title}
                </h2>
                <span className="text-[10px] bg-secondary text-secondary-foreground rounded-full px-2 py-0.5 font-medium">
                  {titleLeads.length}
                </span>
              </div>
              <div className="space-y-3">
                {titleLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="rounded-lg border border-border bg-card p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm font-semibold text-card-foreground">
                        {lead.fullName}
                      </span>
                      {lead.company && (
                        <span className="text-xs text-muted-foreground">· {lead.company}</span>
                      )}
                      <span className="ml-auto text-[10px] text-muted-foreground bg-secondary rounded-full px-2 py-0.5">
                        {lead.status}
                      </span>
                    </div>
                    {lead.notes ? (
                      <div className="pl-5.5">
                        <div className="flex items-start gap-1.5">
                          <StickyNote className="h-3 w-3 text-muted-foreground mt-1 shrink-0" />
                          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                            {lead.notes}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic pl-5.5">Geen notities</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
};

export default NotesOverview;
