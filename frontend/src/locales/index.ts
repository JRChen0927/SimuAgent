import { en } from './en'
import { zh } from './zh'
import { createI18nHook, type Language, type TranslationData } from '@/hooks/useI18n'

// 导出翻译数据
export const translations: Record<Language, TranslationData> = {
  en,
  zh
}

// 创建并导出国际化 Hook
export const useI18n = createI18nHook(translations)

// 导出类型
export type { Language, TranslationData }
