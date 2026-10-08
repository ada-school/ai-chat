import { useEffect, useState } from 'react'

export type ColorTheme = 'system' | 'light' | 'dark'
export type MessageTextSize = 'small' | 'default' | 'large' | 'extra-large'

const THEME_KEY = 'ai-chat:theme'
const TEXT_SIZE_KEY = 'ai-chat:message-text-size'

function readStored<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  try {
    const value = window.localStorage.getItem(key)
    return allowed.find((option) => option === value) ?? fallback
  } catch {
    return fallback
  }
}

export function useAppearance() {
  const [theme, setTheme] = useState<ColorTheme>(() =>
    readStored(THEME_KEY, ['system', 'light', 'dark'], 'system'),
  )
  const [textSize, setTextSize] = useState<MessageTextSize>(() =>
    readStored(TEXT_SIZE_KEY, ['small', 'default', 'large', 'extra-large'], 'default'),
  )

  useEffect(() => {
    const root = document.documentElement
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const applyTheme = () => {
      const isDark = theme === 'dark' || (theme === 'system' && media.matches)
      root.classList.toggle('dark', isDark)
      root.style.colorScheme = isDark ? 'dark' : 'light'
    }

    applyTheme()
    media.addEventListener('change', applyTheme)
    return () => media.removeEventListener('change', applyTheme)
  }, [theme])

  useEffect(() => {
    try {
      window.localStorage.setItem(THEME_KEY, theme)
    } catch {
      // Appearance remains active for this session when storage is unavailable.
    }
  }, [theme])

  useEffect(() => {
    try {
      window.localStorage.setItem(TEXT_SIZE_KEY, textSize)
    } catch {
      // Appearance remains active for this session when storage is unavailable.
    }
  }, [textSize])

  return { theme, setTheme, textSize, setTextSize }
}
