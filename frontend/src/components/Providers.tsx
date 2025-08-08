import { ReactNode } from 'react'
import { I18nContext } from '@/hooks/useI18n'
import { ThemeContext } from '@/hooks/useTheme'
import { useI18n } from '@/locales'
import { useThemeState } from '@/hooks/useTheme'

interface ProvidersProps {
  children: ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  const i18nValue = useI18n()
  const themeValue = useThemeState()

  return (
    <ThemeContext.Provider value={themeValue}>
      <I18nContext.Provider value={i18nValue}>
        {children}
      </I18nContext.Provider>
    </ThemeContext.Provider>
  )
}
