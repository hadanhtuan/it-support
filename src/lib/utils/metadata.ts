import { Metadata } from 'next';
import { headers } from 'next/headers';
import { getTranslation } from '@/lib/i18n/translations';
import { Language, DEFAULT_LANGUAGE } from '@/lib/i18n/types';

/**
 * Get the current language from headers, cookies, or default to Vietnamese
 */
export function getServerLanguage(): Language {
  try {
    const headersList = headers();

    // Try to get language from custom header (set by client)
    const langHeader = headersList.get('x-language');
    if (langHeader === 'vn') {
      return langHeader;
    }

    // Try to get from Accept-Language header
    const acceptLanguage = headersList.get('accept-language');
    if (acceptLanguage) {
      // Simple check for Vietnamese preference
      if (acceptLanguage.includes('vi') || acceptLanguage.includes('vn')) {
        return 'vn';
      }
    }

    // Default to Vietnamese
    return DEFAULT_LANGUAGE;
  } catch (error) {
    // If headers are not available (e.g., during build), use default
    return DEFAULT_LANGUAGE;
  }
}

/**
 * Generate localized metadata for pages
 */
export function generateLocalizedMetadata(overrides?: Partial<Metadata>): Metadata {
  const language = getServerLanguage();

  const title = getTranslation(language, 'meta.title');
  const description = getTranslation(language, 'meta.description');

  return {
    title,
    description,
    generator: 'v0.dev',
    icons: {
      icon: '/logo.svg'
    },
    ...overrides
  };
}

/**
 * Generate localized metadata with custom title and description keys
 */
export function generatePageMetadata(
  titleKey: string,
  descriptionKey: string,
  overrides?: Partial<Metadata>
): Metadata {
  const language = getServerLanguage();

  const title = getTranslation(language, titleKey);
  const description = getTranslation(language, descriptionKey);

  return {
    title,
    description,
    generator: 'v0.dev',
    ...overrides
  };
}
