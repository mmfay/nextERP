"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import PaginationControls from "@/app/components/Buttons/PaginationControls";
import RecordControls from "@/app/components/Buttons/RecordControls";
import { fetchJournalLines, updateJournalTrans, deleteJournalLine } from "@/lib/api/general_ledger/journalLines";
import AccountPicker from "@/app/components/FinancialDimensions/AccountPicker";
import { JournalLineTable, GeneralJournalTransPayload, GeneralJournalTransDelete } from "@/lib/api/general_ledger/types";
import { fetchJournalHeader } from "@/lib/api/general_ledger/generalJournals";

export default function JournalLinesPage() {

    // parameters
    const journalID                     = useSearchParams().get("id")!;

    const [loading, setLoading]         = useState(false); 
    const [currentIdx, setCurrentIdx]   = useState(0);                  // start index at 0

    const hasPrev                       = currentIdx > 0;               // if moved forward, has prev is greater than 0.
    const hasNext                       = true;                         // true if next page, false if not.
    const nextCursor                    = "1234";

    const [isPosted, setIsPosted]       = useState(false);
    const [lines, setLines]             = useState<JournalLineTable[]>([]);
    const [selected, setSelected]       = useState<Set<number>>(new Set()); // tracks which rows are selected.
    const masterRef                     = useRef<HTMLInputElement>(null);
    const visibleIds                    = useMemo(() => lines.map(l => l.lineID), [lines])
    const selectedLines                 = useMemo(() => lines.filter(l => selected.has(l.lineID)),[lines, selected]);
    const allSelected                   = visibleIds.length > 0 && visibleIds.every(id => selected.has(id));
    const someSelected                  = selected.size > 0 && !allSelected;

    type EditableKey                    = "account" | "description" | "debit" | "credit";

    // run when journalId changes, which should be everytime the page is loaded
    useEffect(() => {
        try {
            (async () => {
                await loadFirstPage()
            })();
        } catch {

        }
    }, [journalID]);

    useEffect(() => {
        if (masterRef.current) masterRef.current.indeterminate = someSelected;
    }, [someSelected]);

    // when header row toggle is clicked, lines will be checked or unchecked.
    const toggleAll = (checked: boolean) => {
        setSelected(new Set(checked ? visibleIds : []));
    };

    // showing 1 row as selected.
    const toggleOne = (id: number) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };
    
    // when page is accessed, loadfirst page is fired off, gets first 'x' amount of records from database. 
    const loadFirstPage = async () => {

        setLoading(true);

        try {

            const page = await fetchJournalLines(journalID, { limit: 20 });
            const header = await fetchJournalHeader(journalID);
            setLines(page.items);
            alert(JSON.stringify(page.next_cursor));
            setIsPosted(header.status == "draft" ? false : true);

        } catch (err) {
            console.error("Failed to laod first page", err);
        } finally {
            setCurrentIdx(0);
            setLoading(false);
        }

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

    // used to create a new Record in table.
    const newRecord = () => {

        // wont be allowed to add new line, but just a safety.
        if (isPosted) return;

        setLines(prev => {
            const minId = prev.length ? Math.min(...prev.map(l => l.lineID)) : 0;
            const tempId = minId <= 0 ? minId - 1 : -1; // -1, -2, -3...
            const newRow: JournalLineTable = {
                lineID: tempId,
                journalID: journalID,
                account: "",
                description: "",
                debit: 0,
                credit: 0,
                dimension: -1,
                versionID: 1,
                companyID: 1,
                recordID: -1,
                isNew: true,
                isModified: false,
            };
            return [...prev, newRow];
        });

    };

    // used to delete selected records.
    const deleteRecord = async () => {

        if (isPosted) return;

        for (const line of selectedLines) {    

            if (line.lineID < 0) {
                // delete locally
                setLines(prev => prev.filter(l => l.lineID !== line.lineID));
            } else {
                // delete on server
                try {
                    const record: GeneralJournalTransDelete = {
                        versionID: line.versionID,
                        recordID: line.recordID
                    }
                    await deleteJournalLine(record);
                    setLines(prev => prev.filter(l => l.lineID !== line.lineID));
                } catch (err) {
                    alert
                }
            }

        }

    };

    // used to save records
    const saveRecord = async () => {

        if (isPosted) return;

        const inserts = lines.filter(l => !!l.isNew);
        const updates = lines.filter(l => !l.isNew && !!l.isModified);

        const payload: GeneralJournalTransPayload = {
            journalID,
            updates,
            inserts,
        }

        if (inserts.length === 0 && updates.length === 0) return;

        try {
            await updateJournalTrans(payload);
            loadFirstPage();
        } catch (err) {
            console.error("Failed to upload", err);
        }


    };

    // Generic setter the picker (or anything) can call
    const setField = (lineID: number, key: EditableKey, value: string | number | "") => {
        setLines(prev =>
            prev.map(l =>
            l.lineID === lineID ? { ...l, [key]: value, isModified: true } : l
            )
        );
    };

    const updateField = (lineID: number, key: EditableKey) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        const value =
        key === "debit" || key === "credit"
            ? (raw === "" ? "" : Number(raw))
            : raw;
        // zips through lines and if it is a match, if flips the line to modified, if not is just returns the line.
        setLines(prev =>
            prev.map(l =>
                l.lineID === lineID
                    ? { ...l, [key]: value, isModified: true }
                    : l
            )
        );
    }

    return (
        <div className="min-h-screen bg-inherit text-inherit font-[family-name:var(--font-geist-sans)] flex flex-col items-center">
            <main className="pt-24 px-4 sm:px-16 w-full max-w-6xl space-y-4">
                <div className="sticky top-20 z-20 bg-inherit border-b border-black/10 dark:border-white/10">
                    <div className="py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-2xl font-semibold">Journal: {journalID}</h2>
                        <RecordControls
                            loading={loading}
                            onCreate={newRecord}
                            onCreateDisabled={isPosted}
                            onDelete={deleteRecord}
                            onDeleteDisabled={isPosted}
                            onSave={saveRecord}
                            onSaveDisabled={isPosted}
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
                                    ref={masterRef}
                                    checked={allSelected}
                                    onChange={(e) => toggleAll(e.target.checked)}
                                    disabled={isPosted}
                                />
                                </th>
                                <th className="border-b px-2 py-2 text-right">Line</th>
                                <th className="border-b px-4 py-2">Account</th>
                                <th className="border-b px-4 py-2">Description</th>
                                <th className="border-b px-4 py-2 text-right">Debit</th>
                                <th className="border-b px-4 py-2 text-right">Credit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lines.map((line) => (
                                <tr key={line.lineID} className={line.isNew ? "bg-emerald-50 dark:bg-emerald-900/15" : line.isModified ? "bg-amber-50 dark:bg-amber-900/15" : ""}>
                                <td className="px-4 py-2 border-b w-12">
                                    <input 
                                        type="checkbox"
                                        className="form-checkbox h-4 w-4 text-blue-600"
                                        checked={selected.has(line.lineID)}
                                        onChange={() => toggleOne(line.lineID)}
                                        disabled={isPosted}
                                    />
                                </td>
                                <td className="px-2 py-2 border-b text-right">{line.lineID < 0 ? null : line.lineID}</td>
                                <td className="px-4 py-2 border-b">
                                    <AccountPicker
                                        label={line.account}
                                        onSelect={(acc) => setField(line.lineID, "account", acc.account)}
                                        disabled={isPosted}
                                    />
                                </td>
                                <td className="px-4 py-2 border-b">
                                    <input
                                        type="text"
                                        className={`text-left w-full bg-transparent outline-none ${isPosted ? "pointer-events-none" : ""}`}
                                        value={line.description}
                                        onChange={updateField(line.lineID, "description")}
                                        disabled={isPosted}
                                        aria-readonly={isPosted}
                                    />
                                </td>
                                <td className="px-4 py-2 border-b text-right">
                                    <input
                                        type="number"
                                        step="0.01"
                                        className={`text-right w-full bg-transparent outline-none ${isPosted ? "pointer-events-none" : ""}`}
                                        value={line.debit}
                                        onChange={updateField(line.lineID, "debit")}
                                        disabled={isPosted}
                                        aria-readonly={isPosted}
                                    />
                                </td>
                                <td className="px-4 py-2 border-b text-right">
                                    <input
                                        type="number"
                                        step="0.01"
                                        className={`text-right w-full bg-transparent outline-none ${isPosted ? "pointer-events-none" : ""}`}
                                        value={line.credit}
                                        onChange={updateField(line.lineID, "credit")}
                                        disabled={isPosted}
                                        aria-readonly={isPosted}
                                    />
                                </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
