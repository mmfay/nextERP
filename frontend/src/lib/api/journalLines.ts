export type JournalLine = {
  lineID: string;
  journalID: string;
  account: string;
  description?: string;
  debit: number;
  credit: number;
};

export async function fetchJournalLines(journalId: string): Promise<JournalLine[]> {
  const res = await fetch(`http://localhost:8000/api/v1/general_ledger/general_journals/${journalId}/lines`, {
    credentials: "include",
  });

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
