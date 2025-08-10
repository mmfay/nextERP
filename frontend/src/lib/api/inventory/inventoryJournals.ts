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

export async function updateInventoryJournalLines(){

}

export async function deleteInventoryJournalLine(){

}

/**
 * Posts an inventory journal by its business key (journalID).
 * Backend route assumed: POST /api/v1/inventory/journals/{journalID}/post
 * Returns the updated journal header on success.
 */
export async function postInventoryJournal(journalID: string): Promise<InventoryJournalHeader> {
  const url = `http://localhost:8000/api/v1/inventory/journal_header/${encodeURIComponent(journalID)}`;

  const res = await fetch(url, {
    method: "POST",
    credentials: "include", // keep cookies-based auth
    headers: {
      "Content-Type": "application/json",
    },
    body: null,
  });

  // Success path: return updated header (status should be "posted")
  if (res.ok) {
    const data = (await res.json()) as InventoryJournalHeader | { message: string; journal?: InventoryJournalHeader };
    // normalize in case your API returns {message, ...header}
    if ("journalID" in data) return data as InventoryJournalHeader;
    if ("journal" in data && data.journal) return data.journal as InventoryJournalHeader;
    // fallback: re-fetch journal if your API only returns a message (optional)
    throw new Error("Posted successfully but response did not include the journal header.");
  }

  // Error path: try to extract useful validation messages from FastAPI detail
  let detail: unknown = null;
  try {
    detail = await res.json();
  } catch {
    // ignore parse errors; we'll fall back to status text
  }

  if (detail && typeof detail === "object") {
    const d = detail as any;
    const errors: string[] =
      Array.isArray(d.errors) ? d.errors :
      Array.isArray(d.detail?.errors) ? d.detail.errors :
      typeof d.detail === "string" ? [d.detail] :
      typeof d.message === "string" ? [d.message] :
      [];

    if (errors.length) {
      throw new Error(`Validation failed: ${errors.join("; ")}`);
    }
  }

  // Final fallback
  throw new Error(`Failed to post journal ${journalID}: ${res.status} ${res.statusText}`);
}

export async function fetchInventoryJournalHeader(
  journalID: string
): Promise<InventoryJournalHeader> {
  if (!journalID) throw new Error("fetchInventoryJournalHeader: journalID is required");

  const res = await fetch(
    `http://localhost:8000/api/v1/inventory/journal_header/${encodeURIComponent(journalID)}`,
    { method: "GET", cache: "no-store" }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Failed to fetch inventory journal header (${journalID}). ${res.status} ${res.statusText} ${text}`
    );
  }

  return (await res.json()) as InventoryJournalHeader;
}