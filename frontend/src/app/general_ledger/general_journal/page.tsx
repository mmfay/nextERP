"use client";

import { useEffect, useRef, useState } from "react";
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

  // selection state (checkboxes)
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const selectAllRef = useRef<HTMLInputElement>(null);

  // modal + form state
  const modalRef = useRef<HTMLDialogElement>(null);
  const [newType, setNewType] = useState("");
  const [newDesc, setNewDesc] = useState("");

  useEffect(() => {
    loadJournals();
  }, []);

  useEffect(() => {
    if (!selectAllRef.current) return;
    const total = journals.length;
    const count = selected.size;
    selectAllRef.current.indeterminate = count > 0 && count < total;
  }, [selected, journals]);

  async function loadJournals() {
    setLoading(true);
    try {
      const data = await fetchGeneralJournals();
      setJournals(
        data.map((j: any) => ({
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

  function openModal() {
    if (!modalRef.current) return;
    setNewType("");
    setNewDesc("");
    modalRef.current.showModal();
  }

  function closeModal() {
    modalRef.current?.close();
  }

  async function handleCreate(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!newType.trim() || !newDesc.trim()) {
      alert("Please fill out type and description");
      return;
    }

    setCreating(true);
    try {
      const today = new Date().toISOString().split("T")[0];
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

      setNewType("");
      setNewDesc("");
      closeModal();
    } catch (err: any) {
      console.error("Create failed:", err);
      alert(err?.message || "Failed to create journal");
    } finally {
      setCreating(false);
    }
  }

  // backdrop click to close
  function handleDialogClick(e: React.MouseEvent<HTMLDialogElement>) {
    const dialog = modalRef.current;
    if (!dialog) return;
    const rect = dialog.getBoundingClientRect();
    const inside =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;
    if (!inside && !creating) closeModal();
  }

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === journals.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(journals.map((j) => j.id)));
    }
  }

  return (
    <div className="min-h-screen bg-inherit text-inherit font-[family-name:var(--font-geist-sans)] flex flex-col items-center">
      <main className="pt-24 px-4 sm:px-16 w-full max-w-5xl space-y-8">
        <div className="flex flex-col items-center space-y-3">
          <h2 className="text-2xl font-semibold text-center">General Journals</h2>
          <button
            onClick={openModal}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            New Journal
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Loading...
          </div>
        ) : (
          <div className="overflow-auto rounded-lg border border-black/20 shadow-sm">
            <table className="min-w-full table-auto text-sm">
              <thead className="bg-gray-200 dark:bg-gray-800 text-left text-gray-900 dark:text-white rounded-t-lg">
                <tr>
                  <th className="px-3 py-2 border-b first:rounded-tl-lg">
                    <input
                      ref={selectAllRef}
                      type="checkbox"
                      checked={selected.size > 0 && selected.size === journals.length}
                      onChange={toggleAll}
                      className="form-checkbox h-4 w-4 text-blue-600"
                    />
                  </th>
                  <th className="border-b px-3 py-2">Journal ID</th>
                  <th className="border-b px-3 py-2">Date</th>
                  <th className="border-b px-3 py-2">Type</th>
                  <th className="border-b px-3 py-2">Description</th>
                  <th className="border-b px-3 py-2 last:rounded-tr-lg">Status</th>
                </tr>
              </thead>
              <tbody>
                {journals.map((j, index) => {
                  const isSelected = selected.has(j.id);
                  return (
                    <tr
                      key={j.id ?? `row-${index}`}
                      onClick={() => toggleRow(j.id)}
                      className={`border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer ${
                        isSelected ? "bg-blue-50 dark:bg-blue-900/40" : ""
                      }`}
                    >
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRow(j.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="form-checkbox h-4 w-4 text-blue-600"
                        />
                      </td>
                      <td className="px-3 py-2 border">
                        <Link
                          href={`/general_ledger/general_journal/journal_lines?id=${j.id}`}
                          className="text-blue-600 hover:underline"
                          onClick={(e) => e.stopPropagation()}
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Centered Modal */}
      <dialog
        ref={modalRef}
        onClick={handleDialogClick}
        className="rounded-lg p-0 w-[90vw] max-w-md backdrop:bg-black/50 open:backdrop:opacity-100"
        style={{
          margin: 0,
          inset: "50% auto auto 50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <form
          onSubmit={handleCreate}
          className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 rounded-lg overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Create Journal</h3>
            <button
              type="button"
              onClick={() => !creating && closeModal()}
              className="rounded px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="px-5 py-4 space-y-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Type</label>
              <input
                type="text"
                placeholder="e.g., Adjustment, Accrual, Payroll"
                className="border rounded px-3 py-2 bg-transparent"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Description</label>
              <input
                type="text"
                placeholder="Short description"
                className="border rounded px-3 py-2 bg-transparent"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
            </div>
          </div>

          <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => !creating && closeModal()}
              className="px-4 py-2 rounded border hover:bg-gray-50 dark:hover:bg-gray-900"
              disabled={creating}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {creating ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
