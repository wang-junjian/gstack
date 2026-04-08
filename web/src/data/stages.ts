/**
 * Stage configuration - single source of truth for sprint phases
 * Maps phases to their colors and properties
 */

export interface StageConfig {
  zhName: string;
  enName: string;
  color: string;
  order: number;
}

export const STAGES: Record<string, StageConfig> = {
  'think': {
    zhName: '思考',
    enName: 'Think',
    color: '#3b82f6', // Blue
    order: 1,
  },
  'plan': {
    zhName: '规划',
    enName: 'Plan',
    color: '#8b5cf6', // Purple
    order: 2,
  },
  'build': {
    zhName: '构建',
    enName: 'Build',
    color: '#ec4899', // Pink
    order: 3,
  },
  'review': {
    zhName: '审查',
    enName: 'Review',
    color: '#f59e0b', // Amber
    order: 4,
  },
  'test': {
    zhName: '测试',
    enName: 'Test',
    color: '#ef4444', // Red
    order: 5,
  },
  'ship': {
    zhName: '发布',
    enName: 'Ship',
    color: '#10b981', // Green
    order: 6,
  },
  'reflect': {
    zhName: '反思',
    enName: 'Reflect',
    color: '#06b6d4', // Cyan
    order: 7,
  },
};

/**
 * Get stage config by Chinese or English name
 */
export function getStageByName(name: string): StageConfig | undefined {
  return Object.values(STAGES).find(
    (stage) => stage.zhName === name || stage.enName === name
  );
}

/**
 * Get stage color by Chinese or English name
 */
export function getStageColor(name: string): string {
  const stage = getStageByName(name);
  return stage?.color || '#6b7280';
}

/**
 * Get all stages in order
 */
export function getStagedList(language: 'zh' | 'en'): string[] {
  return Object.values(STAGES)
    .sort((a, b) => a.order - b.order)
    .map((stage) => (language === 'zh' ? stage.zhName : stage.enName));
}
