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
        中文
      </button>
      <button
        className={`${styles.button} ${language === 'en' ? styles.active : ''}`}
        onClick={() => setLanguage('en')}
      >
        English
      </button>
    </div>
  );
}
