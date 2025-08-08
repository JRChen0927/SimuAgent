import { useState, createContext, useContext } from 'react'

export type Language = 'en' | 'zh'

export interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

// 翻译数据类型
export interface TranslationData {
  [key: string]: string | TranslationData
}

// 获取嵌套对象的值
function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((current, key) => current?.[key], obj) || path
}

// 替换参数
function replaceParams(text: string, params?: Record<string, string | number>): string {
  if (!params) return text
  
  return Object.entries(params).reduce((acc, [key, value]) => {
    return acc.replace(new RegExp(`{{${key}}}`, 'g'), String(value))
  }, text)
}

export const I18nContext = createContext<I18nContextType | null>(null)

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

// 创建自定义 Hook
export function createI18nHook(translations: Record<Language, TranslationData>) {
  return function useI18nState(): I18nContextType {
    const [language, setLanguageState] = useState<Language>(() => {
      // 从 localStorage 获取保存的语言设置
      const saved = localStorage.getItem('simuagent-language')
      if (saved && (saved === 'en' || saved === 'zh')) {
        return saved
      }
      // 根据浏览器语言自动选择
      const browserLang = navigator.language.toLowerCase()
      return browserLang.startsWith('zh') ? 'zh' : 'en'
    })

    const setLanguage = (lang: Language) => {
      setLanguageState(lang)
      localStorage.setItem('simuagent-language', lang)
    }

    const t = (key: string, params?: Record<string, string | number>): string => {
      const translation = getNestedValue(translations[language], key)
      return replaceParams(translation, params)
    }

    return {
      language,
      setLanguage,
      t
    }
  }
}
