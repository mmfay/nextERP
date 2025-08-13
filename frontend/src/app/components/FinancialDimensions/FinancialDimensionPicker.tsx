"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { fetchDimensionValues } from "@/lib/api/financialDimensionValues";

export type Option = { value: string; label?: string };
export type FDOptionFetcher = (
  keyName: string,
  query: string,
  signal?: AbortSignal
) => Promise<Option[]>;

type Props = {
  open: boolean;
  keyName: string;     // "FD1".."FD8"
  label?: string;      // e.g., "Department"
  initialValue?: string;
  onClose: () => void;
  onPick: (value: string) => void;
  /** Optional override fetcher; when provided we'll call it with empty query to load all. */
  fetcher?: FDOptionFetcher;
};

const apiFetcherAll: FDOptionFetcher = async (keyName, _query, signal) => {
  const dimId = Number(keyName.replace(/^FD/i, ""));
  if (!Number.isFinite(dimId) || dimId < 1 || dimId > 8) return [];
  const list = await fetchDimensionValues(dimId, { signal });
  return (list ?? []).map((d: any) => ({
    value: String(d.code ?? ""),
    label: d.description ? String(d.description) : undefined,
  }));
};

export default function FinancialDimensionPicker({
  open,
  keyName,
  label,
  initialValue,
  onClose,
  onPick,
  fetcher,
}: Props) {
  const title = label ?? keyName;

  const dialogRef = useRef<HTMLDialogElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const [list, setList] = useState<Option[]>([]);
  const [selected, setSelected] = useState<string>(initialValue ?? "");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const effectiveFetcher = useMemo<FDOptionFetcher>(() => fetcher ?? apiFetcherAll, [fetcher]);

  // Open/close dialog and seed selection
  useEffect(() => {
    if (!dialogRef.current) return;
    if (open) {
      if (!dialogRef.current.open) dialogRef.current.showModal();
      setSelected(initialValue ?? "");
      setTimeout(() => listRef.current?.focus(), 0);
    } else if (dialogRef.current.open) {
      dialogRef.current.close();
    }
  }, [open, initialValue]);

  // Load entire list when opened
  useEffect(() => {
    if (!open) return;
    const ac = new AbortController();
    let cancelled = false;

    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const items = await effectiveFetcher(keyName, "", ac.signal); // empty query => full list
        if (cancelled) return;
        setList(items);
      } catch (e: any) {
        if (cancelled) return;
        setErr(e?.message || "Failed to load values.");
        setList([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [open, keyName, effectiveFetcher]);

  // Keyboard navigation
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
          <h3 className="text-lg font-semibold">Select {title}</h3>
          <button className="rounded-md px-2 py-1 border hover:bg-gray-50" onClick={onClose}>
            Esc
          </button>
        </div>

        <div className="p-2">
          <div className="max-h-80 overflow-auto border rounded">
            {loading ? (
              <div className="p-4 text-sm text-gray-500">Loading…</div>
            ) : err ? (
              <div className="p-4 text-sm text-red-600 flex items-center justify-between">
                <span>{err}</span>
                <button
                  className="ml-3 rounded border px-2 py-1 text-xs hover:bg-gray-50"
                  onClick={async () => {
                    try {
                      setLoading(true);
                      const items = await effectiveFetcher(keyName, "", undefined);
                      setList(items);
                      setErr(null);
                    } catch (e: any) {
                      setErr(e?.message || "Failed to load values.");
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
              <div className="p-4 text-sm text-gray-500">No values available</div>
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
                        <span
                          className={`inline-block h-2.5 w-2.5 rounded-full ${
                            active ? "bg-indigo-600" : "bg-gray-300"
                          }`}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">{opt.value}</span>
                          {opt.label && (
                            <span className="text-xs text-gray-600">{opt.label}</span>
                          )}
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
            disabled={loading || !!err}
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
