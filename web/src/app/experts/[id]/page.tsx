'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, use } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import styles from './page.module.css';

type ExpertKey = keyof typeof import('@/data/i18n').zhText.experts;

const stageColors: Record<string, string> = {
  'Think': '#3b82f6',
  'Plan': '#8b5cf6',
  'Build': '#ec4899',
  'Review': '#f59e0b',
  'Test': '#ef4444',
  'Ship': '#10b981',
  'Reflect': '#06b6d4',
  '思考': '#3b82f6',
  '规划': '#8b5cf6',
  '构建': '#ec4899',
  '审查': '#f59e0b',
  '测试': '#ef4444',
  '发布': '#10b981',
  '反思': '#06b6d4',
};

const stageDescriptions = {
  en: {
    'Think': 'This expert helps you think through your product idea in the initial phase.',
    'Plan': 'This expert helps you create a comprehensive plan before you start building.',
    'Review': 'This expert reviews your code and design to catch issues early.',
    'Test': 'This expert tests your application to ensure quality and catch bugs.',
    'Ship': 'This expert helps you release your code safely to production.',
    'Reflect': 'This expert helps you reflect on what you shipped and improve for next time.',
  },
  zh: {
    '思考': '这位专家在初期帮助你思考你的产品想法。',
    '规划': '这位专家帮助你在开始构建之前创建全面的计划。',
    '审查': '这位专家审查你的代码和设计，以便早期发现问题。',
    '测试': '这位专家测试你的应用程序以确保质量并发现错误。',
    '发布': '这位专家帮助你安全地将代码发布到生产环境。',
    '反思': '这位专家帮助你反思你发布的内容，为下一次改进。',
  }
};

export default function ExpertPage(props: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [skillContent, setSkillContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = use(props.params);

  const expertId = params.id as ExpertKey;
  const expert = t.experts[expertId];

  // Fetch SKILL.md content when component mounts or when language/expertId changes
  useEffect(() => {
    if (!expert || !expert.skillPath) {
      setIsLoading(false);
      return;
    }

    const fetchSkillContent = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const lang = language === 'en' ? 'en' : 'zh';
        const response = await fetch(
          `/api/skill?path=${expert.skillPath}&lang=${lang}`
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch skill: ${response.statusText}`);
        }
        const data = await response.json();
        setSkillContent(data.content || '');
      } catch (err) {
        console.error('Error fetching skill content:', err);
        setError(err instanceof Error ? err.message : 'Failed to load skill content');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSkillContent();
  }, [expert, language]);

  if (!expert) {
    return (
      <div className={styles.container}>
        <div className={styles.backLink} onClick={() => router.back()}>
          ← {t.back}
        </div>
        <h1>Expert not found</h1>
      </div>
    );
  }

  const stageColor = stageColors[expert.stage] || '#6b7280';
  const stageDescription = language === 'en' 
    ? stageDescriptions.en[expert.stage as keyof typeof stageDescriptions.en]
    : stageDescriptions.zh[expert.stage as keyof typeof stageDescriptions.zh];

  return (
    <main>
      <LanguageSwitcher />
      <div className={styles.container}>
        <div 
          className={styles.backLink} 
          onClick={() => router.back()}
          style={{ cursor: 'pointer' }}
        >
          ← {t.back}
        </div>

        <div className={styles.header}>
          <div className={styles.titleSection}>
            <div className={styles.content}>
              <h1 className={styles.title}>{expert.title}</h1>
              <p className={styles.role}>{expert.role}</p>
              <div
                className={styles.stageBadge}
                style={{ backgroundColor: stageColor }}
              >
                {expert.stage}
              </div>
            </div>
          </div>

          <div className={styles.description}>
            {expert.description}
          </div>

          <div className={styles.workflowInfo}>
            <h3>✨ {language === 'en' ? 'Sprint Stage' : '冲刺阶段'}</h3>
            <p>{stageDescription}</p>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            🎯 {t.skills}
          </h2>
          <div className={styles.skillsList}>
            {expert.skills.map((skill: string, index: number) => (
              <div key={index} className={styles.skillTag}>
                {skill}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            📜 {t.skillContent || 'Skill Details'}
          </h2>
          {isLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
              {t.loading || 'Loading...'}
            </div>
          ) : error ? (
            <div style={{ padding: '2rem', color: '#dc2626', backgroundColor: '#fee2e2', borderRadius: '0.5rem' }}>
              {language === 'en' ? 'Error loading skill content: ' : '加载技能内容出错: '}{error}
            </div>
          ) : skillContent ? (
            <div className={styles.skillContent}>
              <MarkdownRenderer content={skillContent} />
            </div>
          ) : (
            <div style={{ padding: '2rem', color: '#666' }}>
              {language === 'en' ? 'No skill details available' : '无可用的技能详情'}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
