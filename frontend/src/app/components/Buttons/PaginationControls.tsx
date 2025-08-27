/**
 * PaginationControls.tsx
 * Description - Holds the Refresh/Prev/Next Control Sections.
 */
"use client";

import React from "react";
import { PaginationControlsProps } from "@/lib/api/shared/pagination/types";

export default function PaginationControls({
    loading,
    currentPage,
    hasPrev,
    hasNext,
    nextCursor,
    onRefresh,
    onPrev,
    onNext,
} : PaginationControlsProps) {
  return (
    <div className="flex items-center">
		{/* Refresh - disabled when loading */}
		<button
			onClick={onRefresh}
			className="px-3 py-2 rounded border hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-50"
			disabled={loading}
			title="Refresh"
		>
			Refresh
		</button>

		{/* Divider - adds clear division of buttons */}
		<div className="mx-2 h-6 w-px bg-black/10 dark:bg-white/10" />

		{/* Prev - disabled when loading or when on the first page */}
		<button
			onClick={onPrev}
			disabled={!hasPrev || loading}
			className="px-3 py-2 rounded border hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-50"
		>
			◀ Prev
		</button>

		{/* Page indicator - shows page number in between prev & next */}
		<span className="text-sm text-gray-600 dark:text-gray-300 px-2">
			Page {currentPage + 1}
		</span>

		{/* Next  - disabled when loading or there is no next or cursor*/}
		<button
			onClick={onNext}
			disabled={loading || !hasNext || !nextCursor}
			className="px-3 py-2 rounded border hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-50"
		>
			Next ▶
		</button>
    </div>
  );
}
