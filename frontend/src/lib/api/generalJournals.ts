export type GeneralJournal = {
  journalID: string;
  document_date: string;
  type: string;
  description: string;
  status: string;
};

export async function fetchGeneralJournals(): Promise<GeneralJournal[]> {
  const res = await fetch("http://localhost:8000/api/v1/general_ledger/general_journals", {
    credentials: "include",
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(`Failed to fetch general journals: ${res.status} - ${message}`);
  }

  const data = await res.json();
  
  // Normalize Python-style snake_case keys if needed
  return data.map((j: any) => ({
    journalID: j.journalID, // already camelCase from backend model, if typed properly
    document_date: j.document_date,
    type: j.type,
    description: j.description,
    status: j.status,
  }));
}


export async function fetchJournalHeader(journalId: string) {
  const res = await fetch(`http://localhost:8000/api/v1/general_ledger/general_journals/${journalId}`, {
    credentials: "include",
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(`Failed to fetch journal header: ${res.status} - ${message}`);
  }

  return res.json(); // should return something like { status: "draft" }
}

