"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchGeneralJournals } from "@/lib/api/generalJournals"; // ✅ Make sure this path is correct

type JournalStatus = "draft" | "posted";

type JournalHeader = {
  id: string;
  journal_date: string;
  type: string;
  description: string;
  status: JournalStatus;
};

export default function GeneralJournalPage() {
  const [journals, setJournals] = useState<JournalHeader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGeneralJournals()
      .then((data) =>
        setJournals(
          data.map((j) => ({
            id: j.journalID,
            journal_date: j.document_date,
            type: j.type,
            description: j.description,
            status: j.status as JournalStatus,
          }))
        )
      )
      .catch((error) => {
        console.error("Failed to fetch journals:", error);
      })
      .finally(() => setLoading(false));
  }, []);


  return (
    <div className="min-h-screen bg-inherit text-inherit font-[family-name:var(--font-geist-sans)] flex flex-col items-center">
      <main className="pt-24 px-4 sm:px-16 w-full max-w-5xl space-y-10">
        <div className="flex flex-col items-center space-y-4">
          <h2 className="text-2xl font-semibold text-center">General Journals</h2>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading...</div>
        ) : (
          <div className="overflow-auto border rounded-md shadow-sm">
            <table className="min-w-full table-auto border-collapse text-sm">
              <thead className="bg-gray-200 dark:bg-gray-800 text-left">
                <tr>
                  <th className="border px-3 py-2">Journal ID</th>
                  <th className="border px-3 py-2">Date</th>
                  <th className="border px-3 py-2">Type</th>
                  <th className="border px-3 py-2">Description</th>
                  <th className="border px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {journals.map((j, index) => (
                  <tr key={j.id ?? `row-${index}`} className="border-t hover:bg-gray-50">
                    <td className="px-3 py-2 border text-blue-600 hover:underline">
                      <Link href={`/general_ledger/general_journal/journal_lines?id=${j.id}`}>
                        {j.id}
                      </Link>
                    </td>
                    <td className="px-3 py-2 border">{j.journal_date}</td>
                    <td className="px-3 py-2 border">{j.type}</td>
                    <td className="px-3 py-2 border">{j.description}</td>
                    <td className="px-3 py-2 border">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs ${
                          j.status === "posted"
                            ? "bg-green-200 text-green-800"
                            : "bg-yellow-200 text-yellow-800"
                        }`}
                      >
                        {j.status ? j.status.toUpperCase() : "UNKNOWN"}
                      </span>
                    </td>
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
