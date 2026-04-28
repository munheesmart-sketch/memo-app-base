'use client'

import { useCallback, useEffect, useState } from 'react'
import { THEME_STORAGE_KEY, type ThemePreference } from '@/utils/theme'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
    setMounted(true)
  }, [])

  const applyTheme = useCallback((preference: ThemePreference) => {
    const dark = preference === 'dark'
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem(THEME_STORAGE_KEY, preference)
    setIsDark(dark)
  }, [])

  const handleToggle = useCallback(() => {
    applyTheme(isDark ? 'light' : 'dark')
  }, [applyTheme, isDark])

  if (!mounted) {
    return (
      <div
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-950/15 bg-white/80 dark:border-stone-600 dark:bg-stone-800/80"
        aria-hidden
      />
    )
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-950/15 bg-white/80 text-amber-950 shadow-sm transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-stone-600 dark:bg-stone-800/80 dark:text-stone-100 dark:hover:bg-stone-800 dark:focus:ring-offset-stone-900"
      aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
      title={isDark ? '라이트 모드' : '다크 모드'}
    >
      {isDark ? (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  )
}
