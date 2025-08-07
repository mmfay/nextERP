"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchInventoryJournal } from "@/lib/api/inventory/inventoryJournals";
import { JOURNALTYPE } from "@/lib/constants/enums";

type InventoryJournalHeader = {
  journalID: string;
  description: string;
  status: number;  // 0 or 1
  type: number;    // enum value
  record: number;
};

export default function InventoryAdjustmentPage() {
  const [journals, setJournals] = useState<InventoryJournalHeader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventoryJournal(JOURNALTYPE.ADJUSTMENT)
      .then(setJournals)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getStatusLabel = (status: number) =>
    status === 1 ? "posted" : "draft";

  return (
    <div className="min-h-screen pt-24 px-4 sm:px-16 bg-inherit text-inherit font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-2xl font-bold mb-6 text-center">Inventory Adjustment Journals</h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 dark:border-gray-700 text-left">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold">
                <th className="px-4 py-2 border-b">Journal ID</th>
                <th className="px-4 py-2 border-b">Description</th>
                <th className="px-4 py-2 border-b">Status</th>
              </tr>
            </thead>
            <tbody>
              {journals.map((journal) => (
                <tr
                  key={journal.journalID}
                  className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="px-4 py-2">
                    <Link
                      href={`/inventory/adjustments/${journal.journalID}`}
                      className="text-blue-600 hover:underline"
                    >
                      {journal.journalID}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{journal.description}</td>
                  <td className="px-4 py-2">{getStatusLabel(journal.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {journals.length === 0 && (
            <p className="text-center mt-4 text-gray-500 dark:text-gray-400">
              No journals found.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
