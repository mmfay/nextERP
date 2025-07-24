// lib/api/journalLines.ts

export type JournalLine = {
  lineID: string;
  journalID: string;
  account: string;
  description?: string;
  debit: number;
  credit: number;
};

/**
 * Fetch all lines for a journal
 */
export async function fetchJournalLines(journalId: string): Promise<JournalLine[]> {
  const res = await fetch(
    `http://localhost:8000/api/v1/general_ledger/general_journals/${journalId}/lines`,
    { credentials: "include" }
  );
  if (!res.ok) {
    const message = await res.text();
    throw new Error(`Failed to fetch journal lines: ${res.status} - ${message}`);
  }
  const data = await res.json();
  return data.map((line: any) => ({
    lineID: line.lineID,
    journalID: line.journalID,
    account: line.account,
    description: line.description,
    debit: line.debit,
    credit: line.credit,
  }));
}

/**
 * Bulk‐upsert all lines for a journal (create new, update existing, delete missing)
 */
export async function updateJournalLines(
  journalId: string,
  lines: JournalLine[]
): Promise<JournalLine[]> {
  const res = await fetch(
    `http://localhost:8000/api/v1/general_ledger/general_journals/${journalId}/lines`,
    {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lines),
    }
  );
  if (!res.ok) {
    const message = await res.text();
    throw new Error(`Failed to update journal lines: ${res.status} - ${message}`);
  }
  const data = await res.json();
  return data.map((line: any) => ({
    lineID: line.lineID,
    journalID: line.journalID,
    account: line.account,
    description: line.description,
    debit: line.debit,
    credit: line.credit,
  }));
}

/**
 * Delete a single line from a journal
 */
export async function deleteJournalLine(
  journalId: string,
  lineId: string
): Promise<void> {
  const res = await fetch(
    `http://localhost:8000/api/v1/general_ledger/general_journals/${journalId}/lines/${lineId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );
  if (!res.ok) {
    const message = await res.text();
    throw new Error(`Failed to delete journal line: ${res.status} - ${message}`);
  }
}
