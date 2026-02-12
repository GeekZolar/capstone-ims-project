import { Moon, Sun } from 'lucide-react'
import { useUiStore } from '../../store/uiStore'

export const ThemeToggle = () => {
  const theme = useUiStore((state) => state.theme)
  const toggleTheme = useUiStore((state) => state.toggleTheme)

  return (
    <button
      onClick={toggleTheme}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] text-[rgb(var(--muted))] hover:bg-[rgb(var(--bg-muted))]"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </button>
  )
}
