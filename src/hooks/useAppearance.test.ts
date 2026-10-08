import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useAppearance } from './useAppearance'

afterEach(() => {
  cleanup()
  window.localStorage.removeItem('ai-chat:theme')
  window.localStorage.removeItem('ai-chat:message-text-size')
  delete document.documentElement.dataset.textSize
  vi.unstubAllGlobals()
})

describe('useAppearance', () => {
  it('applies the selected text size to the application root', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))

    const { result } = renderHook(() => useAppearance())

    act(() => result.current.setTextSize('extra-large'))

    expect(document.documentElement).toHaveAttribute('data-text-size', 'extra-large')
  })
})
