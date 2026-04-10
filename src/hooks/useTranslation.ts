import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { t as translate } from '@/config/i18n';
import type { Language } from '@/config/i18n';

export function useTranslation() {
  const language = useSelector((state: any) => state.ui?.language ?? 'en') as Language;

  const t = useMemo(
    () => (key: string) => translate(key, language),
    [language],
  );

  return { t, language };
}
