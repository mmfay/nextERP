"use client";

import { useEffect, useRef, useState } from "react";
import { fetchMainAccounts } from "@/lib/api/general_ledger/mainAccounts";

type Option = { value: string; label?: string };

export default function MainAccountPicker({
  open,
  initialValue,
  onClose,
  onPick,
  options,
}: {
  open: boolean;
  initialValue?: string;
  onClose: () => void;
  onPick: (account: string) => void;
  options?: Option[]; // optional override list
}) {
  const preferPropOptions = !!(options && options.length);

  const [list, setList] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [selected, setSelected] = useState<string>(initialValue ?? "");

  const dialogRef = useRef<HTMLDialogElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Open/close dialog and seed selected value
  useEffect(() => {
    if (!dialogRef.current) return;
    if (open) {
      if (!dialogRef.current.open) dialogRef.current.showModal();
      setSelected(initialValue ?? "");
      // slight delay so dialog renders before focusing list
      setTimeout(() => listRef.current?.focus(), 0);
    } else if (dialogRef.current.open) {
      dialogRef.current.close();
    }
  }, [open, initialValue]);

  // Load accounts when opened (only if consumer didn't pass options)
  useEffect(() => {
    if (!open) return;
    if (preferPropOptions) {
      setList(options!);
      setErr(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setErr(null);
      try {
        const accounts = await fetchMainAccounts();
        if (cancelled) return;
        const opts = accounts.map((a) => ({ value: a.account, label: a.description }));
        setList(opts);
      } catch (e: any) {
        if (cancelled) return;
        setErr(e?.message || "Failed to load main accounts.");
        setList([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [open, preferPropOptions, options]);

  // Keyboard navigation within the list (Up/Down/Enter/Escape)
  const move = (dir: 1 | -1) => {
    if (!list.length) return;
    const idx = Math.max(0, list.findIndex((o) => o.value === selected));
    const next = (idx + dir + list.length) % list.length;
    setSelected(list[next].value);
  };

  const handleEnter = () => {
    if (!selected && list.length) setSelected(list[0].value);
    const pick = selected || list[0]?.value;
    if (pick) onPick(pick);
  };

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 m-auto p-0 w-[32rem] max-w-[95vw] rounded-xl backdrop:bg-black/30"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div className="bg-white rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Select Main Account</h3>
          <button className="rounded-md px-2 py-1 border hover:bg-gray-50" onClick={onClose}>
            Esc
          </button>
        </div>

        <div className="p-2">
          <div className="max-h-80 overflow-auto border rounded">
            {loading ? (
              <div className="p-4 text-sm text-gray-500">Loading accounts…</div>
            ) : err ? (
              <div className="p-4 text-sm text-red-600 flex items-center justify-between">
                <span>{err}</span>
                <button
                  className="ml-3 rounded border px-2 py-1 text-xs hover:bg-gray-50"
                  onClick={async () => {
                    try {
                      setLoading(true);
                      const accounts = await fetchMainAccounts();
                      const opts = accounts.map((a) => ({ value: a.account, label: a.description }));
                      setList(opts);
                      setErr(null);
                    } catch (e: any) {
                      setErr(e?.message || "Failed to load main accounts.");
                      setList([]);
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  Retry
                </button>
              </div>
            ) : list.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">No accounts available</div>
            ) : (
              <ul
                ref={listRef}
                role="listbox"
                tabIndex={0}
                className="outline-none"
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
                  else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
                  else if (e.key === "Enter") { e.preventDefault(); handleEnter(); }
                  else if (e.key === "Escape") { e.preventDefault(); onClose(); }
                }}
              >
                {list.map((opt) => {
                  const active = opt.value === selected;
                  return (
                    <li key={opt.value} className="border-b last:border-b-0">
                      <button
                        role="option"
                        aria-selected={active}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 ${
                          active ? "bg-indigo-50" : ""
                        }`}
                        onClick={() => onPick(opt.value)} // immediate select on click
                      >
                        {/* Selection dot */}
                        <span
                          className={`inline-block h-2.5 w-2.5 rounded-full ${
                            active ? "bg-indigo-600" : "bg-gray-300"
                          }`}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">{opt.value}</span>
                          {opt.label && <span className="text-xs text-gray-600">{opt.label}</span>}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="p-3 border-t flex justify-end gap-2">
          <button
            className="rounded-md px-3 py-2 border hover:bg-gray-50"
            onClick={handleEnter}
            disabled={loading || (!!err && !preferPropOptions)}
          >
            Select
          </button>
          <button className="rounded-md px-3 py-2 border hover:bg-gray-50" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </dialog>
  );
}
