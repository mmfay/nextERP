"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  fetchJournalLines,
  updateJournalLines,
  deleteJournalLine,
  JournalLine,
} from "@/lib/api/journalLines";
import {
  fetchJournalHeader,
  postGeneralJournal,
  type GeneralJournal,
} from "@/lib/api/generalJournals";
import { fetchMainAccounts, MainAccount } from "@/lib/api/mainAccounts";

export default function JournalLinesPage() {
  const params = useSearchParams();
  const journalId = params.get("id")!;

  const [journalHeader, setJournalHeader] = useState<GeneralJournal | null>(null);
  const [lines, setLines] = useState<JournalLine[]>([]);
  const [mainAccounts, setMainAccounts] = useState<MainAccount[]>([]);
  const [journalStatus, setJournalStatus] = useState<"draft" | "posted" | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [posting, setPosting] = useState(false);

  const accountToDesc = useMemo(
    () => Object.fromEntries(mainAccounts.map(({ account, description }) => [account, description])),
    [mainAccounts]
  );
  const descToAccount = useMemo(
    () => Object.fromEntries(mainAccounts.map(({ account, description }) => [description, account])),
    [mainAccounts]
  );

  // initial fetch
  useEffect(() => {
    if (!journalId) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [rawLines, header, accounts] = await Promise.all([
          fetchJournalLines(journalId),
          fetchJournalHeader(journalId),
          fetchMainAccounts(),
        ]);
        setMainAccounts(accounts);
        setJournalHeader(header);
        setJournalStatus(header.status);
        // seed each line.description to match account
        const acctMap = Object.fromEntries(accounts.map(({ account, description }) => [account, description]));
        setLines(rawLines.map(l => ({ ...l, description: acctMap[l.account] ?? "" })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [journalId]);

  // update a single cell
  function handleLineChange(idx: number, field: keyof JournalLine, value: any) {
    setLines(ls =>
      ls.map((line, i) => {
        if (i !== idx) return line;
        const updated = { ...line };
        if (field === "account") {
          updated.account = value;
          updated.description = accountToDesc[value] ?? "";
        } else if (field === "description") {
          updated.description = value;
          updated.account = descToAccount[value] ?? "";
        } else {
          (updated as any)[field] = value;
        }
        return updated;
      })
    );
  }

  // add blank row
  function handleAddLine() {
    setLines(ls => [
      ...ls,
      { lineID: "", journalID: journalId, account: "", description: "", debit: 0, credit: 0 },
    ]);
  }

  // delete row locally (and optionally immediately on server)
  async function handleDelete(idx: number) {
    const line = lines[idx];
    if (line.lineID) {
      try {
        await deleteJournalLine(journalId, line.lineID);
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
    setLines(ls => ls.filter((_, i) => i !== idx));
  }

  // bulk-upsert all lines
  async function handleSave() {
    setSaving(true);
    try {
      const updated = await updateJournalLines(journalId, lines);
      const acctMap = Object.fromEntries(mainAccounts.map(({ account, description }) => [account, description]));
      setLines(updated.map(l => ({ ...l, description: acctMap[l.account] ?? "" })));
      alert("Saved successfully!");
    } catch (err) {
      console.error("Save failed:", err);
      alert("Save failed. See console.");
    } finally {
      setSaving(false);
    }
  }

  // mark journal as posted
  async function handlePost() {
    if (!journalHeader) return;
    setPosting(true);
    try {
      // pass the ID directly to your PATCH helper
      const updatedHeader = await postGeneralJournal(journalId);
      setJournalHeader(updatedHeader);
      setJournalStatus(updatedHeader.status);
      alert("Journal posted!");
    } catch (err: any) {
      console.error("Post failed:", err);
      alert(err.message || "Post failed. See console.");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-inherit text-inherit font-[family-name:var(--font-geist-sans)]">
      <main className="pt-24 px-4 sm:px-16 w-full max-w-5xl space-y-6">
        <div className="flex flex-col items-center space-y-2">
          <h2 className="text-2xl font-semibold">Journal Lines for {journalId}</h2>
          {journalStatus && (
            <span
              className={`text-sm px-2 py-1 rounded-full font-medium ${
                journalStatus === "draft" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
              }`}
            >
              Status: {journalStatus}
            </span>
          )}
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : (
          <>
            {/* toolbar */}
            {journalStatus === "draft" && (
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

            {/* lines table */}
            <div className="overflow-auto border rounded-md shadow-sm">
              <table className="min-w-full table-auto border-collapse text-sm">
                <thead className="bg-gray-200 text-left">
                  <tr>
                    <th className="border px-3 py-2">Line ID</th>
                    <th className="border px-3 py-2">Account</th>
                    <th className="border px-3 py-2">Description</th>
                    <th className="border px-3 py-2">Debit</th>
                    <th className="border px-3 py-2">Credit</th>
                    <th className="border px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, idx) => (
                    <tr key={line.lineID || `new-${idx}`} className="border-t hover:bg-gray-50">
                      <td className="px-3 py-2 border">{line.lineID || "—"}</td>
                      <td className="px-3 py-2 border">
                        <select
                          disabled={journalStatus !== "draft"}
                          className="w-full bg-transparent border rounded px-1"
                          value={line.account}
                          onChange={e => handleLineChange(idx, "account", e.target.value)}
                        >
                          <option value="">Select account</option>
                          {mainAccounts.map(a => (
                            <option key={a.account} value={a.account}>
                              {a.account}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2 border">
                        <select
                          disabled={journalStatus !== "draft"}
                          className="w-full bg-transparent border rounded px-1"
                          value={line.description}
                          onChange={e => handleLineChange(idx, "description", e.target.value)}
                        >
                          <option value="">Select description</option>
                          {mainAccounts.map(a => (
                            <option key={a.description} value={a.description}>
                              {a.description}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2 border text-right">
                        <input
                          type="text"
                          disabled={journalStatus !== "draft"}
                          inputMode="decimal"
                          className="w-full text-right bg-transparent border rounded px-1"
                          value={line.debit.toFixed(2)}
                          onChange={e => {
                            const v = e.target.value;
                            if (/^\d*\.?\d{0,2}$/.test(v)) handleLineChange(idx, "debit", parseFloat(v));
                          }}
                        />
                      </td>
                      <td className="px-3 py-2 border text-right">
                        <input
                          type="text"
                          disabled={journalStatus !== "draft"}
                          inputMode="decimal"
                          className="w-full text-right bg-transparent border rounded px-1"
                          value={line.credit.toFixed(2)}
                          onChange={e => {
                            const v = e.target.value;
                            if (/^\d*\.?\d{0,2}$/.test(v)) handleLineChange(idx, "credit", parseFloat(v));
                          }}
                        />
                      </td>
                      <td className="px-3 py-2 border text-center">
                        {journalStatus === "draft" && (
                          <button
                            onClick={() => handleDelete(idx)}
                            className="text-red-500 hover:underline"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
