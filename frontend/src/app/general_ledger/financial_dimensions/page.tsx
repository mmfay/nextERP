"use client";

import { useEffect, useState } from "react";
import {
  fetchFinancialDimensions,
  updateFinancialDimension,
  FinancialDimension,
} from "@/lib/api/financialDimensions";
import { SecureButton } from "@/app/components/SecureButton";
import { Permissions } from "@/app/config/permissions";

export default function FinancialDimensionsPage() {
  const [dimensions, setDimensions] = useState<FinancialDimension[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinancialDimensions()
      .then(setDimensions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (index: number) => {
    const updated = [...dimensions];
    updated[index] = {
      ...updated[index],
      in_use: !updated[index].in_use,
    };
    setDimensions(updated);
    try {
      await updateFinancialDimension(updated[index]);
    } catch (err) {
      console.error("Failed to update dimension:", err);
    }
  };

  const handleNameChange = async (index: number, name: string) => {
    const updated = [...dimensions];
    updated[index] = {
      ...updated[index],
      name,
    };
    setDimensions(updated);
    try {
      await updateFinancialDimension(updated[index]);
    } catch (err) {
      console.error("Failed to update dimension:", err);
    }
  };

  return (
    <div className="min-h-screen bg-inherit text-inherit font-[family-name:var(--font-geist-sans)] flex flex-col items-center">
      <main className="pt-24 px-4 sm:px-16 w-full max-w-4xl space-y-10">
        <section>
          <h1 className="text-4xl font-bold mb-2 text-center">Configure Financial Dimensions</h1>
          <p className="text-center text-gray-600 dark:text-gray-400">
            Activate and name up to 8 financial dimension slots.
          </p>
        </section>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div
              className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-solid"
              role="status"
              aria-label="Loading financial dimensions"
            />
          </div>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dimensions.map((dim, index) => (
              <div
                key={dim.id}
                className="border rounded-md p-4 shadow-sm bg-white dark:bg-gray-800"
              >
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  [FD_{dim.id}] {dim.in_use ? "(In Use)" : "(Not In Use)"}
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={dim.in_use}
                    onChange={() => handleToggle(index)}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Use this dimension</span>
                </div>
                <input
                  type="text"
                  value={dim.name}
                  onChange={(e) => handleNameChange(index, e.target.value)}
                  placeholder="Enter name (e.g. Cost Center)"
                  disabled={!dim.in_use}
                  className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 dark:text-white disabled:opacity-50"
                />
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
