import { useState, useMemo, useCallback, useRef } from "react";
import { useLeads } from "@/hooks/useLeads";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, X, Tag, User, Trash2 } from "lucide-react";
import type { Lead, NoteCode, CodedSegment } from "@/types/lead";
import { DEFAULT_CODE_COLORS } from "@/types/lead";

const CodingTool = () => {
  const { leads, codes, addCode, removeCode, updateLead } = useLeads();
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [newCodeLabel, setNewCodeLabel] = useState("");
  const [activeCodeId, setActiveCodeId] = useState<string | null>(null);
  const [filterCodeId, setFilterCodeId] = useState<string | null>(null);
  const textRef = useRef<HTMLDivElement>(null);

  const leadsWithNotes = useMemo(() => leads.filter((l) => l.notes), [leads]);
  const selectedLead = leadsWithNotes.find((l) => l.id === selectedLeadId) ?? null;

  const handleAddCode = () => {
    if (!newCodeLabel.trim()) return;
    const colorIndex = codes.length % DEFAULT_CODE_COLORS.length;
    addCode({ label: newCodeLabel.trim(), color: DEFAULT_CODE_COLORS[colorIndex] });
    setNewCodeLabel("");
  };

  const handleTextSelect = useCallback(() => {
    if (!activeCodeId || !selectedLead || !textRef.current) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    const container = textRef.current;

    // Calculate offsets relative to the text content
    const preRange = document.createRange();
    preRange.selectNodeContents(container);
    preRange.setEnd(range.startContainer, range.startOffset);
    const startIndex = preRange.toString().length;

    const text = selection.toString();
    if (!text.trim()) return;

    const newSegment: CodedSegment = {
      id: crypto.randomUUID(),
      codeId: activeCodeId,
      startIndex,
      endIndex: startIndex + text.length,
      text,
    };

    const existing = selectedLead.codedSegments ?? [];
    updateLead(selectedLead.id, {
      codedSegments: [...existing, newSegment],
    });
    selection.removeAllRanges();
  }, [activeCodeId, selectedLead, updateLead]);

  const removeSegment = (leadId: string, segmentId: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;
    updateLead(leadId, {
      codedSegments: (lead.codedSegments ?? []).filter((s) => s.id !== segmentId),
    });
  };

  const getCodeById = (id: string) => codes.find((c) => c.id === id);

  // Render highlighted text
  const renderHighlightedText = (lead: Lead) => {
    const segments = (lead.codedSegments ?? [])
      .filter((s) => !filterCodeId || s.codeId === filterCodeId)
      .sort((a, b) => a.startIndex - b.startIndex);

    if (segments.length === 0) return lead.notes;

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    segments.forEach((seg) => {
      if (seg.startIndex > lastIndex) {
        parts.push(lead.notes.slice(lastIndex, seg.startIndex));
      }
      const code = getCodeById(seg.codeId);
      parts.push(
        <mark
          key={seg.id}
          className="rounded px-0.5 cursor-pointer transition-opacity hover:opacity-80"
          style={{
            backgroundColor: code ? `hsl(${code.color} / 0.2)` : "hsl(var(--accent) / 0.2)",
            borderBottom: code ? `2px solid hsl(${code.color})` : undefined,
          }}
          title={`${code?.label ?? "Onbekend"} — klik om te verwijderen`}
          onClick={() => removeSegment(lead.id, seg.id)}
        >
          {seg.text}
        </mark>
      );
      lastIndex = seg.endIndex;
    });

    if (lastIndex < lead.notes.length) {
      parts.push(lead.notes.slice(lastIndex));
    }

    return parts;
  };

  // All coded segments grouped by code
  const segmentsByCode = useMemo(() => {
    const map: Record<string, { lead: Lead; segment: CodedSegment }[]> = {};
    codes.forEach((c) => (map[c.id] = []));
    leads.forEach((lead) => {
      (lead.codedSegments ?? []).forEach((seg) => {
        if (!map[seg.codeId]) map[seg.codeId] = [];
        map[seg.codeId].push({ lead, segment: seg });
      });
    });
    return map;
  }, [leads, codes]);

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
              <h1 className="text-sm font-semibold text-foreground">Codeer Tool</h1>
              <p className="text-xs text-muted-foreground">Selecteer tekst om te coderen met thema's</p>
            </div>
          </div>
          <NavLink to="/notes">
            <Button variant="outline" size="sm">Notes Overzicht</Button>
          </NavLink>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar: codes */}
        <aside className="w-72 border-r border-border bg-card flex flex-col overflow-y-auto scrollbar-thin">
          <div className="p-4 border-b border-border">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Codes</h3>
            <div className="flex gap-2">
              <Input
                value={newCodeLabel}
                onChange={(e) => setNewCodeLabel(e.target.value)}
                placeholder="Nieuwe code..."
                className="text-xs h-8"
                onKeyDown={(e) => e.key === "Enter" && handleAddCode()}
              />
              <Button size="sm" className="h-8 px-2 shrink-0" onClick={handleAddCode} disabled={!newCodeLabel.trim()}>
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <div className="flex-1 p-4 space-y-1.5">
            {codes.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">
                Voeg een code toe om te beginnen
              </p>
            )}
            {codes.map((code) => (
              <div
                key={code.id}
                className={`flex items-center justify-between rounded-md px-2.5 py-2 cursor-pointer transition-colors text-xs ${
                  activeCodeId === code.id
                    ? "ring-1 ring-offset-1"
                    : "hover:bg-secondary"
                }`}
                style={{
                  backgroundColor: activeCodeId === code.id ? `hsl(${code.color} / 0.12)` : undefined,
                  borderColor: activeCodeId === code.id ? `hsl(${code.color})` : undefined,
                }}
                onClick={() => setActiveCodeId(activeCodeId === code.id ? null : code.id)}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-sm shrink-0"
                    style={{ backgroundColor: `hsl(${code.color})` }}
                  />
                  <span className="font-medium text-foreground">{code.label}</span>
                  <span className="text-muted-foreground">
                    {segmentsByCode[code.id]?.length ?? 0}
                  </span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeCode(code.id); }}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>

          {/* Code filter */}
          {codes.length > 0 && (
            <div className="p-4 border-t border-border">
              <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Filter op code</h4>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setFilterCodeId(null)}
                  className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                    !filterCodeId ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  Alle
                </button>
                {codes.map((code) => (
                  <button
                    key={code.id}
                    onClick={() => setFilterCodeId(filterCodeId === code.id ? null : code.id)}
                    className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors`}
                    style={{
                      backgroundColor: filterCodeId === code.id ? `hsl(${code.color} / 0.15)` : undefined,
                      borderColor: filterCodeId === code.id ? `hsl(${code.color})` : `hsl(var(--border))`,
                      color: filterCodeId === code.id ? `hsl(${code.color})` : undefined,
                    }}
                  >
                    {code.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Center: lead selector + notes */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Lead selector */}
          <div className="border-b border-border px-6 py-3 overflow-x-auto scrollbar-thin">
            <div className="flex gap-2">
              {leadsWithNotes.length === 0 && (
                <p className="text-xs text-muted-foreground py-1">Geen leads met notities gevonden.</p>
              )}
              {leadsWithNotes.map((lead) => (
                <button
                  key={lead.id}
                  onClick={() => setSelectedLeadId(lead.id)}
                  className={`shrink-0 flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedLeadId === lead.id
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  <User className="h-3 w-3" />
                  {lead.fullName}
                </button>
              ))}
            </div>
          </div>

          {/* Notes area */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
            {!selectedLead ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Tag className="h-8 w-8 mb-3 opacity-40" />
                <p className="text-sm">Selecteer een lead om notities te coderen</p>
                {activeCodeId && (
                  <p className="text-xs mt-1">
                    Actieve code: <span className="font-semibold">{getCodeById(activeCodeId)?.label}</span>
                  </p>
                )}
              </div>
            ) : (
              <div className="mx-auto max-w-2xl">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-foreground">{selectedLead.fullName}</h2>
                  <p className="text-xs text-muted-foreground">
                    {selectedLead.jobTitle}{selectedLead.jobTitle && selectedLead.company ? " · " : ""}{selectedLead.company}
                  </p>
                </div>

                {activeCodeId && (
                  <div
                    className="mb-4 flex items-center gap-2 rounded-md border px-3 py-2 text-xs"
                    style={{
                      backgroundColor: `hsl(${getCodeById(activeCodeId)?.color} / 0.08)`,
                      borderColor: `hsl(${getCodeById(activeCodeId)?.color} / 0.3)`,
                    }}
                  >
                    <div
                      className="h-2.5 w-2.5 rounded-sm"
                      style={{ backgroundColor: `hsl(${getCodeById(activeCodeId)?.color})` }}
                    />
                    <span>Selecteer tekst om te labelen als <strong>{getCodeById(activeCodeId)?.label}</strong></span>
                  </div>
                )}

                <div
                  ref={textRef}
                  onMouseUp={handleTextSelect}
                  className="text-sm leading-relaxed whitespace-pre-wrap text-foreground select-text cursor-text rounded-lg border border-border bg-card p-5"
                >
                  {renderHighlightedText(selectedLead)}
                </div>

                {/* Coded segments list */}
                {(selectedLead.codedSegments ?? []).length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                      Gecodeerde fragmenten
                    </h3>
                    <div className="space-y-2">
                      {(selectedLead.codedSegments ?? [])
                        .filter((s) => !filterCodeId || s.codeId === filterCodeId)
                        .map((seg) => {
                          const code = getCodeById(seg.codeId);
                          return (
                            <div
                              key={seg.id}
                              className="flex items-start gap-3 rounded-md border border-border bg-card px-3 py-2 text-xs group"
                            >
                              <div
                                className="h-3 w-3 rounded-sm mt-0.5 shrink-0"
                                style={{ backgroundColor: `hsl(${code?.color ?? "var(--accent)"})` }}
                              />
                              <div className="flex-1 min-w-0">
                                <span className="font-medium text-muted-foreground">{code?.label ?? "Onbekend"}</span>
                                <p className="text-foreground mt-0.5 line-clamp-2">"{seg.text}"</p>
                              </div>
                              <button
                                onClick={() => removeSegment(selectedLead.id, seg.id)}
                                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar: all segments by code */}
        <aside className="w-72 border-l border-border bg-card overflow-y-auto scrollbar-thin hidden lg:block">
          <div className="p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Alle codes overzicht
            </h3>
            {codes.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">Nog geen codes aangemaakt</p>
            )}
            {codes.map((code) => {
              const segs = segmentsByCode[code.id] ?? [];
              if (filterCodeId && filterCodeId !== code.id) return null;
              return (
                <div key={code.id} className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="h-2.5 w-2.5 rounded-sm"
                      style={{ backgroundColor: `hsl(${code.color})` }}
                    />
                    <span className="text-xs font-semibold text-foreground">{code.label}</span>
                    <span className="text-[10px] text-muted-foreground">{segs.length}</span>
                  </div>
                  {segs.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground pl-4">Geen fragmenten</p>
                  ) : (
                    <div className="space-y-1.5 pl-4">
                      {segs.map(({ lead, segment }) => (
                        <div key={segment.id} className="text-[11px]">
                          <span className="text-muted-foreground">{lead.fullName}: </span>
                          <span className="text-foreground">"{segment.text.length > 60 ? segment.text.slice(0, 60) + "…" : segment.text}"</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CodingTool;
