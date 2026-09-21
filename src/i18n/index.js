import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import km from './km.json'
import en from './en.json'

const savedLang = typeof window !== 'undefined' ? localStorage.getItem('theapka_lang') || 'km' : 'km'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      km: { translation: km },
      en: { translation: en },
    },
    lng: savedLang,
    fallbackLng: 'km',
    interpolation: {
      escapeValue: false, // React handles escaping
    },
  })

i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('theapka_lang', lng)
    document.documentElement.lang = lng
  }
})

export default i18n
