import { useTheme } from './theme.ts'

/** Light/dark switch shown in the app header. */
export function ThemeToggle() {
  const [theme, toggle] = useTheme()
  const next = theme === 'dark' ? 'light' : 'dark'
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}>
      {theme === 'dark' ? '☀ Light' : '☾ Dark'}
    </button>
  )
}
