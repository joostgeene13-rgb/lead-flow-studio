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
import { Upload, Check, AlertCircle } from "lucide-react";
import type { LeadStatus } from "@/types/lead";

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (leads: { fullName: string; jobTitle: string; company: string; status: LeadStatus; notes: string }[]) => void;
}

interface ParsedEntry {
  name: string;
  jobTitle?: string;
  company?: string;
}

export function BulkImportDialog({ open, onOpenChange, onImport }: BulkImportDialogProps) {
  const [rawText, setRawText] = useState("");
  const [error, setError] = useState("");
  const [imported, setImported] = useState(false);
  const [count, setCount] = useState(0);

  const handleImport = () => {
    setError("");
    let parsed: ParsedEntry[];
    try {
      parsed = JSON.parse(rawText);
    } catch {
      setError("Ongeldige JSON. Controleer of het een geldige array is.");
      return;
    }

    if (!Array.isArray(parsed)) {
      setError("JSON moet een array zijn, bijv. [ { \"name\": \"...\" } ]");
      return;
    }

    const leads = parsed
      .filter((entry) => entry && typeof entry.name === "string" && entry.name.trim())
      .map((entry) => ({
        fullName: entry.name.trim(),
        jobTitle: (entry.jobTitle ?? "").trim(),
        company: (entry.company ?? "").trim(),
        status: "To Contact" as LeadStatus,
        notes: "",
      }));

    if (leads.length === 0) {
      setError("Geen geldige leads gevonden. Elk object moet minstens een \"name\" veld hebben.");
      return;
    }

    onImport(leads);
    setCount(leads.length);
    setImported(true);
  };

  const handleClose = (val: boolean) => {
    if (!val) {
      setRawText("");
      setError("");
      setImported(false);
      setCount(0);
    }
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-accent" />
            Bulk Import
          </DialogTitle>
          <DialogDescription>
            Plak een JSON array met leads. Formaat: [{"{"} "name": "...", "jobTitle": "...", "company": "..." {"}"}]
          </DialogDescription>
        </DialogHeader>

        {imported ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
              <Check className="h-6 w-6 text-accent" />
            </div>
            <p className="text-sm font-medium text-foreground">
              {count} lead{count !== 1 ? "s" : ""} geïmporteerd!
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
              onChange={(e) => { setRawText(e.target.value); setError(""); }}
              placeholder={`[\n  { "name": "Jan de Vries", "jobTitle": "Developer", "company": "Acme" },\n  { "name": "Sara Bakker", "jobTitle": "PM", "company": "TechCo" }\n]`}
              className="min-h-[200px] text-sm font-mono"
            />

            {error && (
              <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {error}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="ghost" size="sm" onClick={() => handleClose(false)}>Annuleren</Button>
              <Button size="sm" onClick={handleImport} disabled={!rawText.trim()} className="gap-1.5">
                <Upload className="h-3.5 w-3.5" />
                Importeer
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
