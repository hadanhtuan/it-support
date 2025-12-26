'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { useTranslation } from '@/lib/i18n';
import { Language, LANGUAGES } from '@/lib/i18n/types';

interface LanguageSelectorProps {
  variant?: 'default' | 'outline' | 'ghost';
  showLabel?: boolean;
}

export function LanguageSelector({ variant = 'ghost', showLabel = false }: LanguageSelectorProps): React.JSX.Element {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  const handleLanguageChange = (lang: Language): void => {
    setLanguage(lang);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size='sm' className='flex items-center gap-2'>
          <Globe className='h-4 w-4' />
          {showLabel && (
            <>
              <span className='hidden md:inline'>{t('language.selectLanguage')}</span>
              <span className='md:hidden'>{LANGUAGES.find((l) => l.code === language)?.name}</span>
            </>
          )}
          {!showLabel && <span>{LANGUAGES.find((l) => l.code === language)?.name}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='min-w-[160px]'>
        {LANGUAGES.map(({ code, name, flag }) => (
          <DropdownMenuItem
            key={code}
            onClick={() => handleLanguageChange(code)}
            className={`flex items-center gap-2 ${language === code ? 'bg-accent' : ''}`}
          >
            <span>{flag}</span>
            <span className='flex-1'>{name}</span>
            {language === code && <div className='h-2 w-2 rounded-full bg-primary' />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
