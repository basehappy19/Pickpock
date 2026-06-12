"use client";

import React, { createContext, useContext, useState } from "react";
import { translations, Language, TranslationType } from "@/lib/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationType;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ 
  children, 
  initialLanguage = "th" 
}: { 
  children: React.ReactNode;
  initialLanguage?: Language;
}) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    // Set cookie for SSR
    document.cookie = `language=${lang}; path=/; max-age=31536000`;
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
