'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { Language, LanguageContextType, DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY } from './types';
import { getTranslation } from './translations';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: React.ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps): React.JSX.Element {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load language from localStorage on mount - remove global loading for fast operations
  useEffect(() => {
    const initializeLanguage = () => {
      try {
        const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
        if (savedLanguage && (savedLanguage === 'vn' || savedLanguage === 'en')) {
          setLanguageState(savedLanguage);
        }
      } catch (error) {
        console.warn('Failed to load language settings, using default:', error);
        setLanguageState(DEFAULT_LANGUAGE);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeLanguage();
  }, []);

  // Save language to localStorage when it changes - simplified without global loading
  const setLanguage = useCallback(async (lang: Language): Promise<void> => {
    try {
      setLanguageState(lang);
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch (error) {
      console.error('Failed to save language setting:', error);
    }
  }, []);

  // Translation function
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => getTranslation(language, key, params),
    [language]
  );

  const contextValue = useMemo(
    () => ({
      language,
      setLanguage,
      t
    }),
    [language, setLanguage, t]
  );

  // Don't render until we've loaded the language from localStorage
  if (!isInitialized) {
    return <></>; // Global loading is handled by the LoadingProvider
  }

  return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Hook for getting just the translation function
export function useTranslation(): { t: (key: string, params?: Record<string, string | number>) => string } {
  const { t } = useLanguage();
  return { t };
}
