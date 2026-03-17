import { useState, useCallback, useEffect } from "react";
import type { Lead, LeadStatus } from "@/types/lead";

const STORAGE_KEY = "linkedin-crm-leads";

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

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>(loadLeads);

  useEffect(() => {
    saveLeads(leads);
  }, [leads]);

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

  return { leads, addLead, updateLead, deleteLead, moveLeadToStatus };
}
