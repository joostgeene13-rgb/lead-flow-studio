import { useState, useCallback, useEffect } from "react";
import type { Lead, LeadStatus, NoteCode } from "@/types/lead";

const STORAGE_KEY = "linkedin-crm-leads";
const CODES_STORAGE_KEY = "linkedin-crm-codes";

function loadLeads(): Lead[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveLeads(leads: Lead[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
}

function loadCodes(): NoteCode[] {
  try {
    const data = localStorage.getItem(CODES_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveCodes(codes: NoteCode[]) {
  localStorage.setItem(CODES_STORAGE_KEY, JSON.stringify(codes));
}

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>(loadLeads);
  const [codes, setCodes] = useState<NoteCode[]>(loadCodes);

  useEffect(() => {
    saveLeads(leads);
  }, [leads]);

  useEffect(() => {
    saveCodes(codes);
  }, [codes]);

  const addLead = useCallback((lead: Omit<Lead, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    const newLead: Lead = {
      ...lead,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    setLeads((prev) => [...prev, newLead]);
    return newLead;
  }, []);

  const updateLead = useCallback((id: string, updates: Partial<Omit<Lead, "id" | "createdAt">>) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === id
          ? { ...lead, ...updates, updatedAt: new Date().toISOString() }
          : lead
      )
    );
  }, []);

  const deleteLead = useCallback((id: string) => {
    setLeads((prev) => prev.filter((lead) => lead.id !== id));
  }, []);

  const moveLeadToStatus = useCallback((id: string, status: LeadStatus) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === id
          ? { ...lead, status, updatedAt: new Date().toISOString() }
          : lead
      )
    );
  }, []);

  const addCode = useCallback((code: Omit<NoteCode, "id">) => {
    const newCode: NoteCode = { ...code, id: crypto.randomUUID() };
    setCodes((prev) => [...prev, newCode]);
    return newCode;
  }, []);

  const removeCode = useCallback((codeId: string) => {
    setCodes((prev) => prev.filter((c) => c.id !== codeId));
    // Also remove coded segments using this code
    setLeads((prev) =>
      prev.map((lead) => ({
        ...lead,
        codedSegments: lead.codedSegments?.filter((s) => s.codeId !== codeId),
      }))
    );
  }, []);

  return { leads, codes, addLead, updateLead, deleteLead, moveLeadToStatus, addCode, removeCode };
}
