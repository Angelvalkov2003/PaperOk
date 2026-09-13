"use client";

import {
  useEffect,
  useRef,
  useState,
  type InputHTMLAttributes,
} from "react";

/** Keep only a valid in-progress decimal price (`.` or `,`). */
export function sanitizePriceInput(raw: string): string {
  let s = "";
  let seenSep = false;
  for (const ch of raw) {
    if (ch === "." || ch === ",") {
      if (seenSep) continue;
      seenSep = true;
      s += ch;
      continue;
    }
    if (/\d/.test(ch)) s += ch;
  }
  return s;
}

export function parseAdminPrice(draft: string): number | null {
  const s = draft.trim().replace(/\s/g, "").replace(",", ".");
  if (!s || s === ".") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** Digits only while typing (integer qty / position fields). */
export function sanitizeIntegerInput(raw: string): string {
  return raw.replace(/\D/g, "");
}

export function parseAdminInteger(draft: string): number | null {
  const s = draft.trim();
  if (!s) return null;
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) ? n : null;
}

function toDraft(value: number | null | undefined): string {
  if (value == null || Number.isNaN(Number(value))) return "";
  return String(value);
}

type BaseProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange" | "inputMode"
>;

type NumberPriceProps = BaseProps & {
  mode?: "number";
  value: number | null | undefined;
  onValueChange: (value: number | null) => void;
  /** When true, empty blur commits `null`; otherwise `0`. */
  allowEmpty?: boolean;
};

type StringPriceProps = BaseProps & {
  mode: "string";
  value: string;
  onValueChange: (value: string) => void;
};

export type AdminPriceInputProps = NumberPriceProps | StringPriceProps;

/**
 * Keyboard-friendly price field (no spinner). Accepts `.` and `,`.
 * Number mode keeps a local draft while typing so "5." is not forced to 5.
 */
export function AdminPriceInput(props: AdminPriceInputProps) {
  if (props.mode === "string") {
    const { mode: _mode, value, onValueChange, className, ...rest } = props;
    return (
      <input
        {...rest}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={value}
        onChange={(e) => {
          onValueChange(sanitizePriceInput(e.target.value));
        }}
        className={className}
      />
    );
  }

  const {
    mode: _mode,
    value,
    onValueChange,
    allowEmpty = false,
    className,
    onBlur,
    onFocus,
    ...rest
  } = props;

  const [draft, setDraft] = useState(() => toDraft(value));
  const focusedRef = useRef(false);

  useEffect(() => {
    if (focusedRef.current) return;
    setDraft(toDraft(value));
  }, [value]);

  return (
    <input
      {...rest}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      value={draft}
      onFocus={(e) => {
        focusedRef.current = true;
        onFocus?.(e);
      }}
      onChange={(e) => {
        setDraft(sanitizePriceInput(e.target.value));
      }}
      onBlur={(e) => {
        focusedRef.current = false;
        const parsed = parseAdminPrice(draft);
        const committed = parsed ?? (allowEmpty ? null : 0);
        onValueChange(committed);
        setDraft(toDraft(committed));
        onBlur?.(e);
      }}
      className={className}
    />
  );
}

type AdminIntegerInputProps = BaseProps & {
  value: number | null | undefined;
  onValueChange: (value: number | null) => void;
  /** Empty blur commits `null` when true; otherwise `min` (default 1) or 0. */
  allowEmpty?: boolean;
  min?: number;
};

/**
 * Integer field without spinners. Local draft while focused so clearing/typing
 * does not force a value or steal focus on each keystroke.
 */
export function AdminIntegerInput({
  value,
  onValueChange,
  allowEmpty = false,
  min = 1,
  className,
  onBlur,
  onFocus,
  ...rest
}: AdminIntegerInputProps) {
  const [draft, setDraft] = useState(() => toDraft(value));
  const focusedRef = useRef(false);

  useEffect(() => {
    if (focusedRef.current) return;
    setDraft(toDraft(value));
  }, [value]);

  return (
    <input
      {...rest}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      value={draft}
      onFocus={(e) => {
        focusedRef.current = true;
        onFocus?.(e);
      }}
      onChange={(e) => {
        setDraft(sanitizeIntegerInput(e.target.value));
      }}
      onBlur={(e) => {
        focusedRef.current = false;
        const parsed = parseAdminInteger(draft);
        let committed: number | null;
        if (parsed == null) {
          committed = allowEmpty ? null : min;
        } else {
          committed = Math.max(min, parsed);
        }
        onValueChange(committed);
        setDraft(toDraft(committed));
        onBlur?.(e);
      }}
      className={className}
    />
  );
}
