// lib/api/generalJournals.ts

export type GeneralJournal = {
  journalID: string;
  document_date: string;
  type: string;
  description: string;
  status: string;
};

const BASE_URL = "http://localhost:8000/api/v1/general_ledger/general_journals";

/**
 * Fetch all general journals.
 */
export async function fetchGeneralJournals(): Promise<GeneralJournal[]> {
  const res = await fetch(BASE_URL, {
    credentials: "include",
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(`Failed to fetch general journals: ${res.status} - ${message}`);
  }

  const data = await res.json();
  return data.map((j: any) => ({
    journalID: j.journalID,
    document_date: j.document_date,
    type: j.type,
    description: j.description,
    status: j.status,
  }));
}

/**
 * Fetch a single journal header by ID.
 */
export async function fetchJournalHeader(
  journalId: string
): Promise<GeneralJournal> {
  const res = await fetch(`${BASE_URL}/${journalId}`, {
    credentials: "include",
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(`Failed to fetch journal header: ${res.status} - ${message}`);
  }

  const j = await res.json();
  return {
    journalID: j.journalID,
    document_date: j.document_date,
    type: j.type,
    description: j.description,
    status: j.status,
  };
}

/**
 * Post (i.e. set status to "posted") a journal.
 */
export async function postGeneralJournal(
  journalId: string
): Promise<GeneralJournal> {
  const res = await fetch(`${BASE_URL}/${journalId}`, {
    method: "PATCH",
    credentials: "include",
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(`Failed to post journal ${journalId}: ${res.status} - ${message}`);
  }

  const updated = await res.json();
  return {
    journalID: updated.journalID,
    document_date: updated.document_date,
    type: updated.type,
    description: updated.description,
    status: updated.status,
  };
}

/**
 * Create a new general journal.
 */
export async function createGeneralJournal(input: {
  document_date: string;
  type: string;
  description: string;
}): Promise<GeneralJournal> {
  const res = await fetch(BASE_URL, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(
      `Failed to create journal: ${res.status} - ${message}`
    );
  }

  const created = await res.json();
  return {
    journalID: created.journalID,
    document_date: created.document_date,
    type: created.type,
    description: created.description,
    status: created.status,
  };
}
