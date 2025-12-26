import { Language } from './types';

// Import translation files
import vnTranslations from './locales/vi.json';

const translations = {
  vn: vnTranslations
};

export function getTranslation(language: Language, key: string, params?: Record<string, string | number>): string {
  const translationData = translations[language] as Record<string, string>;
  let value = translationData[key];

  // If key not found in current language, fallback to Vietnamese
  if (value === undefined && language !== 'vn') {
    value = (translations.vn as Record<string, string>)[key];
  }

  // If key not found in Vietnamese either, return the key itself
  if (value === undefined) {
    console.warn(`Translation key "${key}" not found`);
    return key;
  }

  if (typeof value !== 'string') {
    console.warn(`Translation key "${key}" does not resolve to a string`);
    return key;
  }

  // Replace parameters in the translation
  if (params) {
    return Object.entries(params).reduce(
      (text, [param, replacement]) => text.replace(new RegExp(`{{${param}}}`, 'g'), String(replacement)),
      value
    );
  }

  return value;
}

export function getAllTranslations(): typeof translations {
  return translations;
}

export function getLanguageTranslations(language: Language): (typeof translations)[Language] {
  return translations[language];
}
