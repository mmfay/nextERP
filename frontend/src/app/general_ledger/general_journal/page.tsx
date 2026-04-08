"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import PaginationControls from "@/app/components/Buttons/PaginationControls";
import RecordControls from "@/app/components/Buttons/RecordControls";
import PostControls from "@/app/components/Buttons/PostControls";
import { updateJournalTrans, deleteJournalLine } from "@/lib/api/general_ledger/journalLines";
import { postGeneralJournal, validateGeneralJournal } from "@/lib/api/general_ledger/generalJournals";
import { fetchGeneralJournalsPage } from "@/lib/api/general_ledger/generalJournals";
import { GeneralJournalTransLines, GeneralJournalTransPayload, GeneralJournalTransDelete, GeneralJournal } from "@/lib/api/general_ledger/types";

export default function GeneralJournalPage() {

    // parameters and journal data
    const [isPosted, setIsPosted]               = useState(false);
    const [version, setVersion]                 = useState(0);
    const [lines, setLines]                     = useState<GeneralJournal[]>([]);
    const [pageData, setPageData]               = useState<GeneralJournal[][]>([]);

    // pagination variables
    const [loading, setLoading]                 = useState(false); 
    const [currentIdx, setCurrentIdx]           = useState(0);                  // start index at 0
    const hasPrev                               = currentIdx > 0;               // if moved forward, has prev is greater than 0.
    const [pageNextCursors, setPageNextCursors] = useState<(string | null)[]>([]);
    const [hasNext, setHasNext]                 = useState(false);
    const [requestCursors, setRequestCursors]   = useState<(string | null)[]>([null]);      // hold cursors so we can navigate.

    // row selection variables
    const [selected, setSelected]               = useState<Set<String>>(new Set()); // tracks which rows are selected.
    const masterRef                             = useRef<HTMLInputElement>(null);
    const visibleIds                            = useMemo(() => lines.map(l => l.journalID), [lines])
    const selectedLines                         = useMemo(() => lines.filter(l => selected.has(l.journalID)),[lines, selected]);
    const allSelected                           = visibleIds.length > 0 && visibleIds.every(id => selected.has(id));
    const someSelected                          = selected.size > 0 && !allSelected;

    // run on page load
    useEffect(() => {
    
        (async () => {
            await loadFirstPage()
        })();

    }, []);

    // run when rows selected
    useEffect(() => {
        if (masterRef.current) masterRef.current.indeterminate = someSelected;
    }, [someSelected]);

    // when header row toggle is clicked, lines will be checked or unchecked.
    const toggleAll = (checked: boolean) => {
        setSelected(new Set(checked ? visibleIds : []));
    };

    // showing 1 row as selected.
    const toggleOne = (id: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };
    
    // when page is accessed, loadfirst page is fired off, gets first 'x' amount of records from database. 
    const loadFirstPage = async () => {

        try {

            // fetch journal lines and its header.
            const page = await fetchGeneralJournalsPage();
            
            // add to cache 
            setPageData([page.items]);


            // set the lines, if there is a next page and cursor for the next page.
            setRequestCursors([null]);
            setLines(page.items);
            setHasNext(page.has_next);
            setPageNextCursors([page.next_cursor ?? null]);   
            setCurrentIdx(0);       

        } catch (err) {
            console.error("Failed to laod first page", err);
        } finally {
            setLoading(false);
        }
        setLoading(true);

        setTimeout(() => {
            setLoading(false);
        }, 500);

    };

    // used to navigate previous page.
    const loadPrev = async () => {

        if (!hasPrev) return;

        // check cache
        const cached = pageData[currentIdx - 1];
        if (cached) {
            setLines(cached);
            setCurrentIdx(i => i - 1);
            setHasNext(!!pageNextCursors[currentIdx - 1]);
            return;
        }

        try {
            const prevCursor = requestCursors[currentIdx - 1]; // cursor that produced the previous page
            const page = await fetchGeneralJournalsPage({ limit: 20, nextCursor: prevCursor });

            setLines(page.items);
            setCurrentIdx(i => i - 1);
            setPageNextCursors([page.next_cursor ?? null]);  // forward cursor from the page we just fetched
            setHasNext(page.has_next);
        } catch (err) {
            console.error("Error retrieving previous page", err);
        } finally {
            setLoading(false);
        }
        setLoading(true);

        setTimeout(() => {
            setLoading(false);
        }, 500);

    };

    // used to navigate next page.
    const loadNext = async () => {

        if (!hasNext) return;
        
        // check cache
        const cached = pageData[currentIdx + 1];
        if (cached) {
            setLines(cached);
            setCurrentIdx(i => i + 1);
            setHasNext(!!pageNextCursors[currentIdx + 1]);
            return;
        }
        // Otherwise fetch using the cursor stored for the current page
        const cursor = pageNextCursors[currentIdx];
        if (!cursor) return; // defensive

        setLoading(true);
        try {
            const page = await fetchGeneralJournalsPage({ limit: 20, nextCursor: cursor });

            setPageData(prev => {
                const copy = prev.slice();
                copy[currentIdx + 1] = page.items;
                return copy;
            });

            setPageNextCursors(prev => {
                const copy = prev.slice();
                copy[currentIdx + 1] = page.next_cursor ?? null; // cursor for (currentIdx+2)
                return copy;
            });

            setLines(page.items);
            setCurrentIdx(i => i + 1);
            setHasNext(!!page.next_cursor);
        } catch (err) {
            console.error("Error retrieving next page", err);
        } finally {
            setLoading(false);
        }
        setLoading(true);

        setTimeout(() => {
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
            const newRow: GeneralJournalTransLines = {
                lineID: tempId,
                journalID: journalID,
                account: "",
                description: "",
                debit: 0,
                credit: 0,
                dimension: -1,
                dimensions: {
                    fd1: null,
                    fd2: null,
                    fd3: null,
                    fd4: null,
                    fd5: null,
                    fd6: null,
                    fd7: null,
                    fd8: null,
                    recordID: -1,
                },
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

        const checked = validateValues(payload);

        if (!checked.ok) {
            alert(checked.errors.join("\n"));
            return;
        }

        try {
            await updateJournalTrans(payload);
            loadFirstPage();
        } catch (err) {
            console.error("Failed to upload", err);
        }


    };

    const validateValues = (payload: GeneralJournalTransPayload) => {
        const errors: string[] = [];

        const check = (rows: typeof payload.inserts) =>

        rows.map((row) => {
            const debitRaw = row.debit;
            const creditRaw = row.credit;
            const descRaw = row.description?.trim() ?? "";

            const debitNum = Number(debitRaw);
            const creditNum = Number(creditRaw);

            // --- Description must not be blank
            if (!descRaw) {
                errors.push(`Line ${row.lineID}: Description is required`);
            }

            // --- Debit checks
            if (debitRaw === "" || isNaN(debitNum)) {
                errors.push(`Line ${row.lineID}: Debit must be a number`);
            } else if (debitNum < 0) {
                errors.push(`Line ${row.lineID}: Debit cannot be negative`);
            }

            // --- Credit checks
            if (creditRaw === "" || isNaN(creditNum)) {
                errors.push(`Line ${row.lineID}: Credit must be a number`);
            } else if (creditNum < 0) {
                errors.push(`Line ${row.lineID}: Credit cannot be negative`);
            }

            return {
                ...row,
                // normalize valid amounts to 2 decimals
                debit: !isNaN(debitNum) && debitNum >= 0 ? Math.round(debitNum * 100) / 100 : row.debit,
                credit: !isNaN(creditNum) && creditNum >= 0 ? Math.round(creditNum * 100) / 100 : row.credit,
                description: descRaw, // trimmed
            };
        });

        const inserts = check(payload.inserts);
        const updates = check(payload.updates);

        return {
            ok: errors.length === 0,
            errors,
            payload: { ...payload, inserts, updates },
        };
    };

    // validates if a journal is ok to post
    const validate = async () => {
        const test = await validateGeneralJournal(journalID);
        alert(JSON.stringify(test.message));
    }

    // validates and posts a journal
    const post = async () => {
        
        // post attempt
        const postAttempt = await postGeneralJournal(journalID, version);

        if (!postAttempt.valid) {
            alert(postAttempt.message);
        }

        if (!postAttempt.record) {
            
            console.warn("Post succeeded but no record returned");
            return;
        }

        // status is likely "draft" | "posted" (string) -> convert to boolean
        setIsPosted(postAttempt.record.status !== "draft");
        setVersion(postAttempt.record.versionID); ay

    }

    return (
        <div className="min-h-screen bg-inherit text-inherit font-[family-name:var(--font-geist-sans)] flex flex-col items-center">
            <main className="pt-24 px-4 md:px-8 w-full max-w-[1600px] 2xl:max-w-[1800px] space-y-4">
<div className="sticky top-20 z-20 bg-inherit border-b border-black/10 dark:border-white/10">

                    <div className="py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-2xl font-semibold">General Journals</h2>
                        <RecordControls
                            loading={loading}
                            onCreate={newRecord}
                            onCreateDisabled={isPosted}
                            onDelete={deleteRecord}
                            onDeleteDisabled={isPosted}
                            onSave={saveRecord}
                            onSaveDisabled={isPosted}
                        />
                        <PostControls
                            loading={loading}
                            onValidate={validate}
                            onValidateDisabled={isPosted}
                            onPost={post}
                            onPostDisabled={isPosted}
                        />
                        <PaginationControls
                            loading={loading}
                            currentPage={currentIdx}
                            hasPrev={hasPrev}
                            hasNext={hasNext}
                            nextCursor={pageNextCursors}
                            onRefresh={loadFirstPage}
                            onPrev={loadPrev}
                            onNext={loadNext}
                        />
                    </div>
                </div>
                {/* Table */}
                <div 
                    className="rounded-xl border border-black/10 dark:border-white/10
                    shadow-md bg-white dark:bg-gray-900/60 overflow-hidden"
                >

                    <div className="max-h-[70vh] overflow-auto">
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
                                    <th className="border-b px-3 py-2 text-left">Journal ID</th>
                                    <th className="border-b px-3 py-2 text-left">Date</th>
                                    <th className="border-b px-3 py-2 text-left">Type</th>
                                    <th className="border-b px-3 py-2 text-left">Description</th>
                                    <th className="border-b px-3 py-2 text-left">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lines.map((line) => (
                                    <tr
                                        key={line.journalID}
                                        onClick={() => toggleOne(line.journalID)}
                                    >
                                        <td className="px-4 py-2 border-b w-12">
                                            <input 
                                                type="checkbox"
                                                className="form-checkbox h-4 w-4 text-blue-600"
                                                checked={selected.has(line.journalID)}
                                                onChange={() => toggleOne(line.journalID)}
                                                disabled={isPosted}
                                            />
                                        </td>
                                        <td className="px-4 py-2 text-left border-b">
                                            <Link
                                                href={`/general_ledger/general_journal/journal_lines?id=${line.journalID}`}
                                                className="text-blue-600 hover:underline"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {line.journalID}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-2 border-b">{line.document_date}</td>
                                        <td className="px-4 py-2 border-b">{line.type}</td>
                                        <td className="px-4 py-2 border-b">{line.description}</td>
                                        <td className="px-3 py-2 border-b">
                                            <span
                                                className={`inline-block px-2 py-1 rounded text-xs ${
                                                    line.status === "posted"
                                                    ? "bg-green-200 text-green-800"
                                                    : "bg-yellow-200 text-yellow-800"
                                                }`}
                                            >
                                                {line.status.toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
