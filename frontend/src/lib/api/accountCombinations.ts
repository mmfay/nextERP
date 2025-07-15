// lib/api/accountCombinations.ts

export type AccountCombination = {
  account: string;
  dimensions: { [key: string]: string | null };
};

export type AccountCombinationRequest = {
  account: string;
  dimensions: { [key: string]: string | null };
};

// GET existing combinations
export async function fetchAccountCombinations(): Promise<AccountCombination[]> {
  const res = await fetch("http://localhost:8000/api/v1/general_ledger/account_combinations", {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch account combinations");
  return res.json();
}

// POST new combinations to persist to backend
export async function saveAccountCombinations(data: AccountCombinationRequest[]): Promise<void> {
  const res = await fetch("http://localhost:8000/api/v1/general_ledger/account_combinations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to save account combinations");
}
