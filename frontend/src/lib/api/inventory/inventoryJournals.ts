import { JOURNALTYPE } from "@/lib/constants/enums";

export type InventoryJournalHeader = {
  journalID: string;
  status: Number;
  type: Number;
  description: string;
  record: Number
};

// Dimension values
export type InventoryDimensions = {
  warehouse: string;
  location: string;
  config?: string;
  size?: string;
  batch?: string;
  serial?: string;
  record: number;
};

// Enriched journal line with dimension object
export type InventoryJournalLineWithDimension = {
  journalID: string;
  item: string;
  dimension: InventoryDimensions;
  qty: number;
  cost: number;
  record: number;
};

/**
 * fetchInventoryJournal - Gets list of journal headers
 * @returns list of journal headers
 */
export async function fetchInventoryJournal(journalType?: JOURNALTYPE): Promise<InventoryJournalHeader[]> {
  
  const query = journalType !== undefined ? `?type=${journalType}` : "";

  const res = await fetch(`http://localhost:8000/api/v1/inventory/inventory_journal${query}`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch inventory journal headers");
  }

  return res.json();
}

/**
 * fetchInventoryJournalLines - Gets lines for a specific journal ID
 * @returns enriched journal lines with dimension values
 */
export async function fetchInventoryJournalLines(journalID: string): Promise<InventoryJournalLineWithDimension[]> {
  const res = await fetch(`http://localhost:8000/api/v1/inventory/journal_lines?journalID=${journalID}`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch journal lines");
  }

  return res.json();
}