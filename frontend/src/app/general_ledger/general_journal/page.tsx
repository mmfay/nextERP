"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchGeneralJournals,
  createGeneralJournal,
} from "@/lib/api/generalJournals";

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
  const [creating, setCreating] = useState(false);

  // new‐journal form state
  const [newType, setNewType] = useState("");
  const [newDesc, setNewDesc] = useState("");

  useEffect(() => {
    loadJournals();
  }, []);

  async function loadJournals() {
    setLoading(true);
    try {
      const data = await fetchGeneralJournals();
      setJournals(
        data.map((j) => ({
          id: j.journalID,
          journal_date: j.document_date,
          type: j.type,
          description: j.description,
          status: j.status as JournalStatus,
        }))
      );
    } catch (error) {
      console.error("Failed to fetch journals:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!newType.trim() || !newDesc.trim()) {
      alert("Please fill out type and description");
      return;
    }

    setCreating(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const created = await createGeneralJournal({
        document_date: today,
        type: newType.trim(),
        description: newDesc.trim(),
      });

      setJournals((js) => [
        {
          id: created.journalID,
          journal_date: created.document_date,
          type: created.type,
          description: created.description,
          status: created.status as JournalStatus,
        },
        ...js,
      ]);
      // reset form
      setNewType("");
      setNewDesc("");
    } catch (err: any) {
      console.error("Create failed:", err);
      alert(err.message || "Failed to create journal");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen bg-inherit text-inherit font-[family-name:var(--font-geist-sans)] flex flex-col items-center">
      <main className="pt-24 px-4 sm:px-16 w-full max-w-5xl space-y-10">
        <div className="flex flex-col items-center space-y-4">
          <h2 className="text-2xl font-semibold text-center">General Journals</h2>

          {/* New journal form */}
          <div className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
            <input
              type="text"
              placeholder="Type"
              className="flex-1 border rounded px-2 py-1"
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
            />
            <input
              type="text"
              placeholder="Description"
              className="flex-1 border rounded px-2 py-1"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
            <button
              onClick={handleCreate}
              disabled={creating}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {creating ? "Creating…" : "New Journal"}
            </button>
          </div>
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
                  <th className="border px-3 py-2">Date</th>
                  <th className="border px-3 py-2">Type</th>
                  <th className="border px-3 py-2">Description</th>
                  <th className="border px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {journals.map((j, index) => (
                  <tr
                    key={j.id ?? `row-${index}`}
                    className="border-t hover:bg-gray-50"
                  >
                    <td className="px-3 py-2 border text-blue-600 hover:underline">
                      <Link
                        href={`/general_ledger/general_journal/journal_lines?id=${j.id}`}
                      >
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
                        {j.status.toUpperCase()}
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
