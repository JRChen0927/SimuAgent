import { Languages } from 'lucide-react'
import { useI18n, type Language } from '@/locales'

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useI18n()

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'zh', name: '中文', flag: '🇨🇳' }
  ]

  return (
    <div className="relative group">
      <button
        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        title={t('language.toggle')}
      >
        <Languages className="h-4 w-4" />
        <span className="hidden sm:block">
          {languages.find(lang => lang.code === language)?.flag} 
          {languages.find(lang => lang.code === language)?.name}
        </span>
      </button>
      
      {/* 下拉菜单 */}
      <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="py-1">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center space-x-3 ${
                language === lang.code
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span>{lang.name}</span>
              {language === lang.code && (
                <span className="ml-auto text-primary-600 dark:text-primary-400">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
