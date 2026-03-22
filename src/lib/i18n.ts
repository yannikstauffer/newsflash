import i18n from "i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import { initReactI18next } from "react-i18next"

import de from "@/locales/de.json"
import en from "@/locales/en.json"

const SUPPORTED_LANGUAGES = ["de", "en"]

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      de: { translation: de },
    },
    fallbackLng: "en",
    supportedLngs: SUPPORTED_LANGUAGES,
    nonExplicitSupportedLngs: true,
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "newsflash:locale",
      caches: ["localStorage"],
      lookupFromPathIndex: 0,
    },
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
