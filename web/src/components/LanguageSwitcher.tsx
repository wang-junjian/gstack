'use client';

import { useLanguage } from '@/context/LanguageContext';
import styles from './LanguageSwitcher.module.css';

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className={styles.switcher}>
      <button
        className={`${styles.button} ${language === 'zh' ? styles.active : ''}`}
        onClick={() => setLanguage('zh')}
      >
        {t.chinese}
      </button>
      <button
        className={`${styles.button} ${language === 'en' ? styles.active : ''}`}
        onClick={() => setLanguage('en')}
      >
        {t.english}
      </button>
    </div>
  );
}
