"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchJournalLines, JournalLine } from "@/lib/api/journalLines";
import { fetchJournalHeader } from "@/lib/api/generalJournals";
import { fetchMainAccounts, MainAccount } from "@/lib/api/mainAccounts";

export default function JournalLinesPage() {
  const params = useSearchParams();
  const journalId = params.get("id");

  const [lines, setLines] = useState<JournalLine[]>([]);
  const [mainAccounts, setMainAccounts] = useState<MainAccount[]>([]);
  const [journalStatus, setJournalStatus] = useState<"draft" | "posted" | null>(null);
  const [loading, setLoading] = useState(true);

  const accountToDesc = Object.fromEntries(
    mainAccounts.map(({ account, description }) => [account, description])
  );

  const descToAccount = Object.fromEntries(
    mainAccounts.map(({ account, description }) => [description, account])
  );

  useEffect(() => {
    if (!journalId) return;

    const fetchData = async () => {
      try {
        const [linesData, journalHeader, mainAccountData] = await Promise.all([
          fetchJournalLines(journalId),
          fetchJournalHeader(journalId),
          fetchMainAccounts(),
        ]);

        setLines(linesData);
        setJournalStatus(journalHeader.status);
        setMainAccounts(mainAccountData);
      } catch (err) {
        console.error("Failed to fetch journal data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [journalId]);

  function handleLineChange(index: number, field: keyof JournalLine, value: string) {
    setLines((prevLines) =>
      prevLines.map((line, i) => {
        if (i !== index) return line;

        let updated: JournalLine = { ...line };

        if (field === "account") {
          updated.account = value;
          updated.description = accountToDesc[value] || "";
        } else if (field === "description") {
          updated.description = value;
          updated.account = descToAccount[value] || "";
        } else {
          updated[field] = value;
        }

        return updated;
      })
    );
  }

  function handleAddLine() {
    setLines((prev) => [
      ...prev,
      {
        lineID: null,
        account: "",
        description: "",
        debit: "",
        credit: "",
      },
    ]);
  }

  function handleSave() {
    console.log("Saving lines:", lines);
    // TODO: Save logic to backend
  }

  return (
    <div className="min-h-screen bg-inherit text-inherit font-[family-name:var(--font-geist-sans)] flex flex-col items-center">
      <main className="pt-24 px-4 sm:px-16 w-full max-w-5xl space-y-10">
        <div className="flex flex-col items-center space-y-2">
          <h2 className="text-2xl font-semibold text-center">
            Journal Lines for {journalId}
          </h2>
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
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading...</div>
        ) : lines.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">No lines found.</div>
        ) : (
          <>
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

                      <td className="px-3 py-2 border">
                        {journalStatus === "draft" ? (
                          <select
                            className="w-full bg-transparent border rounded px-1"
                            value={line.account}
                            onChange={(e) => handleLineChange(index, "account", e.target.value)}
                          >
                            <option value="">Select account</option>
                            {mainAccounts.map(({ account }) => (
                              <option key={account} value={account}>
                                {account}
                              </option>
                            ))}
                          </select>
                        ) : (
                          line.account
                        )}
                      </td>

                      <td className="px-3 py-2 border">
                        {journalStatus === "draft" ? (
                          <select
                            className="w-full bg-transparent border rounded px-1"
                            value={line.description ?? ""}
                            onChange={(e) => handleLineChange(index, "description", e.target.value)}
                          >
                            <option value="">Select description</option>
                            {mainAccounts.map(({ description }) => (
                              <option key={description} value={description}>
                                {description}
                              </option>
                            ))}
                          </select>
                        ) : (
                          line.description
                        )}
                      </td>

                      <td className="px-3 py-2 border text-right">
                        {journalStatus === "draft" ? (
                          <input
                            type="text"
                            inputMode="decimal"
                            className="w-full text-right bg-transparent border rounded px-1"
                            value={line.debit === "" ? "" : Number(line.debit).toFixed(2)}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (/^\d*\.?\d{0,2}$/.test(val)) {
                                handleLineChange(index, "debit", val);
                              }
                            }}
                            onBlur={(e) => {
                              const num = parseFloat(e.target.value);
                              if (!isNaN(num)) {
                                handleLineChange(index, "debit", num.toFixed(2));
                              }
                            }}
                          />
                        ) : (
                          Number(line.debit || 0).toFixed(2)
                        )}
                      </td>

                      <td className="px-3 py-2 border text-right">
                        {journalStatus === "draft" ? (
                          <input
                            type="text"
                            inputMode="decimal"
                            className="w-full text-right bg-transparent border rounded px-1"
                            value={line.credit === "" ? "" : Number(line.credit).toFixed(2)}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (/^\d*\.?\d{0,2}$/.test(val)) {
                                handleLineChange(index, "credit", val);
                              }
                            }}
                            onBlur={(e) => {
                              const num = parseFloat(e.target.value);
                              if (!isNaN(num)) {
                                handleLineChange(index, "credit", num.toFixed(2));
                              }
                            }}
                          />
                        ) : (
                          Number(line.credit || 0).toFixed(2)
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {journalStatus === "draft" && (
              <div className="pt-4 flex justify-between">
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  onClick={handleAddLine}
                >
                  + Add Line
                </button>
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  onClick={handleSave}
                >
                  Save Changes
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
