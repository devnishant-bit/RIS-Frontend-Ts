import { useTheme } from '../shared/Theme/ThemeProvider'
import type { ThemeMode } from '../shared/Theme/ThemeProvider'

export function ThemeSelector() {
  const { mode, setMode } = useTheme()
  return (
    <label style={{ display: 'grid', gap: 6, color: 'var(--text)' }}>
      <span style={{ fontWeight: 600, color: 'var(--text-strong)' }}>Theme</span>
      <select
        value={mode}
        onChange={(e) => setMode(e.target.value as ThemeMode)}
        style={{
          padding: '8px 10px',
          borderRadius: 8,
          border: '1px solid var(--border)',
          background: 'var(--bg-surface)',
          color: 'var(--text)',
        }}
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
    </label>
  )
}