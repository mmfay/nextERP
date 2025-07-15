"use client";

import { useState, useEffect } from "react";
import { SecureButton } from "@/app/components/SecureButton";
import { Permissions } from "@/app/config/permissions";
import { ChevronDown, ChevronRight } from "lucide-react";
import { fetchFinancialDimensions } from "@/lib/api/financialDimensions";
import { fetchDimensionValues } from "@/lib/api/financialDimensionValues";
import {
  fetchAccountCombinations,
  saveAccountCombinations,
  AccountCombinationRequest,
} from "@/lib/api/accountCombinations";

const mockAccounts = [
  { account: "4000", description: "Sales Revenue" },
  { account: "5000", description: "Cost of Goods Sold" },
];

export default function AccountStructuresPage() {
  const [structures, setStructures] = useState<Record<string, any[]>>({});
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());
  const [newCombination, setNewCombination] = useState<Record<string, string>>({});
  const [selectedAccount, setSelectedAccount] = useState("");
  const [dimensions, setDimensions] = useState<
    { name: string; key: string; in_use: boolean; values: { code: string; description: string }[] }[]
  >([]);

  useEffect(() => {
    const loadData = async () => {
      const dimensionMeta = await fetchFinancialDimensions();
      const fullList = await Promise.all(
        Array.from({ length: 8 }, async (_, i) => {
          const fd = dimensionMeta.find((d) => d.id === i + 1);
          let values = [];
          if (fd?.in_use) {
            try {
              values = await fetchDimensionValues(fd.id);
            } catch (err) {
              console.error(`Failed to fetch values for dimension ${fd.id}`);
            }
          }
          return {
            name: fd?.name || `FD_${i + 1}`,
            key: `FD_${i + 1}`,
            in_use: fd?.in_use || false,
            values,
          };
        })
      );
      setDimensions(fullList);

      const combos = await fetchAccountCombinations();
      const grouped = combos.reduce((acc, curr) => {
        acc[curr.account] = acc[curr.account] || [];
        acc[curr.account].push(curr.dimensions);
        return acc;
      }, {} as Record<string, any[]>);
      setStructures(grouped);
    };

    loadData();
  }, []);

  const toggleExpand = (acct: string) => {
    const copy = new Set(expandedAccounts);
    copy.has(acct) ? copy.delete(acct) : copy.add(acct);
    setExpandedAccounts(copy);
  };

  const handleAddCombination = async () => {
    if (!selectedAccount) return;

    const newCombo = { ...newCombination };

    // Save to backend
    try {
      await saveAccountCombinations([
        {
          account: selectedAccount,
          dimensions: newCombo,
        } as AccountCombinationRequest,
      ]);
    } catch (error) {
      console.error("Failed to save combination:", error);
      return;
    }

    // Update local state
    setStructures((prev) => {
      const list = prev[selectedAccount] || [];
      return { ...prev, [selectedAccount]: [...list, newCombo] };
    });
    setNewCombination({});
  };

  const getCommaValues = (account: string, dimension: string) => {
    const combos = structures[account] || [];
    const dim = dimensions.find((d) => d.key === dimension);
    const values = combos.map((c) => {
      const val = c[dimension];
      if (!dim?.in_use) return "N/A";
      return val === undefined || val === "" ? "Any" : val;
    });
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
                  {dimensions.map((dim) => (
                    <span key={dim.key}>
                      <strong>{dim.name}:</strong> {getCommaValues(acct.account, dim.key)}
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
                        {dimensions.map((dim) => (
                          <th key={dim.key} className="px-3 py-2 border">
                            {dim.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(structures[acct.account] || []).map((combo, idx) => (
                        <tr key={idx} className="border-t hover:bg-gray-50">
                          {dimensions.map((dim) => (
                            <td key={dim.key} className="px-3 py-2 border">
                              {dim.in_use ? combo[dim.key] || "Any" : "N/A"}
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
            {dimensions.map((dim) => (
              <div key={dim.key}>
                <label className="block text-sm font-medium mb-1">{dim.name}</label>
                <select
                  disabled={!dim.in_use}
                  value={newCombination[dim.key] || ""}
                  onChange={(e) =>
                    setNewCombination((prev) => ({
                      ...prev,
                      [dim.key]: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-md bg-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                >
                  {dim.in_use ? (
                    <>
                      <option value="">Any</option>
                      {dim.values.map((val) => (
                        <option key={val.code} value={val.code}>
                          {val.code} - {val.description}
                        </option>
                      ))}
                    </>
                  ) : (
                    <option value="">Not in use</option>
                  )}
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
