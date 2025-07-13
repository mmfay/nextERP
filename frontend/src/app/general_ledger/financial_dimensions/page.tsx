"use client";

import { useEffect, useState } from "react";
import {
  fetchFinancialDimensions,
  updateFinancialDimension,
  FinancialDimension,
} from "@/lib/api/financialDimensions";
import {
  fetchDimensionValues,
  addDimensionValue,
  deleteDimensionValue,
} from "@/lib/api/financialDimensionValues";
import { SecureButton } from "@/app/components/SecureButton";
import { Permissions } from "@/app/config/permissions";

export default function FinancialDimensionsPage() {
  const [dimensions, setDimensions] = useState<FinancialDimension[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModalIndex, setActiveModalIndex] = useState<number | null>(null);
  const [dimensionValues, setDimensionValues] = useState<Record<number, { code: string; description: string }[]>>({});
  const [newCode, setNewCode] = useState("");
  const [newDescription, setNewDescription] = useState("");

  useEffect(() => {
    fetchFinancialDimensions()
      .then(setDimensions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const loadValues = async (dimensionId: number) => {
    try {
      const values = await fetchDimensionValues(dimensionId);
      setDimensionValues((prev) => ({ ...prev, [dimensionId]: values }));
    } catch (err) {
      console.error("Failed to fetch dimension values:", err);
    }
  };

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

  const openModal = (index: number) => {
    const dimension = dimensions[index];
    setActiveModalIndex(index);
    loadValues(dimension.id);
  };

  const addValue = async () => {
    if (!newCode || !newDescription || activeModalIndex === null) return;
    const dimensionId = dimensions[activeModalIndex].id;
    try {
      await addDimensionValue(dimensionId, { code: newCode, description: newDescription });
      await loadValues(dimensionId);
      setNewCode("");
      setNewDescription("");
    } catch (err) {
      console.error("Failed to add value:", err);
    }
  };

  const deleteValue = async (code: string) => {
    if (activeModalIndex === null) return;
    const dimensionId = dimensions[activeModalIndex].id;
    try {
      await deleteDimensionValue(dimensionId, code);
      await loadValues(dimensionId);
    } catch (err) {
      console.error("Failed to delete value:", err);
    }
  };

  return (
    <div className="min-h-screen bg-inherit text-inherit font-[family-name:var(--font-geist-sans)] flex flex-col items-center">
      <main className="pt-24 px-4 sm:px-16 w-full max-w-4xl space-y-10">
        <section className="text-center">
          <h1 className="text-4xl font-bold mb-2">Configure Financial Dimensions</h1>
          <p className="text-gray-600 dark:text-gray-400">
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
                {dim.in_use && (
                  <button
                    onClick={() => openModal(index)}
                    className="mt-3 text-blue-600 text-sm hover:underline"
                  >
                    Manage Values
                  </button>
                )}
              </div>
            ))}
          </section>
        )}
      </main>

      {activeModalIndex !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Values for [FD_{dimensions[activeModalIndex].id}] {dimensions[activeModalIndex].name}
              </h3>
              <button
                onClick={() => setActiveModalIndex(null)}
                className="text-gray-500 hover:text-gray-800 dark:hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="Code (e.g. 01)"
                  className="w-1/3 px-2 py-1 border rounded-md bg-white dark:bg-gray-700 dark:text-white"
                />
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Description (e.g. Northwest)"
                  className="w-2/3 px-2 py-1 border rounded-md bg-white dark:bg-gray-700 dark:text-white"
                />
                <button
                  onClick={addValue}
                  className="px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {activeModalIndex !== null &&
                  dimensions[activeModalIndex] &&
                  Array.isArray(dimensionValues[dimensions[activeModalIndex].id]) &&
                  dimensionValues[dimensions[activeModalIndex].id].map((val, i) => (
                  <li key={i} className="flex justify-between items-center py-1">
                    <span className="text-sm text-gray-900 dark:text-white">{val.code} - {val.description}</span>
                    <button
                      onClick={() => deleteValue(val.code)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setActiveModalIndex(null)}
                className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
