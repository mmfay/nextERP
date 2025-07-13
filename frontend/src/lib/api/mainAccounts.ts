export type MainAccount = {
  account: string;
  description: string;
  type: string;
};

/**
 * fetchMainAccounts - Gets list of main accounts.
 * @returns list of main accounts
 */
export async function fetchMainAccounts(): Promise<MainAccount[]> {
  const res = await fetch("http://localhost:8000/api/v1/general_ledger/main_accounts", {
    credentials: "include", // if using cookies/auth
  });

  if (!res.ok) {
    throw new Error("Failed to fetch main accounts");
  }

  return res.json();
}
/**
 * createMainAccount - Creates a main account
 * @returns list of main accounts
 */
export async function createMainAccount(account: {
  account: string;
  description: string;
  type: string;
}) {
  const res = await fetch("http://localhost:8000/api/v1/general_ledger/main_accounts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(account),
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error?.detail || "Failed to create account");
  }

  return res.json();
}
/**
 * deleteMainAccounts - Creates a main account
 * @returns list of main accounts
 */
export async function deleteMainAccounts(accountIds: string[]) {
  const res = await fetch("http://localhost:8000/api/v1/general_ledger/main_accounts", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(accountIds),
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error?.detail || "Failed to delete accounts");
  }

  return res.json();
}
