/**
 * RecordControls.tsx
 * Description - Holds the Create/Delete control buttons.
 */
"use client";

import React from "react";
import { RecordControlProps } from "@/lib/api/shared/controls/types";

export default function RecordControls({
  loading,
  onCreate,
  onCreateDisabled,
  onDelete,
  onDeleteDisabled,
  onSave,
  onSaveDisabled,
}: RecordControlProps) {
  return (
    <div className="flex items-center gap-3">
      {/* New */}
      <button
        onClick={onCreate}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={loading || onCreateDisabled}
        title="Create"
      >
        New
      </button>

      {/* Delete */}
      <button
        onClick={onDelete}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={loading || onDeleteDisabled}
        title="Delete"
      >
        Delete
      </button>

      {/* Save */}
      <button
        onClick={onSave}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={loading || onSaveDisabled}
        title="Delete"
      >
        Save
      </button>
    </div>
  );
}
