import {
  CRAB_FRAME_SIZE,
  CRAB_IDLE_FRAME,
  CRAB_JUMP_FRAME,
  CRAB_MENU_IDLE_FRAMES,
  CRAB_SCUTTLE_FRAMES,
  CRAB_SPRITESHEET_KEY,
  COLORS,
  COLOR_VALUES,
  ENDING_SCENE_BACKGROUND_KEY,
  GAME_HEIGHT,
  GAME_WIDTH,
  LEVEL_SELECT_BACKGROUND_KEY,
  MAIN_MENU_BACKGROUND_KEY,
  PYRAMID_TILEGROUND_KEY
} from '../config/constants.js';
import {
  BG_MUSIC_URL,
  CRAB_SPRITESHEET_URL,
  ENDING_SCENE_BACKGROUND_URL,
  LEVEL_BACKGROUNDS,
  LEVEL_SELECT_BACKGROUND_URL,
  MAIN_MENU_BACKGROUND_URL,
  PYRAMID_TILEGROUND_URL,
  TRACK_URLS
} from '../config/assets.js';
import { clampLevelIndex } from '../state/progress.js';

// Background and preload helpers keep scene files focused on flow instead of asset plumbing.
export function drawSky(scene) {
  const graphics = scene.add.graphics();

  graphics.fillGradientStyle(
    COLORS.skyTop,
    COLORS.skyTop,
    COLORS.skyBottom,
    COLORS.skyBottom,
    1
  );
  graphics.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  return graphics;
}

export function drawDesert(scene) {
  const graphics = scene.add.graphics();

  graphics.fillStyle(COLORS.sandLight, 1);
  graphics.fillRect(0, 160, GAME_WIDTH, 110);

  graphics.fillStyle(COLORS.sandMid, 1);
  graphics.fillTriangle(0, 210, 100, 160, 200, 210);
  graphics.fillTriangle(140, 220, 260, 165, 380, 220);
  graphics.fillTriangle(260, 230, 370, 175, 480, 230);

  return graphics;
}

export function drawPyramids(scene) {
  const graphics = scene.add.graphics();

  graphics.fillStyle(COLORS.sandLight, 1);
  graphics.fillTriangle(40, 190, 120, 85, 200, 190);
  graphics.fillTriangle(180, 195, 275, 70, 370, 195);
  graphics.fillTriangle(320, 205, 395, 105, 470, 205);

  graphics.fillStyle(COLORS.sandDark, 0.45);
  graphics.fillTriangle(120, 85, 200, 190, 120, 190);
  graphics.fillTriangle(275, 70, 370, 195, 275, 195);
  graphics.fillTriangle(395, 105, 470, 205, 395, 205);

  graphics.fillStyle(COLORS.sandMid, 1);
  graphics.fillRect(0, 205, GAME_WIDTH, 65);

  return graphics;
}

export function drawStars(scene) {
  for (let i = 0; i < 28; i += 1) {
    scene.add.rectangle(
      12 + (i * 37) % GAME_WIDTH,
      14 + (i * 23) % 110,
      i % 3 === 0 ? 2 : 1,
      i % 3 === 0 ? 2 : 1,
      0xfff4c7
    );
  }
}

export function drawPyramidInterior(scene) {
  const graphics = scene.add.graphics();

  graphics.fillGradientStyle(
    COLORS.wallDark,
    COLORS.wallDark,
    COLORS.wallMid,
    COLORS.wallMid,
    1
  );
  graphics.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  graphics.fillStyle(COLORS.wallLight, 0.14);
  graphics.fillTriangle(0, 0, 0, GAME_HEIGHT, 96, GAME_HEIGHT);
  graphics.fillTriangle(GAME_WIDTH, 0, GAME_WIDTH, GAME_HEIGHT, GAME_WIDTH - 96, GAME_HEIGHT);

  graphics.fillStyle(COLORS.stone, 1);
  graphics.fillRect(22, 34, 28, 176);
  graphics.fillRect(430, 34, 28, 176);
  graphics.fillRect(16, 28, 40, 10);
  graphics.fillRect(424, 28, 40, 10);

  graphics.lineStyle(1, COLORS.wallLine, 0.4);

  for (let y = 50; y < 194; y += 24) {
    graphics.lineBetween(0, y, GAME_WIDTH, y);
  }

  for (let x = 34; x < GAME_WIDTH; x += 68) {
    graphics.lineBetween(x, 0, x, 194);
  }

  graphics.fillStyle(COLORS.sandDark, 1);
  graphics.fillRect(0, 214, GAME_WIDTH, 56);

  graphics.fillStyle(COLORS.sandMid, 1);
  graphics.fillTriangle(0, 214, 90, 182, 180, 214);
  graphics.fillTriangle(132, 214, 240, 178, 348, 214);
  graphics.fillTriangle(292, 214, 386, 190, 480, 214);

  return graphics;
}

export function drawReportParchment(scene) {
  const graphics = scene.add.graphics();
  const sheetX = 58;
  const sheetY = 20;
  const sheetWidth = 364;
  const sheetHeight = 220;

  graphics.fillGradientStyle(
    COLORS.sandDark,
    COLORS.sandDark,
    COLORS.wallDark,
    COLORS.wallDark,
    1
  );
  graphics.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  graphics.fillStyle(0x1a0d05, 0.34);
  graphics.fillRoundedRect(sheetX - 10, sheetY + 8, sheetWidth + 20, sheetHeight + 4, 8);

  graphics.fillStyle(0x8c5d2b, 1);
  graphics.fillRoundedRect(sheetX - 13, sheetY + 6, 18, sheetHeight - 4, 8);
  graphics.fillRoundedRect(sheetX + sheetWidth - 5, sheetY + 6, 18, sheetHeight - 4, 8);
  graphics.fillStyle(0xd09a52, 0.55);
  graphics.fillRect(sheetX - 9, sheetY + 16, 3, sheetHeight - 24);
  graphics.fillRect(sheetX + sheetWidth + 4, sheetY + 16, 3, sheetHeight - 24);
  graphics.lineStyle(2, 0x58361a, 0.8);
  graphics.strokeRoundedRect(sheetX - 13, sheetY + 6, 18, sheetHeight - 4, 8);
  graphics.strokeRoundedRect(sheetX + sheetWidth - 5, sheetY + 6, 18, sheetHeight - 4, 8);

  graphics.fillGradientStyle(0xf6d99a, 0xe2b973, 0xd9a95e, 0xc88d47, 1);
  graphics.fillRoundedRect(sheetX, sheetY, sheetWidth, sheetHeight, 5);

  graphics.fillStyle(0xffedb8, 0.34);
  graphics.fillRect(sheetX + 12, sheetY + 10, sheetWidth - 24, 24);
  graphics.fillStyle(0xb87831, 0.16);
  graphics.fillRect(sheetX + 12, sheetY + sheetHeight - 26, sheetWidth - 24, 18);

  const chipColor = COLORS.wallDark;
  const chips = [
    [72, 20, 9, 5], [126, 20, 13, 4], [205, 20, 8, 5], [278, 20, 12, 4],
    [350, 20, 9, 5], [84, 235, 13, 5], [156, 235, 8, 4], [248, 235, 12, 5],
    [334, 235, 9, 4], [58, 42, 5, 11], [58, 118, 5, 8], [58, 202, 5, 12],
    [417, 70, 5, 10], [417, 142, 5, 12], [417, 210, 5, 8]
  ];

  graphics.fillStyle(chipColor, 0.86);
  chips.forEach(([x, y, width, height]) => {
    graphics.fillRect(x, y, width, height);
  });

  graphics.lineStyle(2, 0x8c5d2b, 0.9);
  graphics.strokeRoundedRect(sheetX, sheetY, sheetWidth, sheetHeight, 5);
  graphics.lineStyle(1, 0x6a3f18, 0.55);
  graphics.strokeRoundedRect(sheetX + 8, sheetY + 8, sheetWidth - 16, sheetHeight - 16, 3);

  graphics.fillStyle(0xb87831, 0.16);
  graphics.fillCircle(110, 120, 28);
  graphics.fillCircle(358, 114, 22);
  graphics.fillCircle(318, 174, 26);
  graphics.fillCircle(156, 194, 18);

  graphics.lineStyle(1, 0x8f642f, 0.22);
  for (let y = sheetY + 18; y < sheetY + sheetHeight - 12; y += 7) {
    const inset = y % 3 === 0 ? 20 : 14;
    graphics.lineBetween(sheetX + inset, y, sheetX + sheetWidth - inset, y);
  }

  graphics.lineStyle(1, 0xffefbf, 0.18);
  for (let x = sheetX + 26; x < sheetX + sheetWidth - 20; x += 18) {
    graphics.lineBetween(x, sheetY + 12, x - 6, sheetY + sheetHeight - 14);
  }

  graphics.fillStyle(0x9b713a, 0.22);
  graphics.fillRoundedRect(68, 35, 344, 38, 3);
  graphics.fillRoundedRect(74, 96, 332, 84, 3);
  graphics.fillRoundedRect(74, 188, 332, 26, 3);

  graphics.lineStyle(1, 0x7a5326, 0.55);
  graphics.lineBetween(82, 82, 398, 82);
  graphics.lineBetween(88, 184, 392, 184);

  graphics.fillStyle(0x6a3f18, 0.32);
  for (let y = 102; y <= 168; y += 22) {
    graphics.fillTriangle(82, y, 90, y + 5, 82, y + 10);
    graphics.fillRect(94, y + 3, 8, 2);
    graphics.fillTriangle(398, y, 390, y + 5, 398, y + 10);
    graphics.fillRect(378, y + 3, 8, 2);
  }

  return graphics;
}

export function preloadImageIfNeeded(scene, key, url) {
  if (!scene.textures.exists(key)) {
    scene.load.image(key, url);
    return true;
  }

  return false;
}

export function preloadAudioIfNeeded(scene, key, url) {
  if (!scene.cache.audio.exists(key)) {
    scene.load.audio(key, url);
    return true;
  }

  return false;
}

export function preloadCrabSpritesheetIfNeeded(scene) {
  if (!scene.textures.exists(CRAB_SPRITESHEET_KEY)) {
    scene.load.spritesheet(CRAB_SPRITESHEET_KEY, CRAB_SPRITESHEET_URL, {
      frameWidth: CRAB_FRAME_SIZE,
      frameHeight: CRAB_FRAME_SIZE
    });
    return true;
  }

  return false;
}

export function preloadPyramidRuinsAssetsIfNeeded(scene) {
  let queuedAsset = false;

  if (!scene.textures.exists(PYRAMID_TILEGROUND_KEY)) {
    scene.load.spritesheet(PYRAMID_TILEGROUND_KEY, PYRAMID_TILEGROUND_URL, {
      frameWidth: 16,
      frameHeight: 16
    });
    queuedAsset = true;
  }

  return queuedAsset;
}

export function preloadMainMenuAssets(scene) {
  let queuedAsset = false;

  queuedAsset = preloadImageIfNeeded(
    scene,
    MAIN_MENU_BACKGROUND_KEY,
    MAIN_MENU_BACKGROUND_URL
  ) || queuedAsset;
  queuedAsset = preloadCrabSpritesheetIfNeeded(scene) || queuedAsset;
  queuedAsset = preloadPyramidRuinsAssetsIfNeeded(scene) || queuedAsset;
  queuedAsset = preloadAudioIfNeeded(scene, "bg-music", BG_MUSIC_URL) || queuedAsset;

  TRACK_URLS.forEach((url, i) => {
    queuedAsset = preloadAudioIfNeeded(scene, `track-${i + 1}`, url) || queuedAsset;
  });

  return queuedAsset;
}

export function getLevelBackground(levelIndex) {
  return LEVEL_BACKGROUNDS[clampLevelIndex(levelIndex)];
}

export function preloadLevelBackgroundIfNeeded(scene, levelIndex) {
  const background = getLevelBackground(levelIndex);

  return preloadImageIfNeeded(scene, background.key, background.url);
}

export function addLevelBackground(scene, levelIndex) {
  const background = getLevelBackground(levelIndex);

  if (!scene.textures.exists(background.key)) {
    drawPyramidInterior(scene);
    return null;
  }

  return scene.add
    .image(0, 0, background.key)
    .setOrigin(0)
    .setDisplaySize(GAME_WIDTH, GAME_HEIGHT)
    .setDepth(-10);
}

export function ensureCrabAnimations(scene) {
  if (!scene.anims.exists("crab-idle")) {
    scene.anims.create({
      key: "crab-idle",
      frames: [{ key: CRAB_SPRITESHEET_KEY, frame: CRAB_IDLE_FRAME }],
      frameRate: 1,
      repeat: -1
    });
  }
  if (!scene.anims.exists("crab-menu-idle")) {
    scene.anims.create({
      key: "crab-menu-idle",
      frames: scene.anims.generateFrameNumbers(CRAB_SPRITESHEET_KEY, {
        frames: CRAB_MENU_IDLE_FRAMES
      }),
      frameRate: 4,
      repeat: -1
    });
  }
  if (!scene.anims.exists("crab-scuttle")) {
    scene.anims.create({
      key: "crab-scuttle",
      frames: scene.anims.generateFrameNumbers(CRAB_SPRITESHEET_KEY, {
        frames: CRAB_SCUTTLE_FRAMES
      }),
      frameRate: 9,
      repeat: -1
    });
  }
  if (!scene.anims.exists("crab-jump")) {
    scene.anims.create({
      key: "crab-jump",
      frames: [{ key: CRAB_SPRITESHEET_KEY, frame: CRAB_JUMP_FRAME }],
      frameRate: 1,
      repeat: -1
    });
  }
}

export function addScaledBackgroundImage(scene, textureKey, fallbackDrawer) {
  if (!scene.textures.exists(textureKey)) {
    fallbackDrawer(scene);
    return null;
  }

  return scene.add
    .image(0, 0, textureKey)
    .setOrigin(0)
    .setDisplaySize(GAME_WIDTH, GAME_HEIGHT)
    .setDepth(-10);
}

export function addMenuBackground(scene) {
  addScaledBackgroundImage(scene, MAIN_MENU_BACKGROUND_KEY, () => {
    drawSky(scene);
    drawStars(scene);
    drawPyramids(scene);
    scene.add.ellipse(60, 38, 26, 26, 0xfaf0ae, 0.85).setDepth(-8);
  });

  scene.add
    .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x120d07, 0.16)
    .setDepth(-7);
}

export function addLevelSelectBackground(scene) {
  addScaledBackgroundImage(scene, LEVEL_SELECT_BACKGROUND_KEY, drawPyramidInterior);

  scene.add
    .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x120d07, 0.12)
    .setDepth(-7);
}

export function addEndingSceneBackground(scene) {
  addScaledBackgroundImage(scene, ENDING_SCENE_BACKGROUND_KEY, () => {
    drawSky(scene);
    drawStars(scene);

    const river = scene.add.graphics().setDepth(-9);
    river.fillStyle(COLORS.waterDeep, 1);
    river.fillRect(0, 178, GAME_WIDTH, 92);
    river.fillStyle(COLORS.water, 1);
    river.fillRect(0, 178, GAME_WIDTH, 84);
  });
}

