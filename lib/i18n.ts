import { en } from './translations/en'
import { am } from './translations/am'
import { om } from './translations/om'

export const translations = {
  en,
  am,
  om,
}

export const getTranslation = () => {
  if (typeof window !== 'undefined') {
    const lang = localStorage.getItem('lang') || 'en'
    return translations[lang as keyof typeof translations]
  }

  return translations.en
}
