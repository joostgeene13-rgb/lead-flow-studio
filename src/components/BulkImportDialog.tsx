import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { parseLinkedInText, type ParsedLead } from "@/lib/linkedinParser";
import { Upload, Users, AlertCircle, Check } from "lucide-react";
import type { LeadStatus } from "@/types/lead";

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (leads: { fullName: string; jobTitle: string; company: string; status: LeadStatus; notes: string }[]) => void;
}

export function BulkImportDialog({ open, onOpenChange, onImport }: BulkImportDialogProps) {
  const [rawText, setRawText] = useState("");
  const [preview, setPreview] = useState<ParsedLead[] | null>(null);
  const [imported, setImported] = useState(false);

  const handleParse = () => {
    const results = parseLinkedInText(rawText);
    setPreview(results);
    setImported(false);
  };

  const handleImport = () => {
    if (!preview || preview.length === 0) return;
    onImport(
      preview.map((p) => ({
        fullName: p.fullName,
        jobTitle: p.jobTitle,
        company: p.company,
        status: "To Contact" as LeadStatus,
        notes: "",
      }))
    );
    setImported(true);
  };

  const handleClose = (val: boolean) => {
    if (!val) {
      setRawText("");
      setPreview(null);
      setImported(false);
    }
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-accent" />
            LinkedIn Bulk Import
          </DialogTitle>
          <DialogDescription>
            Plak ruwe tekst gekopieerd uit LinkedIn Sales Navigator of zoekresultaten. De parser herkent namen, functietitels en bedrijven.
          </DialogDescription>
        </DialogHeader>

        {imported ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
              <Check className="h-6 w-6 text-accent" />
            </div>
            <p className="text-sm font-medium text-foreground">
              {preview?.length} lead{(preview?.length ?? 0) !== 1 ? "s" : ""} geïmporteerd!
            </p>
            <p className="text-xs text-muted-foreground">Ze staan nu in de "To Contact" kolom.</p>
            <Button variant="outline" size="sm" onClick={() => handleClose(false)} className="mt-2">
              Sluiten
            </Button>
          </div>
        ) : (
          <>
            <Textarea
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                setPreview(null);
              }}
              placeholder={`Plak hier je LinkedIn tekst, bijv.:\n\nJan de Vries\nTweedegraads connectie\nSenior Developer\nAcme Corp\n\nSarah Johnson\n2nd\nProduct Manager bij TechCo`}
              className="min-h-[180px] text-sm font-mono"
            />

            <div className="flex items-center gap-2">
              <Button onClick={handleParse} disabled={!rawText.trim()} size="sm" className="gap-1.5">
                <Users className="h-3.5 w-3.5" />
                Parse Tekst
              </Button>
              {preview !== null && (
                <span className="text-xs text-muted-foreground">
                  {preview.length} lead{preview.length !== 1 ? "s" : ""} gevonden
                </span>
              )}
            </div>

            {preview !== null && preview.length === 0 && (
              <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                Geen leads gevonden. Probeer de tekst opnieuw te kopiëren uit LinkedIn.
              </div>
            )}

            {preview && preview.length > 0 && (
              <div className="flex-1 overflow-y-auto border rounded-md divide-y divide-border">
                {preview.map((lead, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2 text-xs">
                    <span className="text-muted-foreground w-5 text-right shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{lead.fullName}</p>
                      <p className="text-muted-foreground truncate">
                        {lead.jobTitle}{lead.jobTitle && lead.company ? " · " : ""}{lead.company}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {preview && preview.length > 0 && (
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="ghost" size="sm" onClick={() => handleClose(false)}>
                  Annuleren
                </Button>
                <Button size="sm" onClick={handleImport} className="gap-1.5">
                  <Upload className="h-3.5 w-3.5" />
                  Importeer {preview.length} Lead{preview.length !== 1 ? "s" : ""}
                </Button>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
