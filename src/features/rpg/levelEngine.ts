/**
 * Centralized RPG Level Engine
 * Formula: XP required for level L = 100 * L * (L - 1) / 2
 * Level 1 begins at 0 XP.
 * Level 2 requires 100 XP.
 * Level 3 requires 300 XP.
 * Level 4 requires 600 XP.
 * Level 5 requires 1000 XP.
 */

export function getXpRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor((100 * level * (level - 1)) / 2);
}

export interface LevelInfo {
  level: number;
  totalXp: number;
  currentLevelThreshold: number;
  nextLevelThreshold: number;
  xpInCurrentLevel: number;
  xpNeededForNextLevel: number;
  progressPercent: number;
}

export function calculateLevelFromXp(totalXp: number): LevelInfo {
  const safeXp = Math.max(0, Math.floor(totalXp || 0));
  
  let level = 1;
  while (getXpRequiredForLevel(level + 1) <= safeXp) {
    level++;
  }

  const currentLevelThreshold = getXpRequiredForLevel(level);
  const nextLevelThreshold = getXpRequiredForLevel(level + 1);
  const xpNeededForNextLevel = nextLevelThreshold - safeXp;
  const levelSpan = nextLevelThreshold - currentLevelThreshold;
  const xpInCurrentLevel = safeXp - currentLevelThreshold;
  const progressPercent = levelSpan > 0 
    ? Math.min(100, Math.max(0, Math.round((xpInCurrentLevel / levelSpan) * 100)))
    : 0;

  return {
    level,
    totalXp: safeXp,
    currentLevelThreshold,
    nextLevelThreshold,
    xpInCurrentLevel,
    xpNeededForNextLevel,
    progressPercent,
  };
}
