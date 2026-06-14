import en from './locales/en.json';
import th from './locales/th.json';

export const translations = {
  en,
  th
};

export type Language = 'en' | 'th';
export type TranslationType = typeof en;
