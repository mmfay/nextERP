export type UserAccounts = {
  email: string;
  password: string;
  enabled: boolean;
};

/**
 * fetchUserAccounts - Gets list of user accounts.
 * @returns list of user accounts
 */
export async function fetchUserAccounts(): Promise<UserAccounts[]> {
  const res = await fetch("http://localhost:8000/api/v1/system_admin/users", {
    credentials: "include", // if using cookies/auth
  });

  if (!res.ok) {
    throw new Error("Failed to fetch main accounts");
  }

  return res.json();
}
