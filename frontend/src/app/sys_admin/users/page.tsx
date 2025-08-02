"use client";

import { useEffect, useState, useRef } from "react";
import {
  fetchUserAccounts,
  deleteUserAccounts,
  createUserAccount,
  updateUserEnabled,
} from "@/lib/api/system_admin/users";
import { SecureButton } from "@/app/components/SecureButton";
import { Permissions } from "@/app/config/permissions";

export type UserAccounts = {
  userid: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  enabled: boolean;
};

export default function UserAccountsPage() {
  const [userAccounts, setUserAccounts] = useState<UserAccounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState<UserAccounts>({
    userid: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    enabled: true,
  });

  const selectAllRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchUserAccounts()
      .then(setUserAccounts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate =
        selectedUsers.size > 0 && selectedUsers.size < userAccounts.length;
    }
  }, [selectedUsers, userAccounts]);

  const handleToggleSelect = (userid: string) => {
    setSelectedUsers((prev) => {
      const newSet = new Set(prev);
      newSet.has(userid) ? newSet.delete(userid) : newSet.add(userid);
      return newSet;
    });
  };

  const handleDelete = async () => {
    try {
      const userids = Array.from(selectedUsers);
      await deleteUserAccounts(userids);
      setUserAccounts((prev) =>
        prev.filter((user) => !selectedUsers.has(user.userid))
      );
      setSelectedUsers(new Set());
    } catch (err: any) {
      alert(err.message || "Error deleting user accounts");
    }
  };

  const handleToggleEnabled = async (userid: string, enabled: boolean) => {
    try {
      await updateUserEnabled(userid, enabled);
      setUserAccounts((prev) =>
        prev.map((u) => (u.userid === userid ? { ...u, enabled } : u))
      );
    } catch (err: any) {
      alert(err.message || "Failed to update enabled state");
    }
  };

  const handleAddSubmit = async () => {
    if (!newUser.email || !newUser.password) return;
    try {
      const created = await createUserAccount(newUser);
      setUserAccounts((prev) => [...prev, created]);
      setShowAddModal(false);
      setNewUser({
        userid: "",
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        enabled: true,
      });
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center pt-24 px-4 sm:px-16">
      <main className="w-full max-w-6xl space-y-10">
        {/* Controls */}
        <section className="flex justify-center gap-4">
          <SecureButton
            permission={Permissions.MOD_SYSADMIN}
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 rounded-md bg-green-600 hover:bg-green-700 text-white"
          >
            Add User
          </SecureButton>
          <SecureButton
            permission={Permissions.MOD_SYSADMIN}
            onClick={handleDelete}
            disabled={selectedUsers.size === 0}
            className={`px-6 py-3 rounded-md transition ${
              selectedUsers.size === 0
                ? "bg-red-400 cursor-not-allowed text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
            }`}
          >
            Delete Selected
          </SecureButton>
        </section>

        {/* Table */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-center">User Accounts</h2>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin h-12 w-12 border-t-4 border-blue-600 rounded-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300 text-left">
                <thead className="bg-gray-200 text-gray-900">
                  <tr>
                    <th className="px-4 py-2 border-b">
                      <input
                        ref={selectAllRef}
                        type="checkbox"
                        checked={
                          selectedUsers.size > 0 &&
                          selectedUsers.size === userAccounts.length
                        }
                        onChange={() => {
                          if (selectedUsers.size === userAccounts.length) {
                            setSelectedUsers(new Set());
                          } else {
                            setSelectedUsers(
                              new Set(userAccounts.map((u) => u.userid))
                            );
                          }
                        }}
                        className="form-checkbox h-4 w-4 text-blue-600"
                      />
                    </th>
                    <th className="px-4 py-2 border-b">User ID</th>
                    <th className="px-4 py-2 border-b">Email</th>
                    <th className="px-4 py-2 border-b">First Name</th>
                    <th className="px-4 py-2 border-b">Last Name</th>
                    <th className="px-4 py-2 border-b">Enabled</th>
                  </tr>
                </thead>
                <tbody>
                  {userAccounts.map((user) => {
                    const isSelected = selectedUsers.has(user.userid);
                    return (
                      <tr
                        key={user.userid}
                        onClick={() => handleToggleSelect(user.userid)}
                        className={`border-b hover:bg-gray-50 ${
                          isSelected ? "bg-blue-50" : ""
                        } cursor-pointer`}
                      >
                        <td className="px-4 py-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            onClick={(e) => e.stopPropagation()}
                            className="form-checkbox h-4 w-4 text-blue-600"
                          />
                        </td>
                        <td className="px-4 py-2">{user.userid}</td>
                        <td className="px-4 py-2">{user.email}</td>
                        <td className="px-4 py-2">{user.firstName}</td>
                        <td className="px-4 py-2">{user.lastName}</td>
                        <td className="px-4 py-2">
                          <input
                            type="checkbox"
                            checked={user.enabled}
                            onChange={(e) =>
                              handleToggleEnabled(user.userid, e.target.checked)
                            }
                            onClick={(e) => e.stopPropagation()}
                            className="h-4 w-4 text-green-600"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl space-y-4">
            <h3 className="text-xl font-semibold">Add New User</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium">User ID</label>
                <input
                  type="text"
                  value={newUser.userid}
                  onChange={(e) =>
                    setNewUser((prev) => ({ ...prev, userid: e.target.value }))
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">First Name</label>
                <input
                  type="text"
                  value={newUser.firstName}
                  onChange={(e) =>
                    setNewUser((prev) => ({ ...prev, firstName: e.target.value }))
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Last Name</label>
                <input
                  type="text"
                  value={newUser.lastName}
                  onChange={(e) =>
                    setNewUser((prev) => ({ ...prev, lastName: e.target.value }))
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser((prev) => ({ ...prev, password: e.target.value }))
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Enabled</label>
                <div className="mt-1">
                  <input
                    type="checkbox"
                    checked={newUser.enabled}
                    onChange={(e) =>
                      setNewUser((prev) => ({
                        ...prev,
                        enabled: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 text-green-600"
                  />{" "}
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-md bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSubmit}
                className="px-4 py-2 rounded-md bg-blue-600 text-white"
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
