import dayjs, { type Dayjs } from 'dayjs';

// API responses may give back a ref field as either a raw ObjectId string,
// a populated object ({_id, name, ...}), or null/undefined. Form controls
// (Select, etc.) expect a plain string ID, so normalize before binding.

export type Ref = string | { _id?: string; id?: string } | null | undefined;

export const refId = (v: Ref): string | undefined => {
  if (!v) return undefined;
  if (typeof v === 'string') return v;
  return v._id || v.id || undefined;
};

export const refIds = (v: Ref[] | null | undefined): string[] =>
  (v ?? []).map(refId).filter((x): x is string => !!x);

// Convert any date-like value (ISO string, Date, dayjs, null) to a Dayjs
// instance suitable for antd DatePicker `value`. Returns undefined for falsy
// inputs so the picker stays empty rather than showing 1970.
export const toDayjs = (v: unknown): Dayjs | undefined =>
  v ? dayjs(v as any) : undefined;

// Map a possibly-undefined array of records, applying `fn` to each entry.
// Useful for normalising Form.List rows on edit-mode load.
export const mapList = <T, U>(
  list: T[] | null | undefined,
  fn: (row: T) => U,
): U[] => (list ?? []).map(fn);
