import { useState, useEffect, createContext, useContext } from 'react'

export type Theme = 'light' | 'dark'

export interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextType | null>(null)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// 创建主题管理 Hook
export function useThemeState(): ThemeContextType {
  const [theme, setThemeState] = useState<Theme>(() => {
    // 从 localStorage 获取保存的主题设置
    const saved = localStorage.getItem('simuagent-theme')
    if (saved && (saved === 'light' || saved === 'dark')) {
      return saved
    }
    // 根据系统主题自动选择
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return 'light'
  })

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('simuagent-theme', newTheme)
  }

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  // 应用主题到 document
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  // 监听系统主题变化
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      // 只有在用户没有手动设置时才跟随系统
      const saved = localStorage.getItem('simuagent-theme')
      if (!saved) {
        setThemeState(e.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return {
    theme,
    setTheme,
    toggleTheme
  }
}
