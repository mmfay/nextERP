import { JOURNALTYPE } from "@/lib/constants/enums";

export type InventoryJournalHeader = {
  journalID: string;
  status: Number;
  type: Number;
  description: string;
  record: Number
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