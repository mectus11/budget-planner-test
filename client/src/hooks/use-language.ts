import { useState, useEffect } from "react";
import { translations, Language } from "@/lib/translations";

const LANGUAGE_KEY = "budget_planner_language";

export function useLanguage() {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem(LANGUAGE_KEY) as Language) || "en";
  });

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language);
  }, [language]);

  const t = translations[language];

  return { language, setLanguage, t };
}
