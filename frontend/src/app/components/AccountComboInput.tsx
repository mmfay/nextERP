import React from "react";

type SegmentSchema = {
  key: string;
  label?: string;
  required?: boolean;
  pattern?: RegExp;
  maxLength?: number;
};

type Props = {
  schema: SegmentSchema[];
  value: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
  onSegmentClick?: (key: string, currentValue: string) => void;
  delimiter?: string;
  inUseByKey?: Record<string, boolean>; // e.g. { FD1: true, FD2: false }
};

export default function AccountComboInput({
  schema,
  value,
  onChange,
  onSegmentClick,
  delimiter = "-",
  inUseByKey = {},
}: Props) {
  return (
    <div className="flex items-center gap-1">
      {schema.map((seg, idx) => {
        const segVal = value[seg.key] ?? "";
        const hasValue = segVal.length > 0;
        const inUse = seg.key === "MA" || inUseByKey[seg.key] !== false;

        const widthCh = hasValue ? segVal.length + 0.5 : 1;

        return (
          <React.Fragment key={seg.key}>
            <input
              type="text"
              value={segVal}
              disabled={!inUse}
              onChange={(e) => {
                const v = e.target.value;
                if (seg.maxLength && v.length > seg.maxLength) return;
                if (seg.pattern && v !== "" && !seg.pattern.test(v)) return;
                onChange({ ...value, [seg.key]: v });
              }}
              onClick={() =>
                onSegmentClick && inUse && onSegmentClick(seg.key, segVal)
              }
              className={`font-mono text-sm bg-transparent border-none outline-none ${
                !inUse ? "text-gray-400 cursor-not-allowed" : "cursor-pointer"
              }`}
              style={{
                width: `${widthCh}ch`,
                minWidth:
                  seg.key === "MA"
                    ? "6ch" // ✅ Give more room for account numbers
                    : hasValue
                    ? "2ch"
                    : "1ch",
              }}
            />
            {idx < schema.length - 1 && (
              <span className="text-gray-400">{delimiter}</span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
