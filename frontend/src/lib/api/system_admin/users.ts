export type UserAccounts = {
  email: string;
  userid: string;
  firstName: string;
  lastName: string;
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

/**
 * createUserAccount - Creates a new user account.
 * @param user - user account data
 * @returns created user
 */
export async function createUserAccount(user: UserAccounts): Promise<UserAccounts> {
  const res = await fetch("http://localhost:8000/api/v1/system_admin/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(user),
  });

  if (!res.ok) {
    throw new Error("Failed to create user account");
  }

  return res.json();
}

/**
 * deleteUserAccounts - Deletes multiple users by email
 * @param userids - array of user IDs to delete
 */
export async function deleteUserAccounts(userids: string[]): Promise<void> {
  const res = await fetch("http://localhost:8000/api/v1/system_admin/users", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ userids }),
  });

  if (!res.ok) {
    throw new Error("Failed to delete user accounts");
  }
}

/**
 * updateUserEnabled - Updates a user's enabled status
 * @param userid - user ID
 * @param enabled - new enabled state (true or false)
 */
export async function updateUserEnabled(userid: string, enabled: boolean): Promise<void> {
  const res = await fetch("http://localhost:8000/api/v1/system_admin/users", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ userid, enabled }),
  });

  if (!res.ok) {
    throw new Error("Failed to update user enabled state");
  }
}
