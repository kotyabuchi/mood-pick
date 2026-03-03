import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useDebounce } from '@/hooks/use-debounce';

describe('useDebounce', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('初期値をそのまま返す', () => {
    const { result } = renderHook(() => useDebounce('initial', 300));
    expect(result.current).toBe('initial');
  });

  it('delay経過前は古い値を返す', () => {
    const { result, rerender } = renderHook(
      (props: { value: string }) => useDebounce(props.value, 300),
      { initialProps: { value: 'old' } },
    );
    rerender({ value: 'new' });
    expect(result.current).toBe('old');
  });

  it('delay経過後に新しい値を返す', () => {
    const { result, rerender } = renderHook(
      (props: { value: string }) => useDebounce(props.value, 300),
      { initialProps: { value: 'old' } },
    );
    rerender({ value: 'new' });
    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe('new');
  });
});
