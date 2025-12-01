import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import hi from "./locales/hi.json";
import ta from "./locales/ta.json";

// Check if user already selected a language
const savedLanguage = localStorage.getItem("i18nextLng") || "en";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      ta: { translation: ta },
    },
    lng: savedLanguage, // default language from localStorage or fallback
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
