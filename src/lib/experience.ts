export const EXP_THRESHOLDS = [0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 4000];

function getLevelByExp(exp: number): number {
  let level = 1;

  for (let i = 0; i < EXP_THRESHOLDS.length; i += 1) {
    if (exp >= EXP_THRESHOLDS[i]) {
      level = i + 1;
    }
  }

  return Math.min(level, 10);
}

export function applyExperience(
  currentExp: number,
  gainedExp: number,
): {
  oldLevel: number;
  level: number;
  experience: number;
  leveledUp: boolean;
} {
  const experience = Math.max(0, currentExp + gainedExp);
  const oldLevel = getLevelByExp(currentExp);
  const level = getLevelByExp(experience);

  return {
    oldLevel,
    level,
    experience,
    leveledUp: level > oldLevel,
  };
}
