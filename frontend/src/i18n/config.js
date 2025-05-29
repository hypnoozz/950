import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from './locales/en.json';
import zhTranslation from './locales/zh.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation,
      },
      zh: {
        translation: zhTranslation,
      },
    },
    lng: 'zh', // 默认语言
    fallbackLng: 'en', // 当前语言的翻译没有时，使用的备选语言
    interpolation: {
      escapeValue: false, // React已经安全地转义了
    },
  });

export default i18n; 