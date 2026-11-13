// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { tabFromSearch, useRecruitForm, useSort, useToasts } from '../src';

describe('useSort', () => {
  const rows = [{ n: 'b', v: 2 }, { n: 'a', v: 3 }, { n: 'c', v: 1 }];
  const value = (r: (typeof rows)[number], key: string) => (key === 'v' ? r.v : r.n);

  it('sorts ascending, then flips on the same column', () => {
    const { result } = renderHook(() => useSort(rows, value));
    expect(result.current.rows).toBe(rows);
    act(() => result.current.onSortChange('v'));
    expect(result.current.rows.map((r) => r.v)).toEqual([1, 2, 3]);
    act(() => result.current.onSortChange('v'));
    expect(result.current.rows.map((r) => r.v)).toEqual([3, 2, 1]);
    act(() => result.current.onSortChange('n'));
    expect(result.current.rows.map((r) => r.n)).toEqual(['a', 'b', 'c']);
  });
});

describe('useToasts', () => {
  it('adds toasts and removes them after the timeout', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useToasts(1000));
    act(() => {
      result.current.push('success', 'Lieutenant recruited');
    });
    expect(result.current.toasts).toHaveLength(1);
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.toasts).toHaveLength(0);
    vi.useRealTimers();
  });
});

describe('useRecruitForm', () => {
  it('hides errors until blur or submit, and resets after a valid submit', () => {
    const onValid = vi.fn();
    const { result } = renderHook(() => useRecruitForm(onValid));
    expect(result.current.errors).toEqual({});

    act(() => result.current.blurField('codename'));
    expect(result.current.errors.codename).toBeDefined();
    expect(result.current.errors.alibi).toBeUndefined();

    act(() => {
      result.current.submit();
    });
    expect(result.current.errors.alibi).toBeDefined();
    expect(onValid).not.toHaveBeenCalled();

    act(() => {
      result.current.setField('codename', 'Waffles Wallace');
      result.current.setField('territoryId', 't-waffle');
      result.current.setField('productLineId', 'p-croissant');
      result.current.setField('alibi', 'I was at the knitting circle all night.');
    });
    act(() => {
      result.current.submit();
    });
    expect(onValid).toHaveBeenCalledTimes(1);
    expect(result.current.values.codename).toBe('');
    expect(result.current.errors).toEqual({});
  });
});

describe('tabFromSearch', () => {
  it('reads a valid tab and falls back to operations', () => {
    expect(tabFromSearch('?tab=rivals')).toBe('rivals');
    expect(tabFromSearch('?tab=nope')).toBe('operations');
    expect(tabFromSearch('')).toBe('operations');
  });
});
