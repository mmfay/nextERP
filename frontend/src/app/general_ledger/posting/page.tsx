"use client";

import { useEffect, useState } from "react";
import { fetchPostingSetup, updatePostingSetup } from "@/lib/api/postingSetup";
import { fetchMainAccounts } from "@/lib/api/general_ledger/mainAccounts";

const moduleTabs: Record<number, string> = {
  0: "purchase",
  1: "inventory",
  2: "sales"
};

export default function PostingPage() {
  const [activeTab, setActiveTab] = useState("purchase");
  const [postingRows, setPostingRows] = useState([]);
  const [accountMappings, setAccountMappings] = useState<Record<string, string>>({});
  const [originalMappings, setOriginalMappings] = useState<Record<string, string>>({});
  const [mainAccounts, setMainAccounts] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [postingData, accountsData] = await Promise.all([
          fetchPostingSetup(),
          fetchMainAccounts()
        ]);

        setPostingRows(postingData);
        setMainAccounts(accountsData);

        const mappings: Record<string, string> = {};
        for (const item of postingData) {
          const match = accountsData.find(a => a.account === item.account);
          if (match) {
            mappings[item.type] = `${match.account} - ${match.description}`;
          }
        }
        setAccountMappings(mappings);
        setOriginalMappings(mappings);
      } catch (err) {
        console.error("Failed to fetch posting setup or accounts:", err);
      }
    };

    loadData();
  }, []);

  const handleChange = (label: string, value: string) => {
    setAccountMappings((prev) => ({ ...prev, [label]: value }));
  };

  const extractAccountNumber = (value: string) => {
    return value.split(" - ")[0];
  };

  const filteredRows = postingRows.filter(
    (row) => moduleTabs[row.module] === activeTab
  );

  const getDropdownOptions = (type: string) => {
    return mainAccounts
      .filter((acct) => acct.type === type)
      .map((acct) => `${acct.account} - ${acct.description}`);
  };

  const getChangedRecords = () => {
    return postingRows
      .filter((row) => accountMappings[row.type] !== originalMappings[row.type])
      .map((row) => ({
        type: row.type,
        module: row.module,
        accountType: row.accountType,
        account: extractAccountNumber(accountMappings[row.type])
      }));
  };

  const hasChanges = Object.keys(accountMappings).some(
    (key) => accountMappings[key] !== originalMappings[key]
  );

  const handleSave = async () => {
    const changed = getChangedRecords();
    if (!changed.length) return;
    setSaving(true);
    try {
      await updatePostingSetup(changed);
      setOriginalMappings({ ...accountMappings });
    } catch (err) {
      console.error("Failed to update posting setup:", err);
      alert("Error saving changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 px-4 sm:px-16 w-full flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <h2 className="text-2xl font-semibold text-center mb-8">Posting Setup</h2>

        <div className="flex justify-center mb-4 gap-2">
          {Object.entries(moduleTabs).map(([key, name]) => (
            <button
              key={key}
              className={`px-4 py-2 rounded ${
                activeTab === name ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
              onClick={() => setActiveTab(name)}
            >
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </button>
          ))}
        </div>

        <div className="border rounded-md shadow-sm overflow-auto">
          <table className="min-w-full table-auto border-collapse text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2 text-left">Posting Type</th>
                <th className="border px-4 py-2 text-left">Account Type</th>
                <th className="border px-4 py-2 text-left">GL Account</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map(({ type, accountType }) => (
                <tr key={type} className="border-t">
                  <td className="border px-4 py-2 font-medium">{type}</td>
                  <td className="border px-4 py-2">{accountType}</td>
                  <td className="border px-4 py-2">
                    <select
                      className="w-full border rounded px-2 py-1"
                      value={accountMappings[type] || ""}
                      onChange={(e) => handleChange(type, e.target.value)}
                    >
                      <option value="">-- Select --</option>
                      {getDropdownOptions(accountType).map((acct) => (
                        <option key={acct} value={acct}>
                          {acct}
                        </option>
                      ))}
                    </select>
                    {accountMappings[type] && (
                      <div className="absolute opacity-0 pointer-events-none">
                        {extractAccountNumber(accountMappings[type])}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          disabled={!hasChanges || saving}
          className={`mt-6 px-6 py-2 rounded font-medium text-white ${
            hasChanges && !saving
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
          onClick={handleSave}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
