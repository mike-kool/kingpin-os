// State hooks shared by every kit. No UI here.

import { useCallback, useMemo, useRef, useState } from 'react';
import type { Column, SortState, ToastMessage, ToastTone } from './contract';
import {
  EMPTY_RECRUIT_FORM,
  hasErrors,
  validateRecruit,
  type RecruitErrors,
  type RecruitForm,
} from './validation';

/** Sort rows by a column's sort value. Clicking the same column flips direction. */
export function useSort<Row>(
  rows: Row[],
  sortValue: (row: Row, key: string) => string | number,
  initial: SortState | null = null,
) {
  const [sort, setSort] = useState<SortState | null>(initial);

  const onSortChange = useCallback((key: string) => {
    setSort((prev) =>
      prev?.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' },
    );
  }, []);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const dir = sort.direction === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const va = sortValue(a, sort.key);
      const vb = sortValue(b, sort.key);
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
      return String(va).localeCompare(String(vb)) * dir;
    });
  }, [rows, sort, sortValue]);

  return { rows: sorted, sort, onSortChange };
}

/** Helper so column definitions stay typed against their row. */
export function defineColumns<Row>(columns: Column<Row>[]): Column<Row>[] {
  return columns;
}

export const TOAST_DURATION_MS = 4000;

export function useToasts(durationMs = TOAST_DURATION_MS) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (tone: ToastTone, title: string) => {
      counter.current += 1;
      const id = `toast-${counter.current}`;
      setToasts((list) => [...list, { id, tone, title }]);
      if (durationMs > 0) setTimeout(() => dismiss(id), durationMs);
      return id;
    },
    [dismiss, durationMs],
  );

  return { toasts, push, dismiss };
}

/** Form state with validation that shows errors after blur or submit. */
export function useRecruitForm(onValid: (form: RecruitForm) => void) {
  const [values, setValues] = useState<RecruitForm>(EMPTY_RECRUIT_FORM);
  const [touched, setTouched] = useState<Partial<Record<keyof RecruitForm, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);

  const allErrors = useMemo(() => validateRecruit(values), [values]);
  const errors: RecruitErrors = useMemo(() => {
    if (submitted) return allErrors;
    const visible: RecruitErrors = {};
    for (const key of Object.keys(allErrors) as (keyof RecruitForm)[]) {
      if (touched[key]) visible[key] = allErrors[key];
    }
    return visible;
  }, [allErrors, submitted, touched]);

  const setField = useCallback(<K extends keyof RecruitForm>(key: K, value: RecruitForm[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
  }, []);

  const blurField = useCallback((key: keyof RecruitForm) => {
    setTouched((t) => ({ ...t, [key]: true }));
  }, []);

  const submit = useCallback(() => {
    setSubmitted(true);
    if (hasErrors(allErrors)) return false;
    onValid(values);
    setValues(EMPTY_RECRUIT_FORM);
    setTouched({});
    setSubmitted(false);
    return true;
  }, [allErrors, onValid, values]);

  return { values, errors, setField, blurField, submit };
}
