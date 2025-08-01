"use client";

import { useEffect, useRef, useState } from "react";
import { fetchUserAccounts } from "@/lib/api/system_admin/users";

type Permission = {
  permission: string;
  name: string;
  description: string;
};

const PERMISSIONS: Permission[] = [
  { permission: "base", name: "Base", description: "All Base Level Permissions" },
  { permission: "view_dashboard", name: "View Dashboard", description: "View access to dashboard" },
  { permission: "mod_gl", name: "GL Module", description: "General Ledger Module Access" },
  { permission: "mod_purch", name: "Purchasing Module", description: "Purchasing Module Access" },
  { permission: "mod_sales", name: "Sales Module", description: "Sales Module Access" },
  { permission: "mod_sysAdmin", name: "System Admin", description: "System Administration Access" },
  { permission: "setup_gl", name: "GL Setup", description: "General Ledger Setup Access" },
  { permission: "setup_purch", name: "Purchasing Setup", description: "Purchasing Setup Access" },
  { permission: "setup_sales", name: "Sales Setup", description: "Sales Setup Access" },
  { permission: "extra_1", name: "Extra Permission 1", description: "Extra Description 1" },
  { permission: "extra_2", name: "Extra Permission 2", description: "Extra Description 2" },
  { permission: "extra_3", name: "Extra Permission 3", description: "Extra Description 3" },
  { permission: "extra_4", name: "Extra Permission 4", description: "Extra Description 4" },
  { permission: "extra_5", name: "Extra Permission 5", description: "Extra Description 5" },
  { permission: "extra_6", name: "Extra Permission 6", description: "Extra Description 6" },
  { permission: "extra_7", name: "Extra Permission 7", description: "Extra Description 7" },
  { permission: "extra_8", name: "Extra Permission 8", description: "Extra Description 8" },
  { permission: "extra_9", name: "Extra Permission 9", description: "Extra Description 9" }
];

export default function PermissionsDragDrop() {
  const [users, setUsers] = useState([]);
  const [draggedPerm, setDraggedPerm] = useState<Permission | null>(null);
  const [userPermissions, setUserPermissions] = useState<Record<string, Permission[]>>({});
  const [search, setSearch] = useState("");

  const dropAlertRef = useRef<{ userid: string; name: string } | null>(null);
  const removeAlertRef = useRef<{ userid: string; name: string } | null>(null);

  useEffect(() => {
    fetchUserAccounts().then((data) => {
      setUsers(data);
      const initial = Object.fromEntries(data.map((u: any) => [u.userid, []]));
      setUserPermissions(initial);
    });
  }, []);

  useEffect(() => {
    if (dropAlertRef.current) {
      alert(`Assigned "${dropAlertRef.current.name}" to ${dropAlertRef.current.userid}`);
      dropAlertRef.current = null;
    }
    if (removeAlertRef.current) {
      alert(`Removed "${removeAlertRef.current.name}" from ${removeAlertRef.current.userid}`);
      removeAlertRef.current = null;
    }
  }, [userPermissions]);

  const handleDrop = (userid: string) => {
    if (!draggedPerm) return;

    setUserPermissions((prev) => {
      const current = prev[userid] ?? [];
      const exists = current.some((p) => p.permission === draggedPerm.permission);
      if (exists) return prev;

      dropAlertRef.current = { userid, name: draggedPerm.name };
      return { ...prev, [userid]: [...current, draggedPerm] };
    });

    setDraggedPerm(null);
  };

  const handleRemove = (userid: string, permissionId: string) => {
    setUserPermissions((prev) => {
      const current = prev[userid] ?? [];
      const updated = current.filter((p) => {
        const match = p.permission === permissionId;
        if (match) {
          removeAlertRef.current = { userid, name: p.name };
        }
        return !match;
      });

      return { ...prev, [userid]: updated };
    });
  };

  const filteredPermissions = PERMISSIONS.filter(
    (perm) =>
      perm.name.toLowerCase().includes(search.toLowerCase()) ||
      perm.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-inherit text-inherit font-[family-name:var(--font-geist-sans)]">
      <main className="pt-24 px-8 sm:px-16 space-y-10">
        <section>
          <h1 className="text-4xl font-bold mb-6">Permission Assignment</h1>
        </section>

        <div className="flex gap-10 items-start">
          {/* Permission Pool */}
          <div className="w-1/4 max-h-[70vh] overflow-y-auto pr-2">
            <h2 className="text-2xl font-semibold mb-4">Permissions</h2>
            <input
              type="text"
              placeholder="Search permissions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full mb-4 px-3 py-2 rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-black dark:text-white"
            />
            <ul className="space-y-2">
              {filteredPermissions.map((perm) => (
                <li
                  key={perm.permission}
                  draggable
                  onDragStart={() => setDraggedPerm(perm)}
                  title={perm.description}
                  className="cursor-move px-3 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600"
                >
                  <div className="font-semibold">{perm.name}</div>
                  <div className="text-sm text-white/80">{perm.description}</div>
                </li>
              ))}
            </ul>
          </div>

          {/* User Drop Zones */}
          <div className="flex-1 grid grid-cols-2 gap-6">
            {users.map((user: any) => (
              <div
                key={user.userid}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(user.userid)}
                className="p-4 border rounded shadow bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{user.email}</p>
                <div className="flex flex-wrap gap-2">
                  {userPermissions[user.userid]?.map((perm) => (
                    <span
                      key={perm.permission}
                      className="px-2 py-1 bg-green-200 dark:bg-green-700 text-sm rounded cursor-pointer text-green-900 dark:text-green-100"
                      onClick={() => handleRemove(user.userid, perm.permission)}
                      title={perm.description}
                    >
                      {perm.name} ✕
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
