import { Moon, Sun } from 'lucide-react'
import { useThemeStore } from '../../store/theme-store'

export function ThemeToggle() {
  const theme = useThemeStore((state) => state.theme)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)

  return (
    <button
      onClick={toggleTheme}
      className="rounded-xl border border-white/10 p-2.5 text-slate-200 transition-all hover:border-cyan-400/30 hover:bg-white/10 hover:text-cyan-200"
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  )
}
