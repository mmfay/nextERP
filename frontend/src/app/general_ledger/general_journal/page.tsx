"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  fetchGeneralJournalsPage,
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

type PageEnvelope = {
  items: any[];
  has_next: boolean;
  has_prev: boolean;
  next_cursor?: string | null;
  prev_cursor?: string | null;
  limit: number;
};

const PAGE_SIZE = 50;

export default function GeneralJournalPage() {
  // page cache: one chunk per page index
  const [pages, setPages] = useState<JournalHeader[][]>([]);
  const [pageNextCursors, setPageNextCursors] = useState<(string | null)[]>([]);
  const [pageHasNext, setPageHasNext] = useState<boolean[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // selection state (checkboxes) for current page only
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const selectAllRef = useRef<HTMLInputElement>(null);

  // modal + form state
  const modalRef = useRef<HTMLDialogElement>(null);
  const [newType, setNewType] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const currentPage = pages[currentIdx] ?? [];
  const hasPrev = currentIdx > 0;
  const hasNext = pageHasNext[currentIdx] ?? false;
  const nextCursor = pageNextCursors[currentIdx] ?? null;

  useEffect(() => {
    loadFirstPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // indeterminate checkbox
  useEffect(() => {
    if (!selectAllRef.current) return;
    const total = currentPage.length;
    const count = selected.size;
    selectAllRef.current.indeterminate = count > 0 && count < total;
  }, [selected, currentPage]);

  async function loadFirstPage() {
    setLoading(true);
    try {
      const page = (await fetchGeneralJournalsPage({
        limit: PAGE_SIZE,
      })) as unknown as PageEnvelope;

      const mapped = page.items.map((j: any) => ({
        id: j.journalID,
        journal_date: j.document_date,
        type: j.type,
        description: j.description,
        status: j.status as JournalStatus,
      }));

      setPages([mapped]);
      setPageNextCursors([page.next_cursor ?? null]);
      setPageHasNext([page.has_next]);
      setCurrentIdx(0);
      setSelected(new Set());
    } catch (error) {
      console.error("Failed to fetch journals:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadNext() {
    if (loading || !hasNext || !nextCursor) return;
    setLoading(true);
    try {
      const page = (await fetchGeneralJournalsPage({
        limit: PAGE_SIZE,
        next_cursor: nextCursor,
      })) as unknown as PageEnvelope;

      const mapped = page.items.map((j: any) => ({
        id: j.journalID,
        journal_date: j.document_date,
        type: j.type,
        description: j.description,
        status: j.status as JournalStatus,
      }));

      setPages((prev) => [...prev.slice(0, currentIdx + 1), mapped]);
      setPageNextCursors((prev) => [
        ...prev.slice(0, currentIdx + 1),
        page.next_cursor ?? null,
      ]);
      setPageHasNext((prev) => [...prev.slice(0, currentIdx + 1), page.has_next]);

      setCurrentIdx((i) => i + 1);
      setSelected(new Set());
    } catch (error) {
      console.error("Failed to load next page:", error);
    } finally {
      setLoading(false);
    }
  }

  function loadPrev() {
    if (!hasPrev) return;
    setCurrentIdx((i) => Math.max(0, i - 1));
    setSelected(new Set());
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

      // If we're on the first page, prepend the new item (trim to PAGE_SIZE)
      setPages((prev) => {
        if (currentIdx !== 0) return prev;
        const updatedPage0: JournalHeader[] = [
          {
            id: created.journalID,
            journal_date: created.document_date,
            type: created.type,
            description: created.description,
            status: created.status as JournalStatus,
          },
          ...(prev[0] ?? []),
        ].slice(0, PAGE_SIZE);
        const next = [...prev];
        next[0] = updatedPage0;
        return next;
      });

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
    if (selected.size === currentPage.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(currentPage.map((j) => j.id)));
    }
  }

  return (
    <div className="min-h-screen bg-inherit text-inherit font-[family-name:var(--font-geist-sans)] flex flex-col items-center">
      <main className="pt-24 px-4 sm:px-16 w-full max-w-6xl space-y-4">

        {/* Sticky top bar: title + actions + pager */}
        <div className="sticky top-20 z-20 bg-inherit border-b border-black/10 dark:border-white/10">
          <div className="py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-semibold">General Journals</h2>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={openModal}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                New Journal
              </button>
              <button
                onClick={loadFirstPage}
                className="px-3 py-2 rounded border hover:bg-gray-50 dark:hover:bg-gray-900"
                disabled={loading}
                title="Refresh"
              >
                Refresh
              </button>

              <div className="mx-2 h-6 w-px bg-black/10 dark:bg-white/10" />

              <button
                onClick={loadPrev}
                disabled={!hasPrev || loading}
                className="px-3 py-2 rounded border hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-50"
              >
                ◀ Prev
              </button>

              <span className="text-sm text-gray-600 dark:text-gray-300 px-2">
                Page {currentIdx + 1}
              </span>

              <button
                onClick={loadNext}
                disabled={loading || !hasNext || !nextCursor}
                className="px-3 py-2 rounded border hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-50"
              >
                Next ▶
              </button>

              {!hasNext && (
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                  No more results
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable table container */}
        <div className="rounded-lg border border-black/20 shadow-sm">
          <div className="max-h-[70vh] overflow-auto">
            <table className="min-w-full table-auto text-sm border-collapse">
              {/* Sticky header inside scroll container */}
              <thead className="sticky top-0 z-10 bg-gray-200 dark:bg-gray-800 text-left text-gray-900 dark:text-white">
                <tr>
                  <th className="px-3 py-2 border-b">
                    <input
                      ref={selectAllRef}
                      type="checkbox"
                      checked={
                        selected.size > 0 &&
                        selected.size === (currentPage?.length ?? 0)
                      }
                      onChange={toggleAll}
                      className="form-checkbox h-4 w-4 text-blue-600"
                    />
                  </th>
                  <th className="border-b px-3 py-2">Journal ID</th>
                  <th className="border-b px-3 py-2">Date</th>
                  <th className="border-b px-3 py-2">Type</th>
                  <th className="border-b px-3 py-2">Description</th>
                  <th className="border-b px-3 py-2">Status</th>
                </tr>
              </thead>

              <tbody>
                {loading && pages.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-gray-500 dark:text-gray-400">
                      Loading...
                    </td>
                  </tr>
                ) : (
                  <>
                    {currentPage.map((j, index) => {
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
                          <td className="px-3 py-2">
                            <Link
                              href={`/general_ledger/general_journal/journal_lines?id=${j.id}`}
                              className="text-blue-600 hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {j.id}
                            </Link>
                          </td>
                          <td className="px-3 py-2">{j.journal_date}</td>
                          <td className="px-3 py-2">{j.type}</td>
                          <td className="px-3 py-2">{j.description}</td>
                          <td className="px-3 py-2">
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

                    {currentPage.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-3 py-6 text-center text-gray-500 dark:text-gray-400">
                          No records on this page.
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
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
