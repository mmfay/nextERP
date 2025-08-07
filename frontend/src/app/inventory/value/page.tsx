"use client";

import { useEffect, useState } from "react";
import { fetchInventoryValue } from "@/lib/api/inventory/inventoryValue";

export type InventoryValue = {
  item: string;
  warehouse: string;
  location: string;
  valuePhysical: number;
  valueFinancial: number;
  qtyPhysical: number;
};

export default function InventoryValuePage() {
  const [data, setData] = useState<InventoryValue[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    item: "",
    warehouse: "",
    location: "",
    qtyPhysical: "",
    valuePhysical: "",
    valueFinancial: "",
  });

  useEffect(() => {
    fetchInventoryValue()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const matchString = (field: string, filter: string): boolean => {
    if (!filter) return true;

    const value = field.toLowerCase();
    const term = filter.toLowerCase().trim();

    // Negation support: !value
    if (term.startsWith("!")) {
      return !value.includes(term.slice(1));
    }

    return value.includes(term);
  };

  const matchWithOperator = (fieldValue: number, filter: string): boolean => {
    if (!filter) return true;

    const trimmed = filter.trim();
    const opMatch = trimmed.match(/^([<>]=?|=)?\s*(\d+(\.\d+)?)$/);

    if (opMatch) {
      const op = opMatch[1] || "=";
      const num = parseFloat(opMatch[2]);
      switch (op) {
        case ">":
          return fieldValue > num;
        case ">=":
          return fieldValue >= num;
        case "<":
          return fieldValue < num;
        case "<=":
          return fieldValue <= num;
        case "=":
        default:
          return fieldValue === num;
      }
    }

    return true;
  };

  const filteredData = data.filter((inv) => {
    return (
      matchString(inv.item, filters.item) &&
      matchString(inv.warehouse, filters.warehouse) &&
      matchString(inv.location, filters.location) &&
      matchWithOperator(inv.qtyPhysical, filters.qtyPhysical) &&
      matchWithOperator(inv.valuePhysical, filters.valuePhysical) &&
      matchWithOperator(inv.valueFinancial, filters.valueFinancial)
    );
  });

  return (
    <div className="min-h-screen pt-24 px-4 sm:px-16 bg-inherit text-inherit font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-2xl font-bold mb-6 text-center">Inventory Value</h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 dark:border-gray-700 text-left">
            <thead>
              {/* Header row */}
              <tr className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold">
                <th className="px-4 py-2 border-b">Item</th>
                <th className="px-4 py-2 border-b">Warehouse</th>
                <th className="px-4 py-2 border-b">Location</th>
                <th className="px-4 py-2 border-b text-right">Qty Physical</th>
                <th className="px-4 py-2 border-b text-right">Value Physical</th>
                <th className="px-4 py-2 border-b text-right">Value Financial</th>
              </tr>

              {/* Filter row */}
              <tr className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">
                {/* String filters */}
                {["item", "warehouse", "location"].map((key) => (
                  <th key={key} className="px-4 py-1 border-b">
                    <input
                      type="text"
                      value={filters[key as keyof typeof filters]}
                      onChange={(e) =>
                        handleFilterChange(key as keyof typeof filters, e.target.value)
                      }
                      className="w-full px-2 py-1 border border-gray-400 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </th>
                ))}

                {/* Numeric filters with operator support */}
                {["qtyPhysical", "valuePhysical", "valueFinancial"].map((key) => (
                  <th key={key} className="px-4 py-1 border-b text-right">
                    <input
                      type="text"
                      value={filters[key as keyof typeof filters]}
                      onChange={(e) =>
                        handleFilterChange(key as keyof typeof filters, e.target.value)
                      }
                      placeholder="e.g. >3"
                      className="w-full px-2 py-1 border border-gray-400 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-right"
                    />
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredData.map((inv, idx) => (
                <tr
                  key={idx}
                  className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="px-4 py-2">{inv.item}</td>
                  <td className="px-4 py-2">{inv.warehouse}</td>
                  <td className="px-4 py-2">{inv.location}</td>
                  <td className="px-4 py-2 text-right">{inv.qtyPhysical}</td>
                  <td className="px-4 py-2 text-right">
                    ${Number(inv.valuePhysical).toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-right">
                    ${Number(inv.valueFinancial).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredData.length === 0 && (
            <p className="text-center mt-4 text-gray-500 dark:text-gray-400">
              No matching records found.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
