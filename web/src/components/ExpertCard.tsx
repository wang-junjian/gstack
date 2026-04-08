'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import styles from './ExpertCard.module.css';

interface ExpertCardProps {
  id: string;
  title: string;
  role: string;
  stage: string;
  description: string;
}

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

export function ExpertCard({ id, title, role, stage, description }: ExpertCardProps) {
  const { t } = useLanguage();
  const stageColor = stageColors[stage] || '#6b7280';

  return (
    <Link href={`/experts/${id}`}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.role}>{role}</p>
          </div>
          <div
            className={styles.stageBadge}
            style={{ backgroundColor: stageColor }}
          >
            {stage}
          </div>
        </div>
        <p className={styles.description}>{description}</p>
        <div className={styles.footer}>
          <span className={styles.link}>{t.viewExpert} →</span>
        </div>
      </div>
    </Link>
  );
}
