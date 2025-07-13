"use client";

import { useEffect, useState, useRef } from "react";
import { fetchMainAccounts, MainAccount, createMainAccount, deleteMainAccounts } from "@/lib/api/mainAccounts";
import { SecureButton } from "@/app/components/SecureButton";
import { Permissions } from "@/app/config/permissions";

const ACCOUNT_TYPES = ["Asset", "Liability", "Equity", "Revenue", "Expense"];

export default function MainAccountsPage() {
  const [mainAccounts, setMainAccounts] = useState<MainAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAccount, setNewAccount] = useState({ account: "", description: "", type: "Asset" });

  const selectAllRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMainAccounts()
      .then((data) => setMainAccounts(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate =
        selectedAccounts.size > 0 && selectedAccounts.size < mainAccounts.length;
    }
  }, [selectedAccounts, mainAccounts]);

  const handleToggleSelect = (account: string) => {
    setSelectedAccounts((prev) => {
      const newSet = new Set(prev);
      newSet.has(account) ? newSet.delete(account) : newSet.add(account);
      return newSet;
    });
  };

  const handleDelete = async () => {
    try {
      const ids = Array.from(selectedAccounts);
      await deleteMainAccounts(ids);
      setMainAccounts((prev) => prev.filter((acct) => !selectedAccounts.has(acct.account)));
      setSelectedAccounts(new Set());
    } catch (err: any) {
      alert(err.message || "Error deleting accounts");
    }
  };

  const handleAddSubmit = async () => {
    if (!newAccount.account || !newAccount.description || !newAccount.type) return;

    try {
      const created = await createMainAccount(newAccount);
      setMainAccounts((prev) => [...prev, created]);
      setShowAddModal(false);
      setNewAccount({ account: "", description: "", type: "Asset" });
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-inherit text-inherit font-[family-name:var(--font-geist-sans)] flex flex-col items-center">
      <main className="pt-24 px-4 sm:px-16 w-full max-w-4xl space-y-10">
        {/* Controls */}
        <section className="flex justify-center gap-4">
          <SecureButton
            permission={Permissions.SETUP_GL}
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 rounded-md bg-green-600 hover:bg-green-700 text-white transition"
          >
            Add Account
          </SecureButton>
          <SecureButton
            permission={Permissions.SETUP_GL}
            onClick={handleDelete}
            disabled={selectedAccounts.size === 0}
            className={`px-6 py-3 rounded-md transition ${
              selectedAccounts.size === 0
                ? "bg-red-400 cursor-not-allowed text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
            }`}
          >
            Delete Selected
          </SecureButton>
        </section>

        {/* Table or Loading Spinner */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-center">Main Accounts</h2>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div
                className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-solid"
                role="status"
                aria-label="Loading main accounts"
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300 dark:border-gray-700 text-left">
                <thead className="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white">
                  <tr>
                    <th className="px-4 py-2 border-b">
                      <input
                        ref={selectAllRef}
                        type="checkbox"
                        checked={
                          selectedAccounts.size > 0 &&
                          selectedAccounts.size === mainAccounts.length
                        }
                        onChange={() => {
                          if (selectedAccounts.size === mainAccounts.length) {
                            setSelectedAccounts(new Set());
                          } else {
                            setSelectedAccounts(
                              new Set(mainAccounts.map((acct) => acct.account))
                            );
                          }
                        }}
                        className="form-checkbox h-4 w-4 text-blue-600"
                      />
                    </th>
                    <th className="px-4 py-2 border-b">Account</th>
                    <th className="px-4 py-2 border-b">Description</th>
                    <th className="px-4 py-2 border-b">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {mainAccounts.map((acct) => {
                    const isSelected = selectedAccounts.has(acct.account);
                    return (
                      <tr
                        key={acct.account}
                        onClick={() => handleToggleSelect(acct.account)}
                        className={`border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                          isSelected ? "bg-blue-50 dark:bg-blue-900" : ""
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
                        <td className="px-4 py-2">{acct.account}</td>
                        <td className="px-4 py-2">{acct.description}</td>
                        <td className="px-4 py-2">{acct.type}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md shadow-xl space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Add New Account
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Account Number
                </label>
                <input
                  type="text"
                  value={newAccount.account}
                  onChange={(e) =>
                    setNewAccount((prev) => ({ ...prev, account: e.target.value }))
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <input
                  type="text"
                  value={newAccount.description}
                  onChange={(e) =>
                    setNewAccount((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Type
                </label>
                <select
                  value={newAccount.type}
                  onChange={(e) =>
                    setNewAccount((prev) => ({ ...prev, type: e.target.value }))
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white"
                >
                  {ACCOUNT_TYPES.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-md bg-gray-300 dark:bg-gray-700 text-black dark:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSubmit}
                className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
              >
                Add Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
