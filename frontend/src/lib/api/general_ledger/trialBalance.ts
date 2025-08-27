export type TrialBalanceEntry = {
  account: string;
  name: string;
  debit: number;
  credit: number;
  balance: number;
};

export async function getTrialBalance(
  fromDate?: Date,
  toDate?: Date
): Promise<TrialBalanceEntry[]> {
  const query = new URLSearchParams();

  if (fromDate) {
    query.append("from_date", fromDate.toISOString().split("T")[0]);
  }
  if (toDate) {
    query.append("to_date", toDate.toISOString().split("T")[0]);
  }

  const res = await fetch(
    `http://localhost:8000/api/v1/general_ledger/trial_balance?${query.toString()}`,
    {
      method: "GET",
      credentials: "include", // if using auth cookies
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch trial balance: ${res.statusText}`);
  }

  const data = await res.json();
  return data as TrialBalanceEntry[];
}
