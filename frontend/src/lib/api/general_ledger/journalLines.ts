// lib/api/journalLines.ts
import { Page } from "../shared/pagination/types";
import { JournalLine, GeneralJournalTransPayload, GeneralJournalTransDelete } from "./types";
/**
 * Fetch all lines for a journal
 */
export async function fetchJournalLines(
    journalId: string,
    opts: { limit?: number; nextCursor?: string | null } = {}
): Promise<Page<JournalLine>> {

    const { limit = 50, nextCursor = null } = opts;

    const url = new URL(
      `http://localhost:8000/api/v1/general_ledger/general_journals/${encodeURIComponent(
        journalId
      )}/lines`
    );

    url.searchParams.set("limit", String(limit));
    if (nextCursor) url.searchParams.set("next_cursor", nextCursor);

    const res = await fetch(url.toString(), { credentials: "include" });
    if (!res.ok) {
      const message = await res.text();
      throw new Error(
        `Failed to fetch journal lines page: ${res.status} - ${message}`
      );
    }

    const data = (await res.json()) as Page<JournalLine>;

    return data;
}

/**
 * Bulk‐upsert all lines for a journal (create new, update existing, delete missing)
 */
export async function updateJournalTrans(
  payload: GeneralJournalTransPayload
): Promise<boolean> {
  const res = await fetch(
    `http://localhost:8000/api/v1/general_ledger/general_journals/${payload.journalID}/trans`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) {
    const message = await res.text();
    throw new Error(`Failed to update journal lines: ${res.status} - ${message}`);
  }
  const data = await res.json();
  return true;
}

/**
 * Delete a single line from a journal
 */
export async function deleteJournalLine(
  record: GeneralJournalTransDelete
): Promise<void> {
  const res = await fetch(
    `http://localhost:8000/api/v1/general_ledger/general_journals/trans/${record.recordID}`,
    {
      method: "DELETE",
      credentials: "include",
      headers: { "If-Match": String(record.versionID) },
    }
  );
  if (!res.ok) {
    const message = await res.text();
    throw new Error(`Failed to delete journal line: ${res.status} - ${message}`);
  }
}
