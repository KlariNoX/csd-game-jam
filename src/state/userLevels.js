import { GAME_HEIGHT, GAME_WIDTH } from '../config/constants.js';

export const USER_LEVELS_STORAGE_KEY = "crab-out-of-nile-user-levels";
export const USER_LEVEL_VERSION = 2;

function clampNumber(value, min, max, fallback) {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, value));
}

function makeObjectId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

export function createDefaultLevelLayout() {
  return {
    playerStart: { x: 42, y: 198 },
    goal: { x: 430, y: 159, width: 34, height: 48 },
    solids: [
      {
        id: makeObjectId("solid"),
        type: "floor",
        style: "backgroundFloor",
        x: 0,
        y: 207,
        width: GAME_WIDTH,
        height: GAME_HEIGHT - 207
      },
      {
        id: makeObjectId("solid"),
        type: "ledge",
        style: "ruinLedge",
        x: 120,
        y: 176,
        width: 80,
        height: 12
      }
    ],
    hazards: [],
    objects: []
  };
}

function normalizeRect(rect, fallback = {}) {
  return {
    ...fallback,
    ...rect,
    x: clampNumber(rect?.x, 0, GAME_WIDTH, fallback.x ?? 0),
    y: clampNumber(rect?.y, 0, GAME_HEIGHT, fallback.y ?? 0),
    width: clampNumber(rect?.width, 1, GAME_WIDTH, fallback.width ?? 16),
    height: clampNumber(rect?.height, 1, GAME_HEIGHT, fallback.height ?? 16)
  };
}

function normalizeLayout(layout, levelVersion) {
  const defaultLayout = createDefaultLevelLayout();
  const shouldMigrateStarterLayout =
    !layout ||
    (levelVersion < USER_LEVEL_VERSION &&
      !layout.solids?.length &&
      !layout.hazards?.length &&
      !layout.objects?.length);

  if (shouldMigrateStarterLayout) {
    return defaultLayout;
  }

  const playerStart = {
    x: clampNumber(layout.playerStart?.x, 0, GAME_WIDTH, defaultLayout.playerStart.x),
    y: clampNumber(layout.playerStart?.y, 0, GAME_HEIGHT, defaultLayout.playerStart.y)
  };
  const hasGoalField = Object.prototype.hasOwnProperty.call(layout, "goal");
  const goal = hasGoalField
    ? layout.goal
      ? normalizeRect(layout.goal, defaultLayout.goal)
      : null
    : defaultLayout.goal;
  const solids = Array.isArray(layout.solids)
    ? layout.solids.map((solid, index) => ({
      ...normalizeRect(solid, {
        id: makeObjectId("solid"),
        type: solid?.type || "ledge",
        style: solid?.style || (solid?.type === "floor" ? "backgroundFloor" : "ruinLedge"),
        x: 0,
        y: 207,
        width: 64,
        height: 12
      }),
      id: solid?.id || `solid-${index}`,
      type: solid?.type || "ledge",
      style: solid?.style || (solid?.type === "floor" ? "backgroundFloor" : "ruinLedge")
    }))
    : defaultLayout.solids;
  const hazards = Array.isArray(layout.hazards)
    ? layout.hazards.map((hazard, index) => {
      const type = hazard?.type || "spike";

      return {
        ...normalizeRect(hazard, {
          id: makeObjectId("hazard"),
          type,
          x: 160,
          y: 191,
          width: type === "spike" ? 16 : 32,
          height: 16
        }),
        id: hazard?.id || `hazard-${index}`,
        type,
        direction: hazard?.direction === "down" ? "down" : "up"
      };
    })
    : defaultLayout.hazards;
  const objects = Array.isArray(layout.objects)
    ? layout.objects.map((object, index) => {
      const normalizedObject = normalizeRect(object, {
        id: makeObjectId("object"),
        type: object?.type || "block",
        x: 160,
        y: 189,
        width: object?.type === "movingPlatform" ? 64 : 20,
        height: object?.type === "movingPlatform" ? 10 : 18
      });

      return {
        ...normalizedObject,
        id: object?.id || `object-${index}`,
        type: object?.type || "block",
        fromX: clampNumber(object?.fromX, 0, GAME_WIDTH, normalizedObject.x),
        toX: clampNumber(object?.toX, 0, GAME_WIDTH, normalizedObject.x),
        fromY: clampNumber(object?.fromY, 0, GAME_HEIGHT, normalizedObject.y),
        toY: clampNumber(object?.toY, 0, GAME_HEIGHT, normalizedObject.y),
        duration: clampNumber(object?.duration, 600, 9000, 2600)
      };
    })
    : defaultLayout.objects;

  return { playerStart, goal, solids, hazards, objects };
}

export function normalizeUserLevel(level, index = 0) {
  const version = Number.isInteger(level?.version) ? level.version : 1;

  return {
    ...level,
    id: level?.id || `user-level-${index}`,
    name: level?.name || level?.title || `Untitled Level ${index + 1}`,
    backgroundIndex: clampNumber(level?.backgroundIndex, 0, 4, 0),
    createdAt: level?.createdAt || new Date().toISOString(),
    updatedAt: level?.updatedAt || level?.createdAt || new Date().toISOString(),
    version: USER_LEVEL_VERSION,
    layout: normalizeLayout(level?.layout, version)
  };
}

export function loadSavedUserLevels() {
  try {
    const savedLevels = JSON.parse(window.localStorage.getItem(USER_LEVELS_STORAGE_KEY) || "[]");

    if (!Array.isArray(savedLevels)) {
      return [];
    }

    return savedLevels.map(normalizeUserLevel);
  } catch {
    return [];
  }
}

export function saveUserLevels(levels) {
  try {
    window.localStorage.setItem(
      USER_LEVELS_STORAGE_KEY,
      JSON.stringify(levels.map(normalizeUserLevel))
    );
  } catch {
    // Storage can fail in private browsing. The UI should stay responsive anyway.
  }
}

export function createUserLevel(name, backgroundIndex, existingLevelCount = 0) {
  const now = new Date().toISOString();

  return normalizeUserLevel({
    id: makeObjectId("user-level"),
    name: name || `Untitled Level ${existingLevelCount + 1}`,
    backgroundIndex,
    createdAt: now,
    updatedAt: now,
    version: USER_LEVEL_VERSION,
    layout: createDefaultLevelLayout()
  }, existingLevelCount);
}

export function findUserLevel(levelId) {
  return loadSavedUserLevels().find((level) => level.id === levelId) || null;
}

export function upsertUserLevel(nextLevel) {
  const levels = loadSavedUserLevels();
  const normalizedLevel = normalizeUserLevel({
    ...nextLevel,
    updatedAt: new Date().toISOString()
  });
  const existingIndex = levels.findIndex((level) => level.id === normalizedLevel.id);

  if (existingIndex >= 0) {
    levels[existingIndex] = normalizedLevel;
  } else {
    levels.push(normalizedLevel);
  }

  saveUserLevels(levels);
  return normalizedLevel;
}
