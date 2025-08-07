"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchInventoryJournalLines } from "@/lib/api/inventory/inventoryJournals";

type InventoryDimensions = {
  warehouse: string;
  location: string;
  config?: string;
  size?: string;
  batch?: string;
  serial?: string;
  record: number;
};

type InventoryJournalLineWithDimension = {
  journalID: string;
  item: string;
  dimension: InventoryDimensions;
  qty: number;
  cost: number;
  record: number;
};

// Dummy dropdown data
const warehouseOptions = ["WH01", "WH02", "WH03"];
const locationOptions = ["LOC01", "LOC02", "LOC03", "LOC04"];

export default function InventoryJournalLinesPage() {
  const { journalID } = useParams();
  const [lines, setLines] = useState<InventoryJournalLineWithDimension[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!journalID) return;
    fetchInventoryJournalLines(journalID as string)
      .then(setLines)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [journalID]);

  return (
    <div className="min-h-screen pt-24 px-4 sm:px-16">
      <h1 className="text-2xl font-bold text-center mb-6">
        Journal Lines for {journalID}
      </h1>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : (
        <div className="overflow-auto border rounded-md shadow-sm">
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="border px-3 py-2">Item</th>
                <th className="border px-3 py-2">Warehouse</th>
                <th className="border px-3 py-2">Location</th>
                <th className="border px-3 py-2 text-right">Qty</th>
                <th className="border px-3 py-2 text-right">Cost</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => (
                <tr key={line.record} className="border-t hover:bg-gray-50">
                  <td className="px-3 py-2 border">{line.item}</td>

                  {/* Warehouse dropdown */}
                  <td className="px-3 py-2 border">
                    <select defaultValue={line.dimension.warehouse} className="w-full border rounded px-2 py-1">
                      {warehouseOptions.map((wh) => (
                        <option key={wh} value={wh}>{wh}</option>
                      ))}
                    </select>
                  </td>

                  {/* Location dropdown */}
                  <td className="px-3 py-2 border">
                    <select defaultValue={line.dimension.location} className="w-full border rounded px-2 py-1">
                      {locationOptions.map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </td>

                  <td className="px-3 py-2 border text-right">{line.qty}</td>
                  <td className="px-3 py-2 border text-right">
                    ${Number(line.cost).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {lines.length === 0 && (
            <p className="text-center mt-4 text-gray-500">No journal lines found.</p>
          )}
        </div>
      )}
    </div>
  );
}
