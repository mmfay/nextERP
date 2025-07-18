"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchJournalLines, JournalLine } from "@/lib/api/journalLines";

export default function JournalLinesPage() {
  const params = useSearchParams();
  const journalId = params.get("id");

  const [lines, setLines] = useState<JournalLine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!journalId) return;

    fetchJournalLines(journalId)
      .then(setLines)
      .catch((err) => console.error("Failed to fetch journal lines:", err))
      .finally(() => setLoading(false));
  }, [journalId]);

  return (
    <div className="min-h-screen bg-inherit text-inherit font-[family-name:var(--font-geist-sans)] flex flex-col items-center">
      <main className="pt-24 px-4 sm:px-16 w-full max-w-5xl space-y-10">
        <div className="flex flex-col items-center space-y-4">
          <h2 className="text-2xl font-semibold text-center">
            Journal Lines for {journalId}
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading...</div>
        ) : lines.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">No lines found.</div>
        ) : (
          <div className="overflow-auto border rounded-md shadow-sm">
            <table className="min-w-full table-auto border-collapse text-sm">
              <thead className="bg-gray-200 dark:bg-gray-800 text-left">
                <tr>
                  <th className="border px-3 py-2">Line ID</th>
                  <th className="border px-3 py-2">Account</th>
                  <th className="border px-3 py-2">Description</th>
                  <th className="border px-3 py-2">Debit</th>
                  <th className="border px-3 py-2">Credit</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, index) => (
                  <tr key={line.lineID ?? `line-${index}`} className="border-t hover:bg-gray-50">
                    <td className="px-3 py-2 border">{line.lineID}</td>
                    <td className="px-3 py-2 border">{line.account}</td>
                    <td className="px-3 py-2 border">{line.description ?? ""}</td>
                    <td className="px-3 py-2 border text-right">{line.debit.toFixed(2)}</td>
                    <td className="px-3 py-2 border text-right">{line.credit.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
