"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  fetchInventoryJournalLines,
  updateInventoryJournalLines,
  deleteInventoryJournalLine,
  postInventoryJournal,
  fetchInventoryJournalHeader,
} from "@/lib/api/inventory/inventoryJournals";

type InventoryDimensions = {
  warehouse: string;
  location: string;
  config?: string;
  size?: string;
  batch?: string;
  serial?: string;
  record: number;
};

type InventoryJournalLine = {
  journalID: string;
  item: string;
  dimension: InventoryDimensions;
  qty: number;
  cost: number;
  record: number;
};

type InventoryJournalHeader = {
  journalID: string;
  description: string;
  status: number; // 0 = draft, 1 = posted
  type: number;
  record: number;
};

const warehouseOptions = ["WH01", "WH02", "WH03"];
const locationOptions = ["LOC01", "LOC02", "LOC03", "LOC04"];

export default function InventoryJournalLinesPage() {
  const params = useSearchParams();
  const journalID = params.get("journalID")!;
  const statusParam = params.get("status");
  const [lines, setLines] = useState<InventoryJournalLine[]>([]);
  const [header, setHeader] = useState<InventoryJournalHeader | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [posting, setPosting] = useState(false);

  const isDraft = header?.status === 0;

  useEffect(() => {
    if (!journalID) return;
    const loadData = async () => {
      setLoading(true);
      try {
        const [fetchedLines, fetchedHeader] = await Promise.all([
          fetchInventoryJournalLines(journalID),
          fetchInventoryJournalHeader(journalID),
        ]);
        setLines(fetchedLines);
        setHeader(fetchedHeader);
      } catch (err) {
        console.error("Failed to load inventory journal data", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [journalID]);

  function handleLineChange(idx: number, field: keyof InventoryJournalLine | "warehouse" | "location", value: string | number) {
    setLines(ls =>
      ls.map((line, i) => {
        if (i !== idx) return line;
        const updated = { ...line };
        if (field === "warehouse") {
          updated.dimension.warehouse = value as string;
        } else if (field === "location") {
          updated.dimension.location = value as string;
        } else {
          (updated as any)[field] = value;
        }
        return updated;
      })
    );
  }

  function handleAddLine() {
    setLines(ls => [
      ...ls,
      {
        journalID,
        item: "",
        qty: 0,
        cost: 0,
        record: Date.now(), // temporary ID
        dimension: {
          warehouse: warehouseOptions[0],
          location: locationOptions[0],
          record: Date.now(),
        },
      },
    ]);
  }

  async function handleDelete(idx: number) {
    const line = lines[idx];
    if (line.record && typeof line.record === "number") {
      try {
        await deleteInventoryJournalLine(journalID, line.record);
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
    setLines(ls => ls.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await updateInventoryJournalLines(journalID, lines);
      setLines(updated);
      alert("Saved successfully!");
    } catch (err) {
      console.error("Save failed:", err);
      alert("Save failed. See console.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePost() {
    setPosting(true);
    try {
      const updatedHeader = await postInventoryJournal(journalID);
      setHeader(updatedHeader);
      alert("Journal posted!");
    } catch (err: any) {
      console.error("Post failed:", err);
      alert(err.message || "Post failed. See console.");
    } finally {
      setPosting(false);
    }
  }

  const getStatusLabel = (status: number) => (status === 1 ? "posted" : "draft");

  return (
    <div className="min-h-screen bg-inherit text-inherit font-[family-name:var(--font-geist-sans)] flex flex-col items-center">
      <main className="pt-24 px-4 sm:px-16 w-full max-w-5xl space-y-8">
        <div className="flex flex-col items-center space-y-2">
          <h2 className="text-2xl font-semibold text-center">
            Inventory Journal Lines for {journalID}
          </h2>
          {header && (
            <span
              className={`text-sm px-2 py-1 rounded-full font-medium ${
                isDraft ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
              }`}
            >
              Status: {getStatusLabel(header.status)}
            </span>
          )}
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Loading...
          </div>
        ) : (
          <>
            {isDraft && (
              <div className="flex gap-3">
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  onClick={handleAddLine}
                >
                  + Add Line
                </button>
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
                <button
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
                  onClick={handlePost}
                  disabled={posting}
                >
                  {posting ? "Posting…" : "Post Journal"}
                </button>
              </div>
            )}

            <div className="overflow-auto border rounded-md shadow-sm">
              <table className="min-w-full text-sm border-collapse">
                <thead className="bg-gray-200 dark:bg-gray-800 text-left">
                  <tr>
                    <th className="border px-3 py-2">Item</th>
                    <th className="border px-3 py-2">Warehouse</th>
                    <th className="border px-3 py-2">Location</th>
                    <th className="border px-3 py-2 text-right">Qty</th>
                    <th className="border px-3 py-2 text-right">Cost</th>
                    <th className="border px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, idx) => (
                    <tr key={line.record} className="border-t hover:bg-gray-50 dark:hover:text-black">
                      <td className="px-3 py-2 border">
                        <input
                          disabled={!isDraft}
                          type="text"
                          className="w-full border rounded px-2 py-1"
                          value={line.item}
                          onChange={e => handleLineChange(idx, "item", e.target.value)}
                        />
                      </td>
                      <td className="px-3 py-2 border">
                        <select
                          disabled={!isDraft}
                          className="w-full border rounded px-2 py-1"
                          value={line.dimension.warehouse}
                          onChange={e => handleLineChange(idx, "warehouse", e.target.value)}
                        >
                          {warehouseOptions.map(wh => (
                            <option key={wh} value={wh}>{wh}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2 border">
                        <select
                          disabled={!isDraft}
                          className="w-full border rounded px-2 py-1"
                          value={line.dimension.location}
                          onChange={e => handleLineChange(idx, "location", e.target.value)}
                        >
                          {locationOptions.map(loc => (
                            <option key={loc} value={loc}>{loc}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2 border text-right">
                        <input
                          disabled={!isDraft}
                          type="number"
                          className="w-full text-right border rounded px-2 py-1"
                          value={line.qty}
                          onChange={e => handleLineChange(idx, "qty", parseFloat(e.target.value))}
                        />
                      </td>
                      <td className="px-3 py-2 border text-right">
                        ${Number(line.cost).toFixed(2)}
                      </td>
                      <td className="px-3 py-2 border text-center">
                        {isDraft && (
                          <button
                            className="text-red-500 hover:underline"
                            onClick={() => handleDelete(idx)}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {lines.length === 0 && (
                <p className="text-center mt-4 text-gray-500 dark:text-gray-400">
                  No journal lines found.
                </p>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
