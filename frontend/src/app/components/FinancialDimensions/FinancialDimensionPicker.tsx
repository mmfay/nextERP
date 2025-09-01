"use client";

import { useEffect, useRef, useState } from "react";
import { Dimensions, FinancialDimension } from "@/lib/api/general_ledger/types";
import { fetchFinancialDimensions } from "@/lib/api/general_ledger/financialDimensions";
import { fetchDimensionValues } from "@/lib/api/general_ledger/financialDimensionValues";

type FDPickerProps = {
    recordID: number;
    dimensions?: Dimensions;     // "FD1".."FD8"
    onClick?: (key: keyof Dimensions, value: string | null | undefined, record: number) => void;
    disabled: boolean;
};

const FD_KEYS = ["fd1","fd2","fd3","fd4","fd5","fd6","fd7","fd8"] as const;

const pretty = (v?: string | null) => (v && v.trim() !== "" ? v : "—");

export default function FDPicker({
    recordID,
    dimensions,
    onClick,
    disabled
}: FDPickerProps) {

    const record                    = recordID
    const [openKey, setOpenKey]     = useState<null | (typeof FD_KEYS)[number]>(null);
    const [draft, setDraft]         = useState<string>("");
    const dialogRef                 = useRef<HTMLDialogElement>(null);

    const [optionsByKey, setOptionsByKey] = useState<
        Partial<Record<(typeof FD_KEYS)[number], Array<{value: string; label?: string}>>>
    >({});

    const [dimensionValues, setDimensionValues] = useState<
        { code: string; description: string; dimension: number; record: number }[]
    >([]);

    const [inUse, setInUse]         = useState<FinancialDimension[]>([]);;

    // runs when openKey changes
    useEffect(() => {

        // provides the <dialog> element
        const dlg = dialogRef.current;

        // exit if it doesn't exist
        if (!dlg) return;

        // if there is an openKey and the dialog is not open, then show the modal.
        if (openKey && !dlg.open) dlg.showModal();

        // if there is not an openKey and the dialog is open, then close it. 
        if (!openKey && dlg.open) dlg.close();

    }, [openKey]);

    // loads on modal open.
    useEffect(() => {
        
        (async () => {
            try {
                // get the in use dimensions
                const data = await fetchFinancialDimensions();

                // get the specific dimension values (FD1 {100 - marking, 200 - sales, etc..})
                const dimension = await fetchDimensionValues(FD_KEYS.indexOf(openKey) + 1);
                setDimensionValues(dimension);
                setInUse(data);
            } catch (err) {
                alert(err);
            }
        })();
    

    }, [openKey, optionsByKey]);

    const handleOpen = async (key: (typeof FD_KEYS)[number]) => {
        setDraft(dimensions?.[key] ?? ""); // seed with current value
        setOpenKey(key);
    };

    const handleClose = () => setOpenKey(null);

    const handleOk = () => {
        if (!openKey) return;
        onClick?.(openKey, draft || null, record);
        setOpenKey(null);
    };

    // helper to select the financial dimension clicked in the modal
    const choose = (code: string) => {
        if (!openKey) return;
        setDraft(code);
        onClick?.(openKey, code, record); 
        setOpenKey(null);        
    };

    return (
        <>
        <div>
            {FD_KEYS.map((key, idx) => (
                
                <span key={key} className="inline-flex items-center">
                <button
                    type="button"
                    className={
                    `w-full h-9 rounded-md px-2 text-sm transition 
                    ${!disabled
                        ? "bg-white dark:bg-gray-900/40 border border-gray-300 dark:border-gray-700 hover:border-blue-400 focus:border-blue-500 focus:outline-none"
                        : "bg-transparent border border-transparent opacity-60 pointer-events-none"}`
                } 
                    onClick={() => handleOpen(key)}
                    disabled={!inUse[idx]?.in_use}
                >
                    {pretty(dimensions?.[key])}
                </button>
                {/* add a dash between but not after the last */}
                {idx < FD_KEYS.length - 1 && <span>-</span>}
                </span>
            ))}
            
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
                    <h3 className="text-lg font-semibold">{inUse[FD_KEYS.indexOf(openKey)]?.name}</h3>
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
