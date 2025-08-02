"use client";

import { useEffect, useRef, useState } from "react";
import { fetchPermissions, fetchUsersPermissions } from "@/lib/api/system_admin/permissions";

type Permission = {
  permission: string;
  name: string;
  description: string;
};

export default function PermissionsDragDrop() {
  const [users, setUsers] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [draggedPerm, setDraggedPerm] = useState<Permission | null>(null);
  const [userPermissions, setUserPermissions] = useState<Record<string, Permission[]>>({});
  const [search, setSearch] = useState("");

  const dropAlertRef = useRef<{ userid: string; name: string } | null>(null);
  const removeAlertRef = useRef<{ userid: string; name: string } | null>(null);

  useEffect(() => {
    fetchUsersPermissions().then((data) => {
      setUsers(data);
      const initial = Object.fromEntries(
        data.map((u: any) => [
          u.userid,
          (u.permissions ?? []).map((p: any) => ({
            permission: p.name,
            name: p.fullName,
            description: p.description,
          })),
        ])
      );
      setUserPermissions(initial);
    });

    fetchPermissions().then((data) => {
      const perms = data.map((p: any) => ({
        permission: p.name,
        name: p.fullName,
        description: p.description,
      }));
      setPermissions(perms);
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

  const filteredPermissions = permissions.filter(
    (perm) =>
      perm.name.toLowerCase().includes(search.toLowerCase()) ||
      perm.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-inherit text-inherit font-[var(--font-geist-sans)]">
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
                  {userPermissions[user.userid]?.map((perm, index) => {
                    const key = perm?.permission
                      ? `${user.userid}-${perm.permission}`
                      : `${user.userid}-idx-${index}`;

                    return (
                      <span
                        key={key}
                        className="px-2 py-1 bg-green-200 dark:bg-green-700 text-sm rounded cursor-pointer text-green-900 dark:text-green-100"
                        onClick={() => handleRemove(user.userid, perm.permission)}
                        title={perm.description}
                      >
                        {perm.name} ✕
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
