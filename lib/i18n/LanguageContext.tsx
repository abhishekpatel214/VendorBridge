"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import en from "./dictionaries/en.json";
import hi from "./dictionaries/hi.json";
import gu from "./dictionaries/gu.json";

export type Language = "en" | "hi" | "gu";

type Dictionary = Record<string, any>;

const dictionaries: Record<Language, Dictionary> = {
  en,
  hi,
  gu,
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const savedLang = localStorage.getItem("vendorbridge_lang") as Language;
    if (savedLang && ["en", "hi", "gu"].includes(savedLang)) {
      setLanguage(savedLang);
    } else {
      // Check cookie as fallback
      const match = document.cookie.match(new RegExp('(^| )vendorbridge_lang=([^;]+)'));
      if (match) {
        const cookieLang = match[2] as Language;
        if (["en", "hi", "gu"].includes(cookieLang)) {
          setLanguage(cookieLang);
        }
      }
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("vendorbridge_lang", lang);
    document.cookie = `vendorbridge_lang=${lang}; path=/; max-age=31536000`;
    window.location.reload();
  };

  const t = (key: string): string => {
    const keys = key.split(".");
    let value = dictionaries[language];
    
    for (const k of keys) {
      if (value === undefined || value === null) break;
      value = value[k];
    }
    
    if (value === undefined || typeof value !== "string") {
      // Fallback to English if translation is missing
      let enValue = dictionaries.en;
      for (const k of keys) {
        if (enValue === undefined || enValue === null) break;
        enValue = enValue[k];
      }
      return typeof enValue === "string" ? enValue : key;
    }
    
    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
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
