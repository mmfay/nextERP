"use client";

import { useState, useEffect, useRef } from "react";
import { TrialBalanceEntry, getTrialBalance } from "@/lib/api/trialBalance";

export default function TrialBalancePage() {
  const [entries, setEntries] = useState<TrialBalanceEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState<Date>(new Date(new Date().getFullYear(), 0, 1));
  const [toDate, setToDate] = useState<Date>(new Date());
  const modalRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    fetchTrialBalance();
  }, []);

  const fetchTrialBalance = () => {
    getTrialBalance(fromDate, toDate)
      .then(setEntries)
      .catch((err) => {
        console.error("Failed to fetch trial balance", err);
        setError("Failed to load trial balance.");
      });
  };

  const totalDebit = entries.reduce((sum, e) => sum + e.debit, 0);
  const totalCredit = entries.reduce((sum, e) => sum + e.credit, 0);

  return (
    <div className="min-h-screen bg-inherit text-inherit font-[family-name:var(--font-geist-sans)] flex flex-col items-center">
      <main className="pt-24 px-4 sm:px-16 w-full max-w-5xl space-y-10">
        <div className="flex flex-col items-center space-y-4">
          <h2 className="text-2xl font-semibold text-center">Trial Balance</h2>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            onClick={() => modalRef.current?.showModal()}
          >
            Parameters
          </button>
        </div>

        {error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : (
          <div className="overflow-auto border rounded-md">
            <table className="min-w-full table-auto border-collapse text-sm">
              <thead className="bg-gray-200 dark:bg-gray-800">
                <tr>
                  <th className="border px-3 py-2 text-left">Account</th>
                  <th className="border px-3 py-2 text-left">Name</th>
                  <th className="border px-3 py-2 text-right">Debit</th>
                  <th className="border px-3 py-2 text-right">Credit</th>
                  <th className="border px-3 py-2 text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.account} className="border-t hover:bg-gray-50">
                    <td className="border px-3 py-2">{entry.account}</td>
                    <td className="border px-3 py-2">{entry.name}</td>
                    <td className="border px-3 py-2 text-right">{entry.debit.toFixed(2)}</td>
                    <td className="border px-3 py-2 text-right">{entry.credit.toFixed(2)}</td>
                    <td className="border px-3 py-2 text-right">{entry.balance.toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="font-semibold bg-gray-100 dark:bg-gray-700 border-t">
                  <td colSpan={2} className="border px-3 py-2 text-right">Total</td>
                  <td className="border px-3 py-2 text-right">{totalDebit.toFixed(2)}</td>
                  <td className="border px-3 py-2 text-right">{totalCredit.toFixed(2)}</td>
                  <td className="border px-3 py-2 text-right">{(totalDebit - totalCredit).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </main>

      <dialog
        ref={modalRef}
        className="rounded-lg p-6 w-[90%] max-w-md bg-white dark:bg-gray-900 shadow-md"
        style={{ margin: "auto" }}
      >
        <h3 className="text-lg font-semibold mb-4">Trial Balance Parameters</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchTrialBalance();
            modalRef.current?.close();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1">From Date</label>
            <input
              type="date"
              value={fromDate.toISOString().split("T")[0]}
              onChange={(e) => setFromDate(new Date(e.target.value))}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">To Date</label>
            <input
              type="date"
              value={toDate.toISOString().split("T")[0]}
              onChange={(e) => setToDate(new Date(e.target.value))}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={() => modalRef.current?.close()}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm"
            >
              Run
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
