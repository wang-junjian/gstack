'use client';

import { useLanguage } from '@/context/LanguageContext';
import { getStageColor } from '@/data/stages';
import styles from './SprintFlow.module.css';

interface SprintFlowProps {
  selectedPhase?: string;
  onPhaseClick?: (phase: string) => void;
}

export function SprintFlow({ selectedPhase, onPhaseClick }: SprintFlowProps) {
  const { t } = useLanguage();

  const phases = t.sprintPhases;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t.stepBy}</h2>
      <div className={styles.flow}>
        {phases.map((phase, index) => {
          // Get color from the stage configuration instead of hardcoded array
          const stageColor = getStageColor(phase);
          
          return (
            <div key={index} className={styles.phaseWrapper}>
              <div
                className={`${styles.phase} ${selectedPhase === phase ? styles.selected : ''}`}
                style={{ '--phase-color': stageColor } as React.CSSProperties}
                onClick={() => onPhaseClick?.(phase)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onPhaseClick?.(phase);
                  }
                }}
              >
                <div className={styles.phaseNumber}>{index + 1}</div>
                <div className={styles.phaseName}>{phase}</div>
              </div>
              {index < phases.length - 1 && <div className={styles.arrow}>→</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
