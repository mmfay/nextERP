"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  fetchJournalLines,
  updateJournalLines,
  deleteJournalLine,
  type JournalLine,
} from "@/lib/api/journalLines";
import {
  fetchJournalHeader,
  postGeneralJournal,
  type GeneralJournal,
} from "@/lib/api/generalJournals";
import { fetchMainAccounts } from "@/lib/api/general_ledger/mainAccounts";
import { fetchFinancialDimensions } from "@/lib/api/financialDimensions";

import AccountComboInput from "@/app/components/AccountComboInput";
import MainAccountPicker from "@/app/components/FinancialDimensions/MainAccountPicker";
import FinancialDimension from "@/app/components/FinancialDimensions/FinancialDimensionPicker";

type UILine = JournalLine & { combo: Record<string, string> };

const FD_KEYS = Array.from({ length: 8 }, (_, i) => `FD${i + 1}` as const);
const emptyCombo = (): Record<string, string> =>
  FD_KEYS.concat("MA" as const).reduce((acc, k) => ({ ...acc, [k]: "" }), {} as Record<string, string>);

const comboToString = (combo: Record<string, string>, keys: string[], delimiter = "-") =>
  keys
    .map((k) => (combo[k] ?? "").trim())
    .filter(Boolean)
    .join(delimiter);

// Build FD-only string (no MA)
const fdStringFromCombo = (combo: Record<string, string>) => comboToString(combo, [...FD_KEYS]);

export default function JournalLinesPage() {
  const journalId = useSearchParams().get("id")!;
  const [journalHeader, setJournalHeader] = useState<GeneralJournal | null>(null);
  const [journalStatus, setJournalStatus] = useState<"draft" | "posted" | null>(null);

  const [lines, setLines] = useState<UILine[]>([]);
  const [accountToDesc, setAccountToDesc] = useState<Record<string, string>>({});
  const [fdInUseMap, setFdInUseMap] = useState<Record<string, boolean>>({});
  const [fdLabels, setFdLabels] = useState<Record<string, string>>({}); // FD1->"Department", etc.

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [posting, setPosting] = useState(false);

  // selection state (checkboxes)
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const selectAllRef = useRef<HTMLInputElement>(null);

  const [maPicker, setMaPicker] = useState<{ open: boolean; idx: number | null }>({ open: false, idx: null });
  const [fdPicker, setFdPicker] = useState<{ open: boolean; idx: number | null; key: string; label?: string; initial?: string }>({
    open: false, idx: null, key: "FD1",
  });

  // Build the visible combo schema from fetched FD labels (fallback to FD#)
  const comboSchema = useMemo(() => {
    const base = [{ key: "MA", label: "Main", required: true, pattern: /^\d{1,10}$/, maxLength: 10 }];
    const fds = FD_KEYS.map((k) => ({ key: k, label: fdLabels[k] || k, maxLength: 20 }));
    return [...base, ...fds];
  }, [fdLabels]);

  // Initial load: header, lines, accounts, FDs
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!journalId) return;
      setLoading(true);
      try {
        const [rawLines, header, accounts, fds] = await Promise.all([
          fetchJournalLines(journalId),
          fetchJournalHeader(journalId),
          fetchMainAccounts(),
          fetchFinancialDimensions(),
        ]);
        if (cancelled) return;

        // accounts
        const acctToDesc = Object.fromEntries(accounts.map((a: any) => [a.account, a.description]));
        setAccountToDesc(acctToDesc);

        // header/status
        setJournalHeader(header);
        setJournalStatus(header.status);

        // financial dimensions -> inUse + labels
        const inUse = Object.fromEntries((fds ?? []).map((fd: any) => [`FD${fd.id}`, !!fd.in_use]));
        const labels = Object.fromEntries((fds ?? []).map((fd: any) => [`FD${fd.id}`, fd.name || `FD${fd.id}`]));
        setFdInUseMap(inUse);
        setFdLabels(labels);

        // lines -> add combo seeded with MA
        setLines(
          rawLines.map((l: any) => ({
            ...l,
            description: acctToDesc[l.account] ?? l.description ?? "",
            combo: { ...emptyCombo(), MA: l.account || "" },
          }))
        );
        setSelected(new Set()); // clear selection on load
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [journalId]);

  // Keep "Select All" checkbox indeterminate state in sync
  useEffect(() => {
    if (!selectAllRef.current) return;
    const total = lines.length;
    const count = selected.size;
    selectAllRef.current.indeterminate = count > 0 && count < total;
  }, [selected, lines.length]);

  // Helpers
  const updateLine = (idx: number, patch: Partial<UILine>) =>
    setLines((ls) => ls.map((l, i) => (i === idx ? { ...l, ...patch } : l)));

  const handleLineChange = (idx: number, field: keyof JournalLine, value: any) =>
    updateLine(idx, { [field]: value } as Partial<UILine>);

  const handleAddLine = () =>
    setLines((ls) => [
      ...ls,
      {
        lineID: "",
        journalID: journalId,
        account: "",
        description: "",
        debit: 0,
        credit: 0,
        combo: emptyCombo(),
      },
    ]);

  const rowKey = (line: UILine, idx: number) => line.lineID || `new-${idx}`;

  const toggleRow = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === lines.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(lines.map((l, i) => rowKey(l, i))));
    }
  };

  const handleDelete = async (idx: number) => {
    const line = lines[idx];
    if (line.lineID) {
      try {
        await deleteJournalLine(journalId, line.lineID);
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
    setLines((ls) => ls.filter((_, i) => i !== idx));
    setSelected((sel) => {
      const next = new Set(sel);
      next.delete(rowKey(line, idx));
      return next;
    });
  };

  const handleDeleteSelected = async () => {
    if (!selected.size) return;
    const toDelete = lines
      .map((l, i) => ({ l, i, key: rowKey(l, i) }))
      .filter(({ key }) => selected.has(key));

    // delete existing lines on the backend
    const existingIds = toDelete.map(({ l }) => l.lineID).filter(Boolean) as string[];
    try {
      await Promise.allSettled(existingIds.map((id) => deleteJournalLine(journalId, id)));
    } catch (e) {
      console.error("Bulk delete error:", e);
    }

    // update UI
    setLines((ls) => ls.filter((_, i) => !toDelete.some((x) => x.i === i)));
    setSelected(new Set());
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Build payload with MA + FD string(s)
      const payload = lines.map(({ combo, ...rest }) => {
        const main = (combo.MA ?? "").trim();
        const financialDimension = fdStringFromCombo(combo); // FD1..FD8 only
        const accountCombo = comboToString(combo, ["MA", ...FD_KEYS]); // MA + FDs

        // Send extra fields for backend combo creation (cast as any)
        const out: any = {
          ...rest,
          account: main,
          description: accountToDesc[main] ?? rest.description ?? "",
          financialDimension,
          accountCombo,
        };
        return out;
      });

      const updated = await updateJournalLines(journalId, payload as unknown as JournalLine[]);

      // keep combos; re-sync descs from accounts
      setLines((ls) =>
        updated.map((u: any, i: number) => ({
          ...u,
          description: accountToDesc[u.account] ?? u.description ?? "",
          combo: { ...ls[i]?.combo, MA: u.account || ls[i]?.combo?.MA || "" },
        }))
      );

      // optional summary
      const summary = payload
        .map(
          (p: any, i: number) =>
            `#${i + 1} MA=${p.account || "(none)"} | FD=${p.financialDimension || "(none)"}`
        )
        .join("\n");

      alert(`Saved successfully!\n\nFinancial Dimensions:\n${summary}`);
    } catch (err) {
      console.error("Save failed:", err);
      alert("Save failed. See console.");
    } finally {
      setSaving(false);
    }
  };

  const handlePost = async () => {
    if (!journalHeader) return;
    setPosting(true);
    try {
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
  };

  // Picker interactions
  const onSegmentClick = (idx: number, key: string, currentValue: string) => {
    if (key === "MA") return setMaPicker({ open: true, idx });
    const seg = comboSchema.find((s) => s.key === key);
    setFdPicker({ open: true, idx, key, label: seg?.label || key, initial: currentValue });
  };

  const handlePickMA = (account: string) => {
    if (maPicker.idx == null) return;
    const desc = accountToDesc[account] ?? "";
    setLines((ls) =>
      ls.map((l, i) =>
        i === maPicker.idx
          ? { ...l, combo: { ...l.combo, MA: account }, account, description: desc }
          : l
      )
    );
    setMaPicker({ open: false, idx: null });
  };

  const handlePickFD = (value: string) => {
    if (fdPicker.idx == null) return;
    const key = fdPicker.key;
    updateLine(fdPicker.idx, { combo: { ...lines[fdPicker.idx].combo, [key]: value } });
    setFdPicker({ open: false, idx: null, key: "FD1" });
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-inherit text-inherit font-[family-name:var(--font-geist-sans)]">
      <main className="pt-24 px-4 sm:px-16 w-full max-w-5xl space-y-6">
        <div className="flex flex-col items-center space-y-2">
          <h2 className="text-2xl font-semibold">Journal Lines for {journalId}</h2>
          {journalStatus && (
            <span
              className={`text-sm px-2 py-1 rounded-full font-medium ${
                journalStatus === "draft"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-green-100 text-green-800"
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
            {journalStatus === "draft" && (
              <div className="flex flex-wrap gap-3">
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
                <button
                  className={`px-4 py-2 rounded transition ${
                    selected.size === 0
                      ? "bg-red-400 cursor-not-allowed text-white"
                      : "bg-red-600 hover:bg-red-700 text-white"
                  }`}
                  onClick={handleDeleteSelected}
                  disabled={selected.size === 0}
                >
                  Delete Selected
                </button>
              </div>
            )}

            {/* Styled table container */}
            <div className="overflow-auto rounded-lg border border-black/20 shadow-sm">
              <table className="min-w-full table-auto text-sm">
                <thead className="bg-gray-200 dark:bg-gray-800 text-left text-gray-900 dark:text-white rounded-t-lg">
                  <tr>
                    <th className="px-3 py-2 border-b first:rounded-tl-lg">
                      <input
                        ref={selectAllRef}
                        type="checkbox"
                        checked={selected.size > 0 && selected.size === lines.length}
                        onChange={toggleAll}
                        className="form-checkbox h-4 w-4 text-blue-600"
                        disabled={lines.length === 0 || journalStatus === "posted"}
                      />
                    </th>
                    <th className="border-b px-3 py-2">Line ID</th>
                    <th className="border-b px-3 py-2">Account + FDs</th>
                    <th className="border-b px-3 py-2">Debit</th>
                    <th className="border-b px-3 py-2">Credit</th>
                    <th className="border-b px-3 py-2 last:rounded-tr-lg"></th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, idx) => {
                    const key = rowKey(line, idx);
                    const isSelected = selected.has(key);
                    return (
                      <tr
                        key={key}
                        onClick={() => journalStatus === "draft" && toggleRow(key)}
                        className={`border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 align-top ${
                          isSelected ? "bg-blue-50 dark:bg-blue-900/40" : ""
                        } ${journalStatus === "draft" ? "cursor-pointer" : ""}`}
                      >
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleRow(key)}
                            onClick={(e) => e.stopPropagation()}
                            className="form-checkbox h-4 w-4 text-blue-600"
                            disabled={journalStatus !== "draft"}
                          />
                        </td>
                        <td className="px-3 py-2 border">{line.lineID || "—"}</td>
                        <td className="px-3 py-2 border">
                          {journalStatus === "posted" ? (
                            <span className="font-mono">
                              {comboToString(line.combo, ["MA", ...FD_KEYS], "-")}
                            </span>
                          ) : (
                            <AccountComboInput
                              schema={comboSchema}
                              value={line.combo}
                              onChange={(next) => {
                                setLines((ls) =>
                                  ls.map((l, i) =>
                                    i === idx
                                      ? {
                                          ...l,
                                          combo: next,
                                          account: next.MA ?? "",
                                          description:
                                            (next.MA && accountToDesc[next.MA]) || l.description,
                                        }
                                      : l
                                  )
                                );
                              }}
                              onSegmentClick={(key, current) => onSegmentClick(idx, key, current)}
                              delimiter="-"
                              inUseByKey={fdInUseMap}
                            />
                          )}
                        </td>
                        <td className="px-3 py-2 border text-right">
                          <input
                            type="text"
                            disabled={journalStatus !== "draft"}
                            inputMode="decimal"
                            className="w-full text-right bg-transparent border rounded px-1"
                            value={(line.debit ?? 0).toFixed(2)}
                            onChange={(e) => {
                              const v = e.target.value;
                              if (/^\d*\.?\d{0,2}$/.test(v))
                                handleLineChange(idx, "debit", v === "" ? 0 : parseFloat(v));
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td className="px-3 py-2 border text-right">
                          <input
                            type="text"
                            disabled={journalStatus !== "draft"}
                            inputMode="decimal"
                            className="w-full text-right bg-transparent border rounded px-1"
                            value={(line.credit ?? 0).toFixed(2)}
                            onChange={(e) => {
                              const v = e.target.value;
                              if (/^\d*\.?\d{0,2}$/.test(v))
                                handleLineChange(idx, "credit", v === "" ? 0 : parseFloat(v));
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td className="px-3 py-2 border text-center">
                          {journalStatus === "draft" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(idx);
                              }}
                              className="text-red-500 hover:underline"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>

      <MainAccountPicker
        open={maPicker.open}
        initialValue={maPicker.idx != null ? lines[maPicker.idx].combo.MA : ""}
        onClose={() => setMaPicker({ open: false, idx: null })}
        onPick={handlePickMA}
      />

      <FinancialDimension
        open={fdPicker.open}
        keyName={fdPicker.key}
        label={fdPicker.label}
        initialValue={fdPicker.initial}
        onClose={() => setFdPicker({ open: false, idx: null, key: "FD1" })}
        onPick={handlePickFD}
      />
    </div>
  );
}
