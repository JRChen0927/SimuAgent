import { SunIcon, MoonIcon } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { useI18n } from '@/locales'

export default function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme()
  const { t } = useI18n()

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      title={t('theme.toggle')}
    >
      {theme === 'light' ? (
        <>
          <SunIcon className="h-4 w-4" />
          <span className="hidden sm:block">{t('theme.light')}</span>
        </>
      ) : (
        <>
          <MoonIcon className="h-4 w-4" />
          <span className="hidden sm:block">{t('theme.dark')}</span>
        </>
      )}
    </button>
  )
}

// 高级主题切换器（包含系统主题选项）
export function AdvancedThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const { t } = useI18n()

  const themes = [
    { value: 'light' as const, label: t('theme.light'), icon: SunIcon },
    { value: 'dark' as const, label: t('theme.dark'), icon: MoonIcon }
  ]

  return (
    <div className="relative group">
      <button
        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        title={t('theme.toggle')}
      >
        {theme === 'light' ? (
          <SunIcon className="h-4 w-4" />
        ) : (
          <MoonIcon className="h-4 w-4" />
        )}
        <span className="hidden sm:block">
          {theme === 'light' ? t('theme.light') : t('theme.dark')}
        </span>
      </button>
      
      {/* 下拉菜单 */}
      <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="py-1">
          {themes.map((themeOption) => {
            const Icon = themeOption.icon
            return (
              <button
                key={themeOption.value}
                onClick={() => setTheme(themeOption.value)}
                className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center space-x-3 ${
                  theme === themeOption.value
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{themeOption.label}</span>
                {theme === themeOption.value && (
                  <span className="ml-auto text-primary-600 dark:text-primary-400">✓</span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
