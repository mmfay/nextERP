"use client";

import { useEffect, useRef, useState } from "react";
import { fetchMainAccounts } from "@/lib/api/general_ledger/mainAccounts";

type AccountPickerProps = {
  label?: string;
  onSelect: (acc: Account) => void;
  disabled?: boolean;
};

export default function AccountPicker({
    label,
    onSelect,
    disabled,
} : AccountPickerProps) {
    
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<any[]>([]);

    // button triggers openModal.
    const openModal = () => { if (!disabled) setOpen(true); };

    const closeModal = () => setOpen(false);

    // when modal opens, then load the accounts, 
    useEffect(() => {

        if (!open) return;
        
        // items have already been loaded. 
        if (items.length !== 0) return;

        (async () => {
            setLoading(true);
            try {
                const accounts = await fetchMainAccounts();           // adjust if your API needs args
                setItems(accounts)
                
            } finally {
                setLoading(false);
            }
        })();

    }, [open]);

    return (
        <>
            <button className="w-40 h-5" onClick={openModal}>
            {label}
            </button>
            {open && (
                <div className="fixed inset-0 z-50">
                <div className="absolute inset-0 bg-black/50" onClick={closeModal} />
                <div className="absolute inset-0 flex items-center justify-center p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white dark:bg-neutral-900 p-4 shadow-xl">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Select Account</h3>
                        <button className="px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/10" onClick={closeModal}>✕</button>
                    </div>

                    <div className="mt-3 max-h-80 overflow-auto rounded border">
                        {loading && <div className="p-3 text-sm opacity-70">Loading…</div>}
                        {!loading && items.length === 0 && (
                        <div className="p-3 text-sm opacity-70">No accounts</div>
                        )}
                        <ul>
                        {items.map((a) => (
                            <li key={a.account}>
                            <button
                                className="w-full text-left px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10"
                                onClick={() => { onSelect(a); closeModal(); }}
                            >
                                <div className="flex items-center justify-between">
                                <span className="font-mono">{a.account}</span>
                                <span className="opacity-80 ml-3 truncate">{a.description}</span>
                                </div>
                            </button>
                            </li>
                        ))}
                        </ul>
                    </div>

                    <div className="mt-3 flex justify-end">
                        <button className="px-3 py-2 rounded-lg border" onClick={closeModal}>Close</button>
                    </div>
                    </div>
                </div>
                </div>
            )}
        </>
    );
}

