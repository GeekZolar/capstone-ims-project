import { useEffect, type ReactNode } from 'react'
import { useUiStore } from '../store/uiStore'

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const theme = useUiStore((state) => state.theme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return <>{children}</>
}
