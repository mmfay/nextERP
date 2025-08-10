"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchInventoryJournal } from "@/lib/api/inventory/inventoryJournals";
import { JOURNALTYPE } from "@/lib/constants/enums";

type InventoryJournalHeader = {
  journalID: string;
  description: string;
  status: number;  // 0 = draft, 1 = posted
  type: number;
  record: number;
};

export default function InventoryAdjustmentPage() {
  const [journals, setJournals] = useState<InventoryJournalHeader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJournals();
  }, []);

  async function loadJournals() {
    setLoading(true);
    try {
      const data = await fetchInventoryJournal(JOURNALTYPE.ADJUSTMENT);
      setJournals(data);
    } catch (err) {
      console.error("Failed to fetch inventory adjustment journals:", err);
    } finally {
      setLoading(false);
    }
  }

  const getStatusLabel = (status: number) =>
    status === 1 ? "posted" : "draft";

  return (
    <div className="min-h-screen bg-inherit text-inherit font-[family-name:var(--font-geist-sans)] flex flex-col items-center">
      <main className="pt-24 px-4 sm:px-16 w-full max-w-5xl space-y-10">
        <div className="flex flex-col items-center space-y-4">
          <h2 className="text-2xl font-semibold text-center">Inventory Adjustment Journals</h2>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Loading...
          </div>
        ) : (
          <div className="overflow-auto border rounded-md shadow-sm">
            <table className="min-w-full table-auto border-collapse text-sm">
              <thead className="bg-gray-200 dark:bg-gray-800 text-left">
                <tr>
                  <th className="border px-3 py-2">Journal ID</th>
                  <th className="border px-3 py-2">Description</th>
                  <th className="border px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {journals.map((j, index) => (
                  <tr
                    key={j.journalID ?? `row-${index}`}
                    className="border-t hover:bg-gray-50"
                  >
                    <td className="px-3 py-2 border text-blue-600 hover:underline">
                        <Link
                          href={{
                            pathname: `/inventory/adjustments/${j.journalID}`,
                            query: {
                              journalID: j.journalID,
                              status: j.status,
                            },
                          }}
                        >
                          {j.journalID}
                        </Link>
                    </td>
                    <td className="px-3 py-2 border">{j.description}</td>
                    <td className="px-3 py-2 border">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs ${
                          j.status === 1
                            ? "bg-green-200 text-green-800"
                            : "bg-yellow-200 text-yellow-800"
                        }`}
                      >
                        {getStatusLabel(j.status).toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {journals.length === 0 && (
              <p className="text-center mt-4 text-gray-500 dark:text-gray-400">
                No inventory adjustment journals found.
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
