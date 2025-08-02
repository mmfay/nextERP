export type UserPermission = {
  userid: string;
  email: string;
  firstName: string;
  lastName: string;
  enabled: boolean;
  permissions: {
    permission: string;
    name: string;
    description: string;
  }[];
};

export type Permissions = {
  name: string;
  fullName: string;
  description: string;
}

/**
 * fetchUsersPermissions - Fetches users and their assigned permissions.
 */
export async function fetchUsersPermissions(): Promise<UserPermission[]> {
  const res = await fetch("http://localhost:8000/api/v1/system_admin/users_permissions", {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch user permissions");
  }
  
  return res.json();
}

/**
 * fetchPermissions - Fetches permissions.
 */
export async function fetchPermissions(): Promise<Permissions[]> {
  const res = await fetch("http://localhost:8000/api/v1/system_admin/permissions", {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch permissions");
  }

  return res.json();
}

/**
 * addUserPermission - Adds a permission to a specific user.
 */
export async function addUserPermission(userid: string, permission: string): Promise<void> {
  const res = await fetch("http://localhost:8000/api/v1/system_admin/user_permissions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ userid, permission }),
  });

  if (!res.ok) {
    throw new Error("Failed to add permission to user");
  }
}

/**
 * deleteUserPermission - Removes a permission from a specific user.
 */
export async function deleteUserPermission(userid: string, permission: string): Promise<void> {
  const res = await fetch(`http://localhost:8000/api/v1/system_admin/user_permissions/${userid}/${permission}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ userid, permission }),
  });

  if (!res.ok) {
    throw new Error("Failed to remove permission from user");
  }
}
