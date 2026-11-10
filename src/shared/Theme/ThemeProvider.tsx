// shared/theme/ThemeProvider.tsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'
type ResolvedTheme = 'light' | 'dark'

interface ThemeContextValue {
  mode: ThemeMode
  theme: ResolvedTheme
  setMode: (mode: ThemeMode) => void
  toggleTheme: () => void
}

const STORAGE_KEY = 'app-theme'
const ThemeContext = createContext<ThemeContextValue | null>(null)

const systemTheme = (): ResolvedTheme =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

const readStoredMode = (): ThemeMode => {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v === 'light' || v === 'dark' || v === 'system' ? v : 'light'
  } catch {
    return 'light'
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(readStoredMode)
  const [system, setSystem] = useState<ResolvedTheme>(systemTheme)

  const theme: ResolvedTheme = mode === 'system' ? system : mode

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setSystem(mq.matches ? 'dark' : 'light')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
  }, [theme])

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next)
    try { localStorage.setItem(STORAGE_KEY, next) } catch { /* ignore */ }
  }, [])

  const toggleTheme = useCallback(() => setMode(theme === 'dark' ? 'light' : 'dark'), [theme, setMode])

  const value = useMemo(() => ({ mode, theme, setMode, toggleTheme }), [mode, theme, setMode, toggleTheme])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}