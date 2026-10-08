import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useConnectivity } from './useConnectivity'

describe('useConnectivity', () => {
  it('tracks online and offline browser events', () => {
    const { result } = renderHook(() => useConnectivity())

    act(() => window.dispatchEvent(new Event('offline')))
    expect(result.current).toBe(false)

    act(() => window.dispatchEvent(new Event('online')))
    expect(result.current).toBe(true)
  })
})
