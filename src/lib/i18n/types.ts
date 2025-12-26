export type Language = 'vn';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export const LANGUAGES = [{ code: 'vn' as Language, name: 'Tiếng Việt', flag: '🇻🇳' }] as const;

export const DEFAULT_LANGUAGE: Language = 'vn';
export const LANGUAGE_STORAGE_KEY = 'it-support-language';
