"use client";

import { useEffect, useRef, useState } from "react";
import { Dimensions, FinancialDimension } from "@/lib/api/general_ledger/types";
import { fetchFinancialDimensions } from "@/lib/api/general_ledger/financialDimensions";
import { fetchDimensionValues } from "@/lib/api/general_ledger/financialDimensionValues";

type FDPickerProps = {
    recordID: number;
    dimensions?: Dimensions; // "FD1".."FD8"
    onClick?: (key: keyof Dimensions, value: string | null | undefined, record: number) => void;
    disabled: boolean;
};

const FD_KEYS = ["fd1", "fd2", "fd3", "fd4", "fd5", "fd6", "fd7", "fd8"] as const;

const pretty = (v?: string | null) => (v && v.trim() !== "" ? v : "—");

export default function FDPicker({
    recordID,
    dimensions,
    onClick,
    disabled,
}: FDPickerProps) {
        
    const record                        = recordID;
    const [openKey, setOpenKey]         = useState<null | (typeof FD_KEYS)[number]>(null);
    const [draft, setDraft]             = useState<string>("");
    const dialogRef                     = useRef<HTMLDialogElement>(null);

    const [dimensionValues, setDimensionValues] = useState<
        { code: string; description: string; dimension: number; record: number }[]
    >([]);

    const [inUse, setInUse]             = useState<FinancialDimension[]>([]);

    // Open/close the dialog when openKey changes.
    useEffect(() => {
        const dlg = dialogRef.current;
        if (!dlg) return;

        if (openKey && !dlg.open) dlg.showModal();
        if (!openKey && dlg.open) dlg.close();
    }, [openKey]);

    // Fetch "in use" list once.
    useEffect(() => {
        (async () => {
        try {
            const data = await fetchFinancialDimensions();
            setInUse(data);
        } catch (err) {
            alert(err);
        }
        })();
    }, []);

    // Fetch dimension values when a specific FD is opened.
    useEffect(() => {
        if (!openKey) return;
        (async () => {
            try {
                const dimNumber = FD_KEYS.indexOf(openKey) + 1; // 1..8
                const values = await fetchDimensionValues(dimNumber);
                setDimensionValues(values);
            } catch (err) {
                alert(err);
            }
        })();
    }, [openKey]);

    // handle opening of modal.
    const handleOpen = (key: (typeof FD_KEYS)[number]) => {
        setDraft(dimensions?.[key] ?? ""); // seed with current value
        setOpenKey(key);
    };

    // handle closing of modal.
    const handleClose = () => setOpenKey(null);

    // handle modal ok button.
    const handleOk = () => {
        if (!openKey) return;
        onClick?.(openKey, draft || null, record);
        setOpenKey(null);
    };

    // handle selection in modal.
    const choose = (code: string) => {
        if (!openKey) return;
        setDraft(code);
        onClick?.(openKey, code, record);
        setOpenKey(null);
    };

    // Build the list of enabled keys once per render
    const enabledKeys = FD_KEYS.filter((_, i) => !!inUse[i]?.in_use && !disabled);

    return (
        <>
            <div className="flex items-center flex-wrap">
                {enabledKeys.map((key, j) => {

                    const btnClass =
                        "h-9 rounded-md px-2 text-sm transition border " +
                        "bg-white dark:bg-gray-900/40 border-gray-300 dark:border-gray-700 " +
                        "hover:border-blue-400 focus:border-blue-500 focus:outline-none cursor-text";

                    return (
                        <span key={key} className="inline-flex items-center">
                            <button
                                type="button"
                                className={btnClass}
                                onClick={() => handleOpen(key)}
                                title="Select value"
                            >
                                {pretty(dimensions?.[key])}
                            </button>
                            {j < enabledKeys.length - 1 && (
                                <span className="mx-1 text-gray-400">-</span>
                            )}
                        </span>
                    );
                })}
            </div>
            {/* Modal */}
            <dialog
                ref={dialogRef}
                className="fixed inset-0 m-auto p-0 w-[26rem] max-w-[95vw] rounded-xl backdrop:bg-black/30"
                onCancel={(e) => {
                e.preventDefault();
                handleClose();
                }}
            >
            {openKey && (
                <div className="bg-white rounded-xl overflow-hidden shadow-xl">
                    <div className="p-4 border-b flex items-center justify-between">
                        <h3 className="text-lg font-semibold">
                            {inUse[FD_KEYS.indexOf(openKey)]?.name}
                        </h3>
                        <button
                            className="rounded-md px-2 py-1 border hover:bg-gray-50"
                            onClick={handleClose}
                        >
                            Close
                        </button>
                    </div>

                    <div className="p-4 space-y-3">
                        <label className="block text-sm text-gray-600 mb-1">
                            Values for {openKey.toUpperCase()}
                        </label>
                        <ul className="border rounded divide-y">
                            {dimensionValues.map((d) => (
                            <li key={d.record} className="px-3 py-2">
                                <button
                                type="button"
                                className="w-full text-left hover:bg-gray-50 rounded px-2 py-1"
                                onClick={() => choose(d.code)}
                                title="Use this value"
                                >
                                <span className="font-mono">{d.code}</span> – {d.description}
                                </button>
                            </li>
                            ))}
                        </ul>
                    </div>
                    <div className="p-4 space-y-3">
                        <label className="block text-sm text-gray-600 mb-1">
                            Value for {openKey.toUpperCase()}
                        </label>
                    <input
                        type="text"
                        className="w-full border rounded px-3 py-2"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="Enter code (e.g., 01)"
                        autoFocus
                        onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            handleOk();
                        } else if (e.key === "Escape") {
                            e.preventDefault();
                            handleClose();
                        }
                        }}
                    />
                    </div>
                    <div className="p-3 border-t flex justify-end gap-2">
                        <button
                            className="rounded-md px-3 py-2 border hover:bg-gray-50"
                            onClick={handleClose}
                        >
                            Cancel
                        </button>
                        <button
                            className="rounded-md px-3 py-2 border bg-indigo-600 text-white hover:bg-indigo-700"
                            onClick={handleOk}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
            </dialog>
        </>
    );
}
