import { useState, useEffect, useRef, useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LEAD_STATUSES, type Lead, type LeadStatus } from "@/types/lead";
import { Check, Trash2 } from "lucide-react";

interface LeadDetailSheetProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, updates: Partial<Omit<Lead, "id" | "createdAt">>) => void;
  onDelete: (id: string) => void;
}

export function LeadDetailSheet({ lead, open, onOpenChange, onUpdate, onDelete }: LeadDetailSheetProps) {
  const [notes, setNotes] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (lead) setNotes(lead.notes);
  }, [lead]);

  const autoSaveNotes = useCallback(
    (value: string) => {
      setNotes(value);
      setSaveStatus("saving");
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (lead) {
          onUpdate(lead.id, { notes: value });
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 1500);
        }
      }, 600);
    },
    [lead, onUpdate]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!lead) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[55%] overflow-y-auto p-0 flex flex-col" side="right">
        <div className="border-b border-border p-6 space-y-4">
          <SheetHeader className="space-y-1">
            <SheetTitle className="text-xl">{lead.fullName}</SheetTitle>
            <SheetDescription>
              {lead.jobTitle}{lead.jobTitle && lead.company ? " · " : ""}{lead.company}
            </SheetDescription>
          </SheetHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="detail-name" className="text-xs text-muted-foreground">Full Name</Label>
              <Input
                id="detail-name"
                value={lead.fullName}
                onChange={(e) => onUpdate(lead.id, { fullName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="detail-title" className="text-xs text-muted-foreground">Job Title</Label>
              <Input
                id="detail-title"
                value={lead.jobTitle}
                onChange={(e) => onUpdate(lead.id, { jobTitle: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="detail-company" className="text-xs text-muted-foreground">Company</Label>
              <Input
                id="detail-company"
                value={lead.company}
                onChange={(e) => onUpdate(lead.id, { company: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select
                value={lead.status}
                onValueChange={(v) => onUpdate(lead.id, { status: v as LeadStatus })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LEAD_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col p-6">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Interview Notes
            </Label>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1 h-5 transition-opacity duration-150"
              style={{ opacity: saveStatus !== "idle" ? 1 : 0 }}
            >
              {saveStatus === "saving" && "Saving..."}
              {saveStatus === "saved" && <><Check className="h-3 w-3" /> Saved</>}
            </span>
          </div>
          <Textarea
            value={notes}
            onChange={(e) => autoSaveNotes(e.target.value)}
            placeholder="Add your interview notes, meeting insights, follow-up items..."
            className="flex-1 min-h-[300px] resize-none border-0 bg-transparent p-0 text-sm leading-relaxed focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
          />
        </div>

        <div className="border-t border-border p-4 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => {
              onDelete(lead.id);
              onOpenChange(false);
            }}
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            Delete Lead
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
