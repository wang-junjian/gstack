'use client';

import { useState, useRef, useMemo } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { SprintFlow } from '@/components/SprintFlow';
import { ExpertCard } from '@/components/ExpertCard';
import { getStageColor } from '@/data/stages';
import styles from './page.module.css';

type ExpertKey = keyof typeof import('@/data/i18n').zhText.experts;

export default function Home() {
  const { t } = useLanguage();
  const [selectedPhase, setSelectedPhase] = useState<string>();
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const phases = t.sprintPhases;
  const experts = t.experts as Record<string, any>;

  // Dynamically group experts by their stage field
  // This eliminates the hardcoded stageMap and ensures single source of truth
  const groupedExperts: Record<string, any[]> = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    
    // Initialize empty arrays for each phase
    phases.forEach((phase) => {
      grouped[phase] = [];
    });
    
    // Group experts by their stage property
    Object.entries(experts).forEach(([id, expert]) => {
      const stage = expert.stage;
      if (stage && grouped[stage]) {
        grouped[stage].push({
          id,
          ...expert,
        });
      }
    });
    
    return grouped;
  }, [experts, phases]);

  const handlePhaseClick = (phase: string) => {
    setSelectedPhase(phase);
    // Scroll to the section
    setTimeout(() => {
      const element = sectionRefs.current[phase];
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <main>
      <LanguageSwitcher />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t.title}</h1>
          <p className={styles.subtitle}>{t.subtitle}</p>
        </div>

        <SprintFlow selectedPhase={selectedPhase} onPhaseClick={handlePhaseClick} />

        {phases.map((phase) => {
          const stageColor = getStageColor(phase);
          
          return (
            <div
              key={phase}
              ref={(el) => {
                if (el) sectionRefs.current[phase] = el;
              }}
              className={`${styles.section} ${selectedPhase === phase ? styles.sectionHighlight : ''}`}
            >
              <h2 className={styles.sectionTitle}>
                <span
                  className={styles.stageBadge}
                  style={{ backgroundColor: stageColor }}
                >
                  {phase}
                </span>
              </h2>
              <div className={styles.grid}>
                {groupedExperts[phase]?.map((expert) => (
                  <ExpertCard
                    key={expert.id}
                    id={expert.id}
                    title={expert.title}
                    role={expert.role}
                    stage={expert.stage}
                    description={expert.description}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
