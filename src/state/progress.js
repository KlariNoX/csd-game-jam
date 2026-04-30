import Phaser from 'phaser';
import { PROGRESS_STORAGE_KEY, TOTAL_LEVELS } from '../config/constants.js';
import { LEVELS } from '../data/levels.js';

// Progress helpers are intentionally tiny: registry first, localStorage persistence second.
export function clampLevelIndex(levelIndex) {
  return Phaser.Math.Clamp(levelIndex, 0, TOTAL_LEVELS - 1);
}

export function getRomanNumeral(value) {
  const numerals = ["I", "II", "III", "IV", "V"];

  return numerals[value - 1] || String(value);
}

export function loadProgressFromStorage() {
  try {
    const rawProgress = window.localStorage.getItem(PROGRESS_STORAGE_KEY);

    if (!rawProgress) {
      return 1;
    }

    const parsedProgress = JSON.parse(rawProgress);

    if (Number.isInteger(parsedProgress.highestUnlockedLevel)) {
      return Phaser.Math.Clamp(parsedProgress.highestUnlockedLevel, 1, TOTAL_LEVELS);
    }
  } catch (error) {
    // If storage is unavailable, the game falls back to the default progress.
  }

  return 1;
}

export function saveProgressToStorage(highestUnlockedLevel) {
  try {
    window.localStorage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify({ highestUnlockedLevel })
    );
  } catch (error) {
    // A failed save should not interrupt the game flow.
  }
}

export function resetGameProgress(scene) {
  try {
    window.localStorage.clear();
  } catch (error) {
    // If storage is unavailable, the in-memory reset still lets this session restart.
  }

  scene.registry.set("highestUnlockedLevel", 1);
  scene.registry.set("selectedLevel", 0);
  scene.registry.set("clearBannerText", "");
}

export function ensureProgress(scene) {
  let highestUnlockedLevel = scene.registry.get("highestUnlockedLevel");

  if (!Number.isInteger(highestUnlockedLevel)) {
    highestUnlockedLevel = loadProgressFromStorage();
    scene.registry.set("highestUnlockedLevel", highestUnlockedLevel);
  }

  const selectedLevel = scene.registry.get("selectedLevel");

  if (!Number.isInteger(selectedLevel)) {
    scene.registry.set("selectedLevel", 0);
  }

  return highestUnlockedLevel;
}

export function getHighestUnlockedLevel(scene) {
  return ensureProgress(scene);
}

export function isLevelUnlocked(scene, levelIndex) {
  return levelIndex + 1 <= getHighestUnlockedLevel(scene);
}

export function getSelectedLevelIndex(scene) {
  ensureProgress(scene);
  return clampLevelIndex(scene.registry.get("selectedLevel"));
}

export function selectLevel(scene, levelIndex) {
  scene.registry.set("selectedLevel", clampLevelIndex(levelIndex));
}

// The game only needs linear progress, so saving the furthest unlocked level keeps it simple.
export function unlockNextLevel(scene, completedLevelIndex) {
  const currentHighestUnlocked = getHighestUnlockedLevel(scene);
  const nextHighestUnlocked = Math.min(
    TOTAL_LEVELS,
    Math.max(currentHighestUnlocked, completedLevelIndex + 2)
  );

  scene.registry.set("highestUnlockedLevel", nextHighestUnlocked);
  saveProgressToStorage(nextHighestUnlocked);

  return {
    highestUnlockedLevel: nextHighestUnlocked,
    didUnlockNewLevel: nextHighestUnlocked > currentHighestUnlocked,
    newlyUnlockedLevel:
      nextHighestUnlocked > currentHighestUnlocked ? nextHighestUnlocked : null
  };
}

export function getCurrentLevel(scene) {
  return LEVELS[getSelectedLevelIndex(scene)];
}

