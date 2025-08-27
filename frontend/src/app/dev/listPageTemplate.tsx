"use client";

import { useState } from "react";
import PaginationControls from "@/app/components/Buttons/PaginationControls";
import RecordControls from "@/app/components/Buttons/RecordControls";

export default function listPageTemplate() {

    const [loading, setLoading]         = useState(false); 
    const [currentIdx, setCurrentIdx]   = useState(0);                  // start index at 0

    const hasPrev = currentIdx > 0;                                     // if moved forward, has prev is greater than 0.
    const hasNext = true;                                               // true if next page, false if not.
    const nextCursor = 1234;

    // when page is accessed, loadfirst page is fired off, gets first 'x' amount of records from database. 
    const loadFirstPage = () => {

        setLoading(true);

        setTimeout(() => {
            setCurrentIdx(0);
            setLoading(false);
        }, 500);

    };

    // used to navigate previous page.
    const loadPrev = () => {

        if (!hasPrev) return;

        setLoading(true);

        setTimeout(() => {
            setCurrentIdx((prev) => prev - 1);
            setLoading(false);
        }, 500);

    };

    // used to navigate next page.
    const loadNext = () => {

        if (!hasNext) return;

        setLoading(true);

        setTimeout(() => {
            setCurrentIdx((prev) => prev + 1);
            setLoading(false);
        }, 500);

    };

        // used to navigate next page.
    const newRecord = () => {

        alert('record created');

    };

        // used to navigate next page.
    const deleteRecord = () => {

        alert('record deleted');

    };

    // used to navigate next page.
    const updateRecord = () => {

        alert('record updated');

    };

    return (
        <div className="min-h-screen bg-inherit text-inherit font-[family-name:var(--font-geist-sans)] flex flex-col items-center">
            <main className="pt-24 px-4 sm:px-16 w-full max-w-6xl space-y-4">
                <div className="sticky top-20 z-20 bg-inherit border-b border-black/10 dark:border-white/10">
                    <div className="py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-2xl font-semibold">Journal: </h2>
                        <RecordControls
                            loading={loading}
                            onCreate={newRecord}
                            onDelete={deleteRecord}
                        />
                        <PaginationControls
                            loading={loading}
                            currentPage={currentIdx}
                            hasPrev={hasPrev}
                            hasNext={hasNext}
                            nextCursor={nextCursor}
                            onRefresh={loadFirstPage}
                            onPrev={loadPrev}
                            onNext={loadNext}
                        />
                    </div>
                </div>
                {/* Table */}
                <div className="overflow-x-auto border border-black/10 dark:border-white/10 rounded-xl">
                    <table className="w-full table-auto">
                        <thead className="sticky top-0 z-10 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white">
                            <tr>
                                <th className="px-4 py-2 border-b w-12">
                                <input
                                    type="checkbox"
                                    className="form-checkbox h-4 w-4 text-blue-600"
                                />
                                </th>
                                <th className="border-b px-4 py-2">Line ID</th>
                                <th className="border-b px-4 py-2">Account</th>
                                <th className="border-b px-4 py-2">Description</th>
                                <th className="border-b px-4 py-2 text-right">Debit</th>
                                <th className="border-b px-4 py-2 text-right">Credit</th>
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
