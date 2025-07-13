"use client";

import { useState } from "react";
import { SecureButton } from "@/app/components/SecureButton";
import { Permissions } from "@/app/config/permissions";
import { ChevronDown, ChevronRight } from "lucide-react";

const mockAccounts = [
  { account: "4000", description: "Sales Revenue" },
  { account: "5000", description: "Cost of Goods Sold" },
];

const mockDimensions = [
  {
    name: "Department",
    values: [
      { code: "01", description: "Northwest" },
      { code: "02", description: "Southwest" },
    ],
  },
  {
    name: "Region",
    values: [
      { code: "US", description: "United States" },
      { code: "CA", description: "Canada" },
    ],
  },
  {
    name: "Project",
    values: [
      { code: "A100", description: "Alpha Build" },
      { code: "B200", description: "Beta Launch" },
    ],
  },
];

export default function AccountStructuresPage() {
  const [structures, setStructures] = useState({});
  const [expandedAccounts, setExpandedAccounts] = useState(new Set());
  const [newCombination, setNewCombination] = useState({});
  const [selectedAccount, setSelectedAccount] = useState("");

  const toggleExpand = (acct) => {
    const copy = new Set(expandedAccounts);
    copy.has(acct) ? copy.delete(acct) : copy.add(acct);
    setExpandedAccounts(copy);
  };

  const handleAddCombination = () => {
    if (!selectedAccount) return;
    setStructures((prev) => {
      const list = prev[selectedAccount] || [];
      return { ...prev, [selectedAccount]: [...list, newCombination] };
    });
    setNewCombination({});
  };

  const getCommaValues = (account, dimension) => {
    const combos = structures[account] || [];
    const values = combos.map((c) => c[dimension] || "Any");
    return [...new Set(values)].join(", ");
  };

  return (
    <div className="min-h-screen bg-inherit text-inherit font-[family-name:var(--font-geist-sans)] flex flex-col items-center">
      <main className="pt-24 px-4 sm:px-16 w-full max-w-5xl space-y-10">
        <h2 className="text-2xl font-semibold mb-4 text-center">Account Structure Overview</h2>
        <div className="space-y-2">
          {mockAccounts.map((acct) => (
            <div key={acct.account} className="border rounded-md">
              <div
                className="flex justify-between items-center px-4 py-2 cursor-pointer bg-gray-100 dark:bg-gray-800"
                onClick={() => toggleExpand(acct.account)}
              >
                <div className="text-sm font-medium">
                  {acct.account} - {acct.description}
                </div>
                <div className="flex items-center gap-6 text-xs">
                  {mockDimensions.map((dim) => (
                    <span key={dim.name}>
                      <strong>{dim.name}:</strong> {getCommaValues(acct.account, dim.name)}
                    </span>
                  ))}
                  {expandedAccounts.has(acct.account) ? <ChevronDown /> : <ChevronRight />}
                </div>
              </div>
              {expandedAccounts.has(acct.account) && (
                <div className="bg-white dark:bg-gray-900 p-4 border-t text-sm">
                  <table className="min-w-full border text-left text-sm">
                    <thead className="bg-gray-200 dark:bg-gray-800">
                      <tr>
                        {mockDimensions.map((dim) => (
                          <th key={dim.name} className="px-3 py-2 border">
                            {dim.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(structures[acct.account] || []).map((combo, idx) => (
                        <tr key={idx} className="border-t hover:bg-gray-50">
                          {mockDimensions.map((dim) => (
                            <td key={dim.name} className="px-3 py-2 border">
                              {combo[dim.name] || "Any"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add New Combination */}
        <section className="pt-10 border-t mt-10">
          <h3 className="text-lg font-semibold text-center mb-4">Add Valid Combination</h3>
          <div className="flex justify-center">
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="px-4 py-2 rounded-md border"
            >
              <option value="" disabled>
                Select Main Account
              </option>
              {mockAccounts.map((acct) => (
                <option key={acct.account} value={acct.account}>
                  {acct.account} - {acct.description}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
            {mockDimensions.map((dim) => (
              <div key={dim.name}>
                <label className="block text-sm font-medium mb-1">
                  {dim.name}
                </label>
                <select
                  value={newCombination[dim.name] || ""}
                  onChange={(e) =>
                    setNewCombination((prev) => ({
                      ...prev,
                      [dim.name]: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Any</option>
                  {dim.values.map((val) => (
                    <option key={val.code} value={val.code}>
                      {val.code} - {val.description}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4">
            <SecureButton
              permission={Permissions.SETUP_GL}
              onClick={handleAddCombination}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Combination
            </SecureButton>
          </div>
        </section>
      </main>
    </div>
  );
}
