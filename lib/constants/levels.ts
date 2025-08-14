// Standardized level definitions used across the application
export interface LevelOption {
  value: string;
  label: string;
  description?: string;
}

export const LEVEL_OPTIONS: LevelOption[] = [
  {
    value: "A1",
    label: "A1 - Начинающий",
    description: "Базовые фразы и выражения",
  },
  {
    value: "A2",
    label: "A2 - Элементарный",
    description: "Простые диалоги и повседневные темы",
  },
  {
    value: "B1",
    label: "B1 - Средний",
    description: "Основные идеи в знакомых ситуациях",
  },
  {
    value: "B2",
    label: "B2 - Продвинутый",
    description: "Сложные тексты и специализированные темы",
  },
  {
    value: "C1",
    label: "C1 - Профессиональный",
    description: "Свободное владение языком",
  },
];

// Helper function to get level label by value
export const getLevelLabel = (level: string): string => {
  const option = LEVEL_OPTIONS.find((opt) => opt.value === level);

  return option ? option.label : level;
};

// Helper function to get level description by value
export const getLevelDescription = (level: string): string => {
  const option = LEVEL_OPTIONS.find((opt) => opt.value === level);

  return option?.description || "";
};

// For backward compatibility, map old level values to new ones
export const LEGACY_LEVEL_MAP: Record<string, string> = {
  beginner: "A1",
  elementary: "A2",
  intermediate: "B1",
  advanced: "B2",
  "С нуля": "A1",
  Начинающий: "A1",
  Продолжающий: "B1",
  Продвинутый: "B2",
  Средний: "B1",
  Элементарный: "A2",
  Профессиональный: "C1",
};

// Convert legacy level to standardized level
export const normalizeLevelValue = (level: string): string => {
  return LEGACY_LEVEL_MAP[level] || level;
};
