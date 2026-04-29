import Phaser from "phaser";

const GAME_WIDTH = 480;
const GAME_HEIGHT = 270;
const TOTAL_LEVELS = 5;
const PROGRESS_STORAGE_KEY = "crab-out-of-nile-progress";
const MAIN_MENU_BACKGROUND_KEY = "main-menu-background";
const LEVEL_SELECT_BACKGROUND_KEY = "level-select-background";
const MAIN_MENU_BACKGROUND_URL = new URL(
  "../assets/main_menu_background.png",
  import.meta.url
).href;
const LEVEL_SELECT_BACKGROUND_URL = new URL(
  "../assets/level_selector_background.png",
  import.meta.url
).href;

const COLORS = {
  sandDark: 0x7a5326,
  sandMid: 0xc48a42,
  sandLight: 0xe6c98a,
  skyTop: 0x1b1f4b,
  skyBottom: 0xf2b661,
  stone: 0x6f5a49,
  wallDark: 0x24150c,
  wallMid: 0x5d4127,
  wallLight: 0xa68152,
  wallLine: 0x7b5b39,
  locked: 0x443224,
  water: 0x2f98c7,
  waterDeep: 0x165c89,
  lava: 0xd64d22,
  lavaBright: 0xffb24c,
  bronze: 0xb5782c,
  bronzeDark: 0x6d4416,
  metal: 0xc2ced7,
  metalDark: 0x58656d,
  danger: 0xff8d58,
  crab: 0xd95f43,
  white: "#fff8de",
  gold: "#f3d36b"
};

const FONTS = {
  ui: '"Trebuchet MS", Verdana, sans-serif',
  title: 'Georgia, "Times New Roman", serif'
};

const BUTTON_STYLE = {
  fontFamily: FONTS.ui,
  fontSize: "14px",
  color: COLORS.white,
  backgroundColor: "#5c3820",
  padding: { x: 14, y: 8 }
};

const LABEL_STYLE = {
  fontFamily: FONTS.ui,
  fontSize: "14px",
  color: COLORS.white
};

const LEVELS = [
  {
    name: "Burial Gate",
    report:
      "Ancient Engineer Report #1:\nThe bronze spikes were installed everywhere except the upper corridor.\nWe ran out of bronze before that strip.\nIf it looks suspiciously empty, trust it.",
    startX: 40,
    startY: 220,
    goal: { x: 430, y: 164, width: 44, height: 88, kind: "river", label: "NILE" },
    solids: [
      { x: 0, y: 232, width: 92, height: 38, style: "stone" },
      { x: 82, y: 204, width: 52, height: 12, style: "stone" },
      { x: 142, y: 204, width: 142, height: 12, style: "stone" },
      { x: 128, y: 170, width: 208, height: 12, style: "safe" },
      { x: 330, y: 232, width: 96, height: 38, style: "stone" }
    ],
    spikes: [
      { x: 102, y: 232, width: 220 },
      { x: 144, y: 204, width: 138 }
    ]
  },
  {
    name: "Sand Hall",
    report:
      "Ancient Engineer Report #2:\nTwo blade carriages still spin.\nThe maintenance bay with the broken blade is the only passage I would use.\nPlease do not stand where the ropes still work.",
    startX: 42,
    startY: 220,
    goal: { x: 430, y: 160, width: 44, height: 92, kind: "river", label: "NILE" },
    solids: [
      { x: 0, y: 232, width: 126, height: 38, style: "stone" },
      { x: 120, y: 206, width: 46, height: 12, style: "stone" },
      { x: 176, y: 184, width: 86, height: 12, style: "stone" },
      { x: 266, y: 160, width: 86, height: 12, style: "stone" },
      { x: 344, y: 232, width: 82, height: 38, style: "stone" }
    ],
    blades: [
      { x1: 148, y1: 220, x2: 240, y2: 220, radius: 11, duration: 1600, phase: 0, broken: false },
      { x1: 308, y1: 136, x2: 308, y2: 196, radius: 11, duration: 1800, phase: 450, broken: false },
      { x1: 220, y1: 160, x2: 220, y2: 160, radius: 12, duration: 1600, phase: 0, broken: true, angle: 18 }
    ]
  },
  {
    name: "Scarab Steps",
    report:
      "Ancient Engineer Report #3:\nWe ran out of lava in the middle channel.\nThat trench is only warm sand dressed up like a trap.\nStep on the dull one, not the bright ones.",
    startX: 42,
    startY: 220,
    goal: { x: 428, y: 166, width: 44, height: 86, kind: "river", label: "NILE" },
    solids: [
      { x: 0, y: 232, width: 124, height: 38, style: "stone" },
      { x: 174, y: 206, width: 40, height: 12, style: "stone" },
      { x: 244, y: 216, width: 86, height: 18, style: "warmSand" },
      { x: 360, y: 206, width: 42, height: 12, style: "stone" },
      { x: 398, y: 232, width: 82, height: 38, style: "stone" }
    ],
    lavaPools: [
      { x: 124, y: 232, width: 50, height: 38 },
      { x: 214, y: 232, width: 30, height: 38 },
      { x: 330, y: 232, width: 30, height: 38 }
    ]
  },
  {
    name: "Moon Shaft",
    report:
      "Ancient Engineer Report #4:\nThe crusher nearest the Nile never got its counterweight.\nIt is decorative, not deadly.\nEvery other ceiling block is eager to flatten visitors.",
    startX: 36,
    startY: 220,
    goal: { x: 430, y: 160, width: 44, height: 92, kind: "river", label: "NILE" },
    solids: [
      { x: 0, y: 232, width: 420, height: 38, style: "stone" },
      { x: 102, y: 118, width: 16, height: 114, style: "pillar" },
      { x: 196, y: 118, width: 16, height: 114, style: "pillar" },
      { x: 290, y: 118, width: 16, height: 114, style: "pillar" },
      { x: 384, y: 118, width: 16, height: 114, style: "pillar" }
    ],
    crushers: [
      { x: 156, topY: 86, width: 56, height: 24, drop: 116, period: 1800, phase: 0, fake: false },
      { x: 250, topY: 86, width: 56, height: 24, drop: 116, period: 1800, phase: 720, fake: false },
      { x: 344, topY: 86, width: 56, height: 24, drop: 116, period: 1800, phase: 0, fake: true }
    ]
  },
  {
    name: "River Mouth",
    report:
      "Ancient Engineer Report #5:\nWe used the leftover spikes, one blade, and a fake lava trench.\nThen we ran out of doors.\nThe huge opening on the right is not a trick. Just leave.",
    startX: 34,
    startY: 220,
    goal: {
      x: 420,
      y: 122,
      width: 48,
      height: 110,
      kind: "doorlessExit",
      label: "NO DOOR"
    },
    solids: [
      { x: 0, y: 232, width: 84, height: 38, style: "stone" },
      { x: 98, y: 198, width: 72, height: 12, style: "safe" },
      { x: 188, y: 176, width: 68, height: 12, style: "stone" },
      { x: 286, y: 216, width: 66, height: 18, style: "warmSand" },
      { x: 370, y: 188, width: 42, height: 12, style: "stone" },
      { x: 404, y: 232, width: 76, height: 38, style: "stone" }
    ],
    spikes: [{ x: 84, y: 232, width: 94 }],
    lavaPools: [
      { x: 256, y: 232, width: 30, height: 38 },
      { x: 352, y: 232, width: 18, height: 38 }
    ],
    blades: [
      { x1: 222, y1: 144, x2: 222, y2: 198, radius: 10, duration: 1600, phase: 320, broken: false }
    ]
  }
];

const LEVEL_NODE_POSITIONS = [
  { x: 228, y: 74 },
  { x: 286, y: 102 },
  { x: 196, y: 134 },
  { x: 142, y: 166 },
  { x: 98, y: 198 }
];

const LEVEL_ROUTE_POINTS = [
  LEVEL_NODE_POSITIONS[0],
  { x: 258, y: 88 },
  LEVEL_NODE_POSITIONS[1],
  { x: 252, y: 116 },
  { x: 224, y: 126 },
  LEVEL_NODE_POSITIONS[2],
  { x: 170, y: 150 },
  LEVEL_NODE_POSITIONS[3],
  { x: 118, y: 182 },
  LEVEL_NODE_POSITIONS[4],
  { x: 170, y: 208 },
  { x: 260, y: 214 },
  { x: 324, y: 220 }
];

const LEVEL_ROUTE_ACTIVE_SEGMENT_COUNTS = [0, 2, 5, 7, 13];
const EXIT_POINT = { x: 376, y: 224 };

const sharedState = {
  musicOn: true,
  soundOn: true
};

function resumeAudioContext(scene) {
  if (!scene.sound?.context) {
    return null;
  }

  const audioContext = scene.sound.context;

  if (audioContext.state === "suspended") {
    audioContext.resume().catch(() => {
      // Browsers may block auto-resume until another gesture; failing quietly keeps UI responsive.
    });
  }

  return audioContext;
}

function playGeneratedSound(scene, notes, masterVolume = 0.05) {
  if (!sharedState.soundOn || !notes.length) {
    return;
  }

  const audioContext = resumeAudioContext(scene);

  if (!audioContext) {
    return;
  }

  const masterGain = audioContext.createGain();
  const sequenceStart = audioContext.currentTime + 0.01;
  let cursor = sequenceStart;

  masterGain.gain.setValueAtTime(masterVolume, sequenceStart);
  masterGain.connect(audioContext.destination);

  notes.forEach((note) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const duration = note.duration ?? 0.08;
    const frequency = note.frequency ?? 440;
    const endFrequency = note.endFrequency ?? frequency;
    const noteVolume = note.volume ?? 1;
    const startTime = cursor + (note.delay ?? 0);
    const attackTime = Math.min(0.015, duration * 0.35);
    const releaseStart = Math.max(startTime + attackTime, startTime + duration - 0.03);

    oscillator.type = note.type ?? "square";
    oscillator.frequency.setValueAtTime(frequency, startTime);
    oscillator.frequency.linearRampToValueAtTime(endFrequency, startTime + duration);

    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.exponentialRampToValueAtTime(
      Math.max(0.0002, noteVolume),
      startTime + attackTime
    );
    gainNode.gain.exponentialRampToValueAtTime(0.0001, releaseStart + 0.03);

    oscillator.connect(gainNode);
    gainNode.connect(masterGain);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.05);

    cursor = startTime + duration;
  });

  window.setTimeout(() => {
    masterGain.disconnect();
  }, Math.max(120, Math.ceil((cursor - sequenceStart) * 1000) + 120));
}

function playSoundCue(scene, cue) {
  switch (cue) {
    case "ui-hover":
      playGeneratedSound(
        scene,
        [{ frequency: 620, endFrequency: 700, duration: 0.045, volume: 0.45 }],
        0.035
      );
      break;
    case "ui-click":
      playGeneratedSound(
        scene,
        [{ frequency: 420, endFrequency: 320, duration: 0.08, volume: 0.7, type: "triangle" }],
        0.04
      );
      break;
    case "jump":
      playGeneratedSound(
        scene,
        [{ frequency: 260, endFrequency: 390, duration: 0.09, volume: 0.55 }],
        0.035
      );
      break;
    case "death":
      playGeneratedSound(
        scene,
        [
          { frequency: 240, endFrequency: 150, duration: 0.12, volume: 0.55, type: "sawtooth" },
          { frequency: 150, endFrequency: 92, duration: 0.14, volume: 0.48, type: "sawtooth" }
        ],
        0.045
      );
      break;
    case "dry":
      playGeneratedSound(
        scene,
        [
          { frequency: 180, endFrequency: 120, duration: 0.1, volume: 0.5, type: "triangle" },
          { frequency: 120, endFrequency: 84, duration: 0.12, volume: 0.42, type: "triangle" }
        ],
        0.04
      );
      break;
    case "clear":
      playGeneratedSound(
        scene,
        [
          { frequency: 420, endFrequency: 420, duration: 0.07, volume: 0.6, type: "triangle" },
          { frequency: 560, endFrequency: 560, duration: 0.08, volume: 0.62, type: "triangle", delay: 0.01 },
          { frequency: 740, endFrequency: 740, duration: 0.12, volume: 0.68, type: "triangle", delay: 0.015 }
        ],
        0.045
      );
      break;
    default:
      break;
  }
}

function clampLevelIndex(levelIndex) {
  return Phaser.Math.Clamp(levelIndex, 0, TOTAL_LEVELS - 1);
}

function loadProgressFromStorage() {
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

function saveProgressToStorage(highestUnlockedLevel) {
  try {
    window.localStorage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify({ highestUnlockedLevel })
    );
  } catch (error) {
    // A failed save should not interrupt the game flow.
  }
}

function ensureProgress(scene) {
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

function getHighestUnlockedLevel(scene) {
  return ensureProgress(scene);
}

function isLevelUnlocked(scene, levelIndex) {
  return levelIndex + 1 <= getHighestUnlockedLevel(scene);
}

function getSelectedLevelIndex(scene) {
  ensureProgress(scene);
  return clampLevelIndex(scene.registry.get("selectedLevel"));
}

function selectLevel(scene, levelIndex) {
  scene.registry.set("selectedLevel", clampLevelIndex(levelIndex));
}

// The game only needs linear progress, so saving the furthest unlocked level keeps it simple.
function unlockNextLevel(scene, completedLevelIndex) {
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

function getCurrentLevel(scene) {
  return LEVELS[getSelectedLevelIndex(scene)];
}

function drawSky(scene) {
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

function drawDesert(scene) {
  const graphics = scene.add.graphics();

  graphics.fillStyle(COLORS.sandLight, 1);
  graphics.fillRect(0, 160, GAME_WIDTH, 110);

  graphics.fillStyle(COLORS.sandMid, 1);
  graphics.fillTriangle(0, 210, 100, 160, 200, 210);
  graphics.fillTriangle(140, 220, 260, 165, 380, 220);
  graphics.fillTriangle(260, 230, 370, 175, 480, 230);

  return graphics;
}

function drawPyramids(scene) {
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

function drawStars(scene) {
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

function drawPyramidInterior(scene) {
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

function drawReportParchment(scene) {
  const graphics = scene.add.graphics();

  graphics.fillGradientStyle(
    COLORS.sandDark,
    COLORS.sandDark,
    COLORS.wallDark,
    COLORS.wallDark,
    1
  );
  graphics.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  graphics.fillStyle(0xefd49a, 1);
  graphics.fillRoundedRect(54, 20, 372, 220, 12);
  graphics.lineStyle(3, 0xb1844b, 1);
  graphics.strokeRoundedRect(54, 20, 372, 220, 12);

  graphics.fillStyle(0xe0bf7d, 0.65);
  graphics.fillRoundedRect(66, 30, 348, 200, 10);

  graphics.fillStyle(0xc99853, 0.22);
  graphics.fillCircle(108, 78, 24);
  graphics.fillCircle(350, 88, 20);
  graphics.fillCircle(314, 178, 26);
  graphics.fillCircle(154, 188, 18);

  graphics.lineStyle(1, 0xb1844b, 0.5);

  for (let y = 54; y <= 206; y += 28) {
    graphics.lineBetween(82, y, 398, y);
  }

  return graphics;
}

function createPanel(scene, x, y, width, height) {
  const panel = scene.add.graphics();

  panel.fillStyle(0x2c170b, 0.82);
  panel.fillRoundedRect(x, y, width, height, 10);
  panel.lineStyle(2, COLORS.gold, 1);
  panel.strokeRoundedRect(x, y, width, height, 10);

  return panel;
}

function createTextButton(scene, x, y, label, onClick, width = 140) {
  const button = scene.add
    .text(x, y, label, BUTTON_STYLE)
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });

  button.baseY = y;
  button.setFixedSize(width, 34);
  button.setAlign("center");
  button.setPadding(0, 8, 0, 0);
  button.setDepth(40);
  button.setShadow(0, 2, "#1a0f08", 0, true, true);

  button
    .on("pointerover", () => {
      button.setStyle({ backgroundColor: "#7b4d2b", color: "#fff3b4" });
      button.setScale(1.04);
      button.setY(button.baseY - 1);
      playSoundCue(scene, "ui-hover");
    })
    .on("pointerout", () => {
      button.setStyle({
        backgroundColor: BUTTON_STYLE.backgroundColor,
        color: BUTTON_STYLE.color
      });
      button.setScale(1);
      button.setY(button.baseY);
    })
    .on("pointerdown", () => {
      playSoundCue(scene, "ui-click");
      button.setScale(0.98);
      button.setY(button.baseY + 1);
      onClick();
    })
    .on("pointerup", () => {
      button.setScale(1.04);
      button.setY(button.baseY - 1);
    });

  return button;
}

function addSceneTitle(scene, title, subtitle = "") {
  scene.add
    .text(GAME_WIDTH / 2, 36, title, {
      fontFamily: FONTS.title,
      fontSize: "28px",
      color: COLORS.gold,
      stroke: "#2c170b",
      strokeThickness: 6
    })
    .setOrigin(0.5)
    .setDepth(30);

  if (subtitle) {
    scene.add
      .text(GAME_WIDTH / 2, 62, subtitle, {
        ...LABEL_STYLE,
        fontSize: "12px"
      })
      .setOrigin(0.5)
      .setDepth(30);
  }
}

function addCrtOverlay(scene) {
  const graphics = scene.add.graphics().setDepth(35);

  graphics.fillStyle(0x120a05, 0.1);

  for (let y = 0; y < GAME_HEIGHT; y += 4) {
    graphics.fillRect(0, y, GAME_WIDTH, 1);
  }

  graphics.fillStyle(0x050302, 0.16);
  graphics.fillRect(0, 0, GAME_WIDTH, 8);
  graphics.fillRect(0, GAME_HEIGHT - 8, GAME_WIDTH, 8);
  graphics.fillRect(0, 0, 8, GAME_HEIGHT);
  graphics.fillRect(GAME_WIDTH - 8, 0, 8, GAME_HEIGHT);

  return graphics;
}

function preloadImageIfNeeded(scene, key, url) {
  if (!scene.textures.exists(key)) {
    scene.load.image(key, url);
  }
}

function addScaledBackgroundImage(scene, textureKey, fallbackDrawer) {
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

function addMenuBackground(scene) {
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

function addLevelSelectBackground(scene) {
  addScaledBackgroundImage(scene, LEVEL_SELECT_BACKGROUND_KEY, drawPyramidInterior);

  scene.add
    .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x120d07, 0.12)
    .setDepth(-7);
}

function drawDashedLine(scene, startX, startY, endX, endY, color, alpha = 1) {
  const graphics = scene.add.graphics();
  const dashLength = 10;
  const gapLength = 6;
  const distance = Phaser.Math.Distance.Between(startX, startY, endX, endY);

  graphics.lineStyle(2, color, alpha);

  for (let progress = 0; progress < distance; progress += dashLength + gapLength) {
    const startT = progress / distance;
    const endT = Math.min(progress + dashLength, distance) / distance;
    const dashStartX = Phaser.Math.Linear(startX, endX, startT);
    const dashStartY = Phaser.Math.Linear(startY, endY, startT);
    const dashEndX = Phaser.Math.Linear(startX, endX, endT);
    const dashEndY = Phaser.Math.Linear(startY, endY, endT);

    graphics.lineBetween(dashStartX, dashStartY, dashEndX, dashEndY);
  }

  return graphics;
}

function drawLevelSelectExit(scene) {
  const graphics = scene.add.graphics();
  const exitOuterRadius = 18;
  const exitInnerRadius = 10;
  const shaftX = EXIT_POINT.x;
  const shaftY = EXIT_POINT.y;

  graphics.fillStyle(COLORS.wallDark, 0.96);
  graphics.fillCircle(shaftX, shaftY, exitOuterRadius);
  graphics.fillStyle(COLORS.waterDeep, 1);
  graphics.fillCircle(shaftX, shaftY, exitInnerRadius);
  graphics.lineStyle(2, COLORS.gold, 1);
  graphics.strokeCircle(shaftX, shaftY, exitOuterRadius);
  graphics.lineStyle(1, 0xfff4c7, 0.7);
  graphics.strokeCircle(shaftX, shaftY, exitInnerRadius + 4);

  scene.add
    .text(shaftX, shaftY - 28, "EXIT SHAFT", {
      fontFamily: FONTS.ui,
      fontSize: "11px",
      color: COLORS.white
    })
    .setOrigin(0.5)
    .setDepth(12);
}

function createLockIcon(scene) {
  const lock = scene.add.graphics();

  lock.lineStyle(2, 0xd8c39b, 1);
  lock.strokeRoundedRect(-5, -1, 10, 8, 2);
  lock.beginPath();
  lock.moveTo(-3, -1);
  lock.lineTo(-3, -5);
  lock.lineTo(3, -5);
  lock.lineTo(3, -1);
  lock.strokePath();

  return lock;
}

function createLevelNode(scene, x, y, levelIndex, unlocked, onSelect) {
  const node = scene.add.container(x, y);
  const outerColor = unlocked ? COLORS.gold : COLORS.locked;
  const innerColor = unlocked ? COLORS.sandLight : COLORS.stone;
  const outerRing = scene.add.circle(0, 0, 16, outerColor);
  const innerDot = scene.add.circle(0, 0, 8, innerColor);

  outerRing.setStrokeStyle(2, unlocked ? 0xfff8de : 0x87694d);

  node.add([outerRing, innerDot]);

  if (unlocked) {
    const label = scene.add
      .text(0, 0, String(levelIndex + 1), {
        fontFamily: FONTS.ui,
        fontSize: "12px",
        color: "#2c170b"
      })
      .setOrigin(0.5);

    node.add(label);
  } else {
    node.add(createLockIcon(scene));
  }

  if (unlocked) {
    node.setSize(32, 32);
    node.setInteractive(new Phaser.Geom.Circle(0, 0, 16), Phaser.Geom.Circle.Contains);

    node
      .on("pointerover", () => {
        node.setScale(1.08);
      })
      .on("pointerout", () => {
        node.setScale(1);
      })
      .on("pointerdown", () => {
        onSelect(levelIndex);
      });
  }

  return node;
}

class MainMenuScene extends Phaser.Scene {
  constructor() {
    super("MainMenuScene");
  }

  preload() {
    preloadImageIfNeeded(this, MAIN_MENU_BACKGROUND_KEY, MAIN_MENU_BACKGROUND_URL);
  }

  create() {
    ensureProgress(this);
    addMenuBackground(this);
    createPanel(this, 118, 78, 244, 150);

    addSceneTitle(this, "Crab Out of Nile", "Tiny jam build");

    this.add
      .text(
        GAME_WIDTH / 2,
        110,
        "A crab escaped the tomb.\nNow it wants the Nile.",
        {
          ...LABEL_STYLE,
          align: "center"
        }
      )
      .setOrigin(0.5);

    createTextButton(this, GAME_WIDTH / 2, 160, "Play", () => {
      this.scene.start("LevelSelectScene");
    });

    createTextButton(this, GAME_WIDTH / 2, 204, "Settings", () => {
      this.scene.start("SettingsScene");
    });

    addCrtOverlay(this);
  }
}

class SettingsScene extends Phaser.Scene {
  constructor() {
    super("SettingsScene");
  }

  create() {
    drawSky(this);
    drawDesert(this);
    createPanel(this, 110, 46, 260, 176);
    addSceneTitle(this, "Settings");

    this.musicText = this.add
      .text(140, 100, "", LABEL_STYLE)
      .setOrigin(0, 0.5);

    this.soundText = this.add
      .text(140, 140, "", LABEL_STYLE)
      .setOrigin(0, 0.5);

    this.refreshLabels();

    createTextButton(
      this,
      303,
      100,
      "Toggle",
      () => {
        sharedState.musicOn = !sharedState.musicOn;
        this.refreshLabels();
      },
      100
    );

    createTextButton(
      this,
      303,
      140,
      "Toggle",
      () => {
        sharedState.soundOn = !sharedState.soundOn;
        this.refreshLabels();
      },
      100
    );

    createTextButton(this, GAME_WIDTH / 2, 184, "Quit", () => {
      this.scene.start("MainMenuScene");
    }, 110);

    createTextButton(this, GAME_WIDTH / 2, 222, "Back", () => {
      this.scene.start("MainMenuScene");
    }, 110);

    addCrtOverlay(this);
  }

  refreshLabels() {
    this.musicText.setText(`Music: ${sharedState.musicOn ? "On" : "Off"}`);
    this.soundText.setText(
      `Crab scuttle sound: ${sharedState.soundOn ? "On" : "Off"}`
    );
  }
}

class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super("LevelSelectScene");
  }

  preload() {
    preloadImageIfNeeded(
      this,
      LEVEL_SELECT_BACKGROUND_KEY,
      LEVEL_SELECT_BACKGROUND_URL
    );
  }

  create() {
    const highestUnlockedLevel = getHighestUnlockedLevel(this);
    const clearBannerText = this.registry.get("clearBannerText");

    addLevelSelectBackground(this);
    drawLevelSelectExit(this);
    addSceneTitle(this, "Level Select", "Choose an unlocked chamber");

    this.add
      .text(76, 22, `Unlocked: ${highestUnlockedLevel}/${TOTAL_LEVELS}`, {
        fontFamily: FONTS.ui,
        fontSize: "12px",
        color: COLORS.white
      })
      .setOrigin(0.5);

    const pathPoints = [...LEVEL_ROUTE_POINTS, EXIT_POINT];

    for (let index = 0; index < pathPoints.length - 1; index += 1) {
      const start = pathPoints[index];
      const end = pathPoints[index + 1];

      drawDashedLine(this, start.x, start.y, end.x, end.y, COLORS.wallDark, 0.42);
    }

    const activeSegmentCount =
      LEVEL_ROUTE_ACTIVE_SEGMENT_COUNTS[
        Phaser.Math.Clamp(highestUnlockedLevel - 1, 0, LEVEL_ROUTE_ACTIVE_SEGMENT_COUNTS.length - 1)
      ];

    for (let index = 0; index < activeSegmentCount; index += 1) {
      const start = pathPoints[index];
      const end = pathPoints[index + 1];

      drawDashedLine(this, start.x, start.y, end.x, end.y, COLORS.gold, 0.95);
    }

    LEVEL_NODE_POSITIONS.forEach((nodePosition, levelIndex) => {
      createLevelNode(
        this,
        nodePosition.x,
        nodePosition.y,
        levelIndex,
        isLevelUnlocked(this, levelIndex),
        (selectedLevelIndex) => {
          selectLevel(this, selectedLevelIndex);
          this.scene.start("ReportScene");
        }
      );

      this.add
        .text(nodePosition.x, nodePosition.y + 24, `L${levelIndex + 1}`, {
          fontFamily: FONTS.ui,
          fontSize: "11px",
          color: isLevelUnlocked(this, levelIndex) ? COLORS.white : "#b59a7b"
        })
        .setOrigin(0.5);
    });

    createPanel(this, 44, 218, 288, 32);

    this.add
      .text(
        188,
        234,
        clearBannerText || "Gold chambers can be replayed. Dark seals stay locked.",
        {
          fontFamily: FONTS.ui,
          fontSize: "11px",
          color: clearBannerText ? COLORS.gold : COLORS.white
        }
      )
      .setOrigin(0.5);

    this.registry.set("clearBannerText", "");

    createTextButton(this, 404, 234, "Main Menu", () => {
      this.scene.start("MainMenuScene");
    }, 120);

    addCrtOverlay(this);
  }
}

class ReportScene extends Phaser.Scene {
  constructor() {
    super("ReportScene");
  }

  create() {
    const levelIndex = getSelectedLevelIndex(this);
    const level = getCurrentLevel(this);

    drawReportParchment(this);

    this.add
      .text(GAME_WIDTH / 2, 30, "Chamber Record", {
        fontFamily: FONTS.title,
        fontSize: "24px",
        color: "#6a3f18",
        stroke: "#f7e2b4",
        strokeThickness: 3
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 52, `Level ${levelIndex + 1}: ${level.name}`, {
        fontFamily: FONTS.title,
        fontSize: "14px",
        color: "#6a3f18"
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 118, level.report, {
        fontFamily: FONTS.title,
        fontSize: "16px",
        color: "#3e2713",
        align: "center",
        wordWrap: { width: 270 },
        lineSpacing: 6
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 196, "Press Space or click below to enter the chamber.", {
        fontFamily: FONTS.ui,
        fontSize: "11px",
        color: "#5d4127"
      })
      .setOrigin(0.5);

    let hasEnteredChamber = false;

    const enterChamber = () => {
      if (hasEnteredChamber) {
        return;
      }

      hasEnteredChamber = true;
      this.scene.start("GameScene");
    };

    const handleSpaceKey = () => {
      enterChamber();
    };

    this.input.keyboard.on("keydown-SPACE", handleSpaceKey);
    this.events.once("shutdown", () => {
      this.input.keyboard.off("keydown-SPACE", handleSpaceKey);
    });

    createTextButton(this, 170, 228, "Back", () => {
      this.scene.start("LevelSelectScene");
    }, 100);

    createTextButton(this, 310, 228, "Enter Chamber", () => {
      enterChamber();
    }, 160);

    addCrtOverlay(this);
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  create() {
    this.currentLevelIndex = getSelectedLevelIndex(this);
    this.currentLevel = getCurrentLevel(this);
    this.levelState = "playing";
    this.maxWetness = 100;
    this.wetness = this.maxWetness;
    this.lowWetnessThreshold = 24;
    this.dryRate = 2.6;
    this.scuttleFrameDuration = 110;
    this.facingDirection = 1;
    this.blades = [];
    this.crushers = [];

    this.cameras.main.setBackgroundColor("#120d07");
    drawPyramidInterior(this);
    this.levelLayout = this.drawLevel(this.currentLevel);
    addSceneTitle(this, `Level ${this.currentLevelIndex + 1}`, this.currentLevel.name);

    this.ensureCrabTextures();

    this.player = this.physics.add.sprite(
      this.currentLevel.startX,
      this.currentLevel.startY,
      "crab-idle"
    );
    this.player
      .setOrigin(0.5, 1)
      .setCollideWorldBounds(true)
      .setBounce(0)
      .setDragX(1200)
      .setMaxVelocity(120, 380)
      .setDepth(8);
    this.player.body.setSize(18, 12);
    this.player.body.setOffset(9, 24);

    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.createCollisionWorld(this.levelLayout.solids);

    this.goalZone = this.add.zone(
      this.currentLevel.goal.x + this.currentLevel.goal.width / 2,
      this.currentLevel.goal.y + this.currentLevel.goal.height / 2,
      this.currentLevel.goal.width,
      this.currentLevel.goal.height
    );
    this.physics.add.existing(this.goalZone, true);
    this.physics.add.overlap(this.player, this.goalZone, () => {
      this.handleGoalReached();
    });

    this.createWetnessHud();
    this.updateBlades(this.time.now);
    this.updateCrushers(this.time.now);

    this.add.text(10, GAME_HEIGHT - 18, "A / D or arrows to scuttle, W / Up / Space to jump", {
      ...LABEL_STYLE,
      fontSize: "12px"
    }).setDepth(20);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys("W,A,S,D,SPACE");

    addCrtOverlay(this);
  }

  ensureCrabTextures() {
    const textureKeys = ["crab-idle", "crab-scuttle-a", "crab-scuttle-b", "crab-jump"];

    if (textureKeys.every((key) => this.textures.exists(key))) {
      return;
    }

    this.generateCrabTexture("crab-idle", "idle");
    this.generateCrabTexture("crab-scuttle-a", "scuttleA");
    this.generateCrabTexture("crab-scuttle-b", "scuttleB");
    this.generateCrabTexture("crab-jump", "jump");
  }

  generateCrabTexture(textureKey, pose) {
    const textureSize = 36;
    const pixel = 2;
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    const outline = 0x7e2715;
    const shell = COLORS.crab;
    const highlight = 0xf3a08a;
    const shadow = 0xb6452d;
    const eyeWhite = 0xfff8de;
    const pupil = 0x24150c;
    const drawPixel = (x, y, width, height, color) => {
      graphics.fillStyle(color, 1);
      graphics.fillRect(x * pixel, y * pixel, width * pixel, height * pixel);
    };

    const leftLegs =
      pose === "scuttleA"
        ? [
            { x: 2, y: 11, width: 3, height: 1 },
            { x: 1, y: 13, width: 4, height: 1 }
          ]
        : pose === "scuttleB"
          ? [
              { x: 1, y: 10, width: 4, height: 1 },
              { x: 2, y: 13, width: 3, height: 1 }
            ]
          : pose === "jump"
            ? [{ x: 4, y: 12, width: 2, height: 1 }]
            : [
                { x: 2, y: 11, width: 3, height: 1 },
                { x: 2, y: 13, width: 3, height: 1 }
              ];
    const rightLegs =
      pose === "scuttleA"
        ? [
            { x: 13, y: 10, width: 4, height: 1 },
            { x: 13, y: 13, width: 3, height: 1 }
          ]
        : pose === "scuttleB"
          ? [
              { x: 13, y: 11, width: 3, height: 1 },
              { x: 12, y: 13, width: 4, height: 1 }
            ]
          : pose === "jump"
            ? [{ x: 12, y: 12, width: 2, height: 1 }]
            : [
                { x: 13, y: 11, width: 3, height: 1 },
                { x: 13, y: 13, width: 3, height: 1 }
              ];
    const claws =
      pose === "jump"
        ? [
            { x: 2, y: 5, width: 2, height: 2 },
            { x: 14, y: 5, width: 2, height: 2 }
          ]
        : pose === "scuttleA"
          ? [
              { x: 1, y: 7, width: 2, height: 2 },
              { x: 14, y: 5, width: 2, height: 2 }
            ]
          : pose === "scuttleB"
            ? [
                { x: 2, y: 5, width: 2, height: 2 },
                { x: 15, y: 7, width: 2, height: 2 }
              ]
            : [
                { x: 2, y: 6, width: 2, height: 2 },
                { x: 14, y: 6, width: 2, height: 2 }
              ];

    [...leftLegs, ...rightLegs].forEach((leg) => {
      drawPixel(leg.x, leg.y, leg.width, leg.height, outline);
    });
    claws.forEach((claw) => {
      drawPixel(claw.x, claw.y, claw.width, claw.height, outline);
    });

    drawPixel(4, 6, 10, 1, outline);
    drawPixel(3, 7, 12, 4, outline);
    drawPixel(4, 11, 10, 1, outline);
    drawPixel(5, 5, 8, 1, outline);

    drawPixel(5, 6, 8, 1, shell);
    drawPixel(4, 7, 10, 3, shell);
    drawPixel(5, 10, 8, 1, shell);
    drawPixel(6, 5, 6, 1, shell);

    drawPixel(6, 6, 5, 1, highlight);
    drawPixel(5, 8, 2, 1, shadow);
    drawPixel(11, 8, 2, 1, shadow);
    drawPixel(7, 11, 1, 1, shadow);
    drawPixel(10, 11, 1, 1, shadow);

    drawPixel(6, 4, 1, 2, outline);
    drawPixel(10, 4, 1, 2, outline);
    drawPixel(6, 3, 2, 1, eyeWhite);
    drawPixel(10, 3, 2, 1, eyeWhite);
    drawPixel(7, 3, 1, 1, pupil);
    drawPixel(10, 3, 1, 1, pupil);

    if (pose !== "jump") {
      drawPixel(7, 12, 1, 1, outline);
      drawPixel(10, 12, 1, 1, outline);
    }

    graphics.generateTexture(textureKey, textureSize, textureSize);
    graphics.destroy();
  }

  drawLevel(level) {
    const graphics = this.add.graphics().setDepth(2);

    graphics.fillStyle(COLORS.wallDark, 0.18);

    for (let panelIndex = 0; panelIndex < 5; panelIndex += 1) {
      const panelX = 34 + panelIndex * 88;

      graphics.fillRoundedRect(panelX, 78, 56, 100, 8);
    }

    graphics.lineStyle(2, COLORS.wallLight, 0.24);

    for (let y = 90; y <= 198; y += 36) {
      graphics.lineBetween(26, y, 454, y);
    }

    this.drawGoalArt(graphics, level.goal);

    (level.lavaPools || []).forEach((pool) => {
      this.drawLavaPool(graphics, pool);
    });

    level.solids.forEach((solid) => {
      this.drawSolidRect(graphics, solid);
    });

    (level.spikes || []).forEach((spikeStrip) => {
      this.drawSpikeStrip(graphics, spikeStrip);
    });

    (level.blades || []).forEach((blade) => {
      this.createBlade(blade);
    });

    (level.crushers || []).forEach((crusher) => {
      this.createCrusher(crusher);
    });

    this.add
      .text(46, 120, "START", {
        fontFamily: FONTS.ui,
        fontSize: "10px",
        color: "#d8c39b"
      })
      .setDepth(10);

    return level;
  }

  drawGoalArt(graphics, goal) {
    if (goal.kind === "river") {
      graphics.fillStyle(COLORS.waterDeep, 1);
      graphics.fillRoundedRect(goal.x, goal.y, goal.width, goal.height, 10);
      graphics.fillStyle(COLORS.water, 1);
      graphics.fillRoundedRect(goal.x + 6, goal.y + 6, goal.width - 12, goal.height - 12, 8);
      graphics.lineStyle(2, COLORS.gold, 0.95);
      graphics.strokeRoundedRect(goal.x - 4, goal.y - 4, goal.width + 8, goal.height + 8, 12);

      this.add
        .text(goal.x + goal.width / 2, goal.y + 12, goal.label, {
          fontFamily: FONTS.ui,
          fontSize: "11px",
          color: COLORS.white
        })
        .setOrigin(0.5, 0)
        .setDepth(10);

      return;
    }

    graphics.fillStyle(COLORS.stone, 1);
    graphics.fillRect(goal.x - 14, goal.y - 18, 14, goal.height + 52);
    graphics.fillRect(goal.x + goal.width, goal.y - 18, 14, goal.height + 52);
    graphics.fillRect(goal.x - 14, goal.y - 18, goal.width + 28, 18);
    graphics.fillStyle(COLORS.skyTop, 1);
    graphics.fillRoundedRect(goal.x, goal.y, goal.width, goal.height, 8);
    graphics.fillStyle(COLORS.waterDeep, 1);
    graphics.fillRect(goal.x, goal.y + goal.height - 26, goal.width, 26);
    graphics.fillStyle(COLORS.water, 1);
    graphics.fillRect(goal.x + 4, goal.y + goal.height - 24, goal.width - 8, 20);
    graphics.fillStyle(0x8d6c46, 1);
    graphics.fillRect(goal.x - 22, goal.y + 40, 10, 62);
    graphics.lineStyle(2, COLORS.bronzeDark, 1);
    graphics.strokeRect(goal.x - 22, goal.y + 40, 10, 62);

    this.add
      .text(goal.x + goal.width / 2, goal.y - 12, goal.label, {
        fontFamily: FONTS.ui,
        fontSize: "11px",
        color: COLORS.gold
      })
      .setOrigin(0.5)
      .setDepth(10);
  }

  drawSolidRect(graphics, rect) {
    if (rect.style === "warmSand") {
      graphics.fillStyle(COLORS.sandDark, 1);
      graphics.fillRect(rect.x, rect.y + rect.height - 4, rect.width, 4);
      graphics.fillStyle(COLORS.sandMid, 1);
      graphics.fillRect(rect.x, rect.y, rect.width, rect.height - 4);
      graphics.fillStyle(COLORS.sandLight, 0.8);

      for (let offset = 8; offset < rect.width - 4; offset += 18) {
        graphics.fillEllipse(rect.x + offset, rect.y + 6 + (offset % 24) / 8, 10, 4);
      }

      graphics.lineStyle(2, COLORS.bronzeDark, 0.45);
      graphics.strokeRect(rect.x, rect.y, rect.width, rect.height);

      return;
    }

    graphics.fillStyle(COLORS.stone, 1);
    graphics.fillRect(rect.x, rect.y, rect.width, rect.height);
    graphics.fillStyle(COLORS.wallLight, 0.16);
    graphics.fillRect(rect.x + 3, rect.y + 3, rect.width - 6, Math.max(4, rect.height / 2));
    graphics.lineStyle(2, COLORS.wallDark, 0.6);
    graphics.strokeRect(rect.x, rect.y, rect.width, rect.height);

    if (rect.style === "pillar") {
      graphics.lineStyle(1, COLORS.wallLight, 0.35);
      graphics.lineBetween(rect.x + rect.width / 2, rect.y + 6, rect.x + rect.width / 2, rect.y + rect.height - 6);
      return;
    }

    if (rect.style === "safe") {
      graphics.fillStyle(COLORS.bronzeDark, 0.85);
      graphics.fillRect(rect.x + 6, rect.y + 2, rect.width - 12, 4);
      graphics.fillStyle(COLORS.bronze, 1);

      for (let socketX = rect.x + 10; socketX < rect.x + rect.width - 8; socketX += 16) {
        graphics.fillRect(socketX, rect.y - 2, 8, 4);
      }
    }
  }

  drawSpikeStrip(graphics, spikeStrip) {
    const spikeHeight = 14;

    graphics.fillStyle(COLORS.bronzeDark, 1);
    graphics.fillRect(spikeStrip.x, spikeStrip.y - 4, spikeStrip.width, 4);

    for (let spikeX = spikeStrip.x; spikeX < spikeStrip.x + spikeStrip.width; spikeX += 12) {
      graphics.fillStyle(COLORS.bronze, 1);
      graphics.fillTriangle(
        spikeX,
        spikeStrip.y - 4,
        spikeX + 6,
        spikeStrip.y - spikeHeight,
        spikeX + 12,
        spikeStrip.y - 4
      );
      graphics.lineStyle(1, COLORS.bronzeDark, 0.65);
      graphics.strokeTriangle(
        spikeX,
        spikeStrip.y - 4,
        spikeX + 6,
        spikeStrip.y - spikeHeight,
        spikeX + 12,
        spikeStrip.y - 4
      );
    }
  }

  drawLavaPool(graphics, pool) {
    graphics.fillStyle(COLORS.wallDark, 1);
    graphics.fillRect(pool.x - 4, pool.y, pool.width + 8, pool.height);
    graphics.fillStyle(COLORS.lava, 1);
    graphics.fillRect(pool.x, pool.y, pool.width, pool.height);
    graphics.fillStyle(COLORS.lavaBright, 1);

    for (let bubbleX = pool.x + 8; bubbleX < pool.x + pool.width - 4; bubbleX += 16) {
      graphics.fillEllipse(
        bubbleX,
        pool.y + 8 + ((bubbleX - pool.x) % 12),
        10,
        4
      );
      graphics.fillEllipse(
        bubbleX + 4,
        pool.y + 22 + ((bubbleX - pool.x) % 10),
        8,
        3
      );
    }
  }

  createBlade(bladeConfig) {
    const blade = this.add.graphics().setDepth(7);
    const bladeColor = bladeConfig.broken ? 0x8e7865 : COLORS.metal;
    const outline = bladeConfig.broken ? 0x5b4534 : COLORS.metalDark;

    blade.fillStyle(bladeColor, 1);
    blade.fillCircle(0, 0, bladeConfig.radius);
    blade.fillStyle(outline, 1);
    blade.fillCircle(0, 0, 3);
    blade.lineStyle(2, outline, 1);

    for (let spoke = 0; spoke < 4; spoke += 1) {
      const angle = spoke * (Math.PI / 2);
      blade.lineBetween(
        Math.cos(angle) * 4,
        Math.sin(angle) * 4,
        Math.cos(angle) * (bladeConfig.radius + 2),
        Math.sin(angle) * (bladeConfig.radius + 2)
      );
    }

    if (bladeConfig.broken) {
      blade.lineStyle(2, COLORS.danger, 1);
      blade.lineBetween(-bladeConfig.radius + 2, -2, bladeConfig.radius - 2, 4);
    }

    this.blades.push({
      ...bladeConfig,
      display: blade,
      currentX: bladeConfig.x1,
      currentY: bladeConfig.y1,
      angleOffset: bladeConfig.angle || 0
    });
  }

  createCrusher(crusherConfig) {
    const frame = this.add.graphics().setDepth(5);

    frame.fillStyle(COLORS.wallDark, 1);
    frame.fillRect(crusherConfig.x - crusherConfig.width / 2 - 6, crusherConfig.topY - 8, 6, crusherConfig.drop + crusherConfig.height + 12);
    frame.fillRect(crusherConfig.x + crusherConfig.width / 2, crusherConfig.topY - 8, 6, crusherConfig.drop + crusherConfig.height + 12);
    frame.fillRect(crusherConfig.x - crusherConfig.width / 2 - 6, crusherConfig.topY - 8, crusherConfig.width + 12, 8);

    const head = this.add
      .rectangle(
        crusherConfig.x,
        crusherConfig.topY + crusherConfig.height / 2,
        crusherConfig.width,
        crusherConfig.height,
        COLORS.stone
      )
      .setStrokeStyle(2, COLORS.wallDark)
      .setDepth(8);
    const warning = this.add
      .rectangle(crusherConfig.x, 228, crusherConfig.width - 10, 4, COLORS.danger, crusherConfig.fake ? 0.12 : 0.28)
      .setDepth(6);

    this.crushers.push({
      ...crusherConfig,
      frame,
      head,
      warning,
      active: false,
      hitRect: new Phaser.Geom.Rectangle(
        crusherConfig.x - crusherConfig.width / 2,
        crusherConfig.topY,
        crusherConfig.width,
        crusherConfig.height
      )
    });
  }

  createCollisionWorld(solids) {
    solids.forEach((solid) => {
      this.createSolidBody(solid.x, solid.y, solid.width, solid.height);
    });
  }

  createSolidBody(x, y, width, height) {
    const solid = this.add.zone(x + width / 2, y + height / 2, width, height);
    this.physics.add.existing(solid, true);
    this.physics.add.collider(this.player, solid);

    return solid;
  }

  createWetnessHud() {
    this.wetnessFrame = this.add.graphics().setDepth(20);
    this.wetnessFill = this.add.graphics().setDepth(21);

    this.add
      .text(12, 14, "WETNESS", {
        fontFamily: FONTS.ui,
        fontSize: "11px",
        color: COLORS.white
      })
      .setDepth(22);

    this.lowWetnessWarning = this.add
      .text(GAME_WIDTH - 12, 14, "Crab is drying out!", {
        fontFamily: FONTS.ui,
        fontSize: "11px",
        color: "#ffd27a"
      })
      .setOrigin(1, 0)
      .setDepth(22)
      .setVisible(false);

    this.updateWetnessHud();
  }

  updateWetnessHud() {
    const ratio = Phaser.Math.Clamp(this.wetness / this.maxWetness, 0, 1);
    const barX = 78;
    const barY = 12;
    const barWidth = 124;
    const barHeight = 16;
    let fillColor = 0x5bc0eb;

    if (ratio <= 0.24) {
      fillColor = 0xff8d58;
    } else if (ratio <= 0.5) {
      fillColor = COLORS.gold;
    }

    this.wetnessFrame.clear();
    this.wetnessFrame.fillStyle(0x2c170b, 0.85);
    this.wetnessFrame.fillRoundedRect(barX, barY, barWidth, barHeight, 6);
    this.wetnessFrame.lineStyle(2, COLORS.gold, 1);
    this.wetnessFrame.strokeRoundedRect(barX, barY, barWidth, barHeight, 6);

    this.wetnessFill.clear();

    if (ratio > 0) {
      this.wetnessFill.fillStyle(fillColor, 1);
      this.wetnessFill.fillRect(barX + 4, barY + 4, Math.floor((barWidth - 8) * ratio), barHeight - 8);
    }

    const warningVisible = this.levelState === "playing" && this.wetness <= this.lowWetnessThreshold;

    this.lowWetnessWarning.setVisible(
      warningVisible ||
        this.levelState === "dry" ||
        this.levelState === "dead"
    );

    if (warningVisible) {
      this.lowWetnessWarning.setAlpha(0.45 + Math.abs(Math.sin(this.time.now / 140)) * 0.55);
      this.lowWetnessWarning.setColor("#ffd27a");
      this.lowWetnessWarning.setText("Crab is drying out!");
    }
  }

  showLevelCompleteEffect() {
    const goalCenterX = this.currentLevel.goal.x + this.currentLevel.goal.width / 2;
    const goalCenterY = this.currentLevel.goal.y + this.currentLevel.goal.height / 2;
    const clearText = this.add
      .text(GAME_WIDTH / 2, 88, "CHAMBER CLEAR", {
        fontFamily: FONTS.ui,
        fontSize: "18px",
        color: COLORS.gold,
        stroke: "#2c170b",
        strokeThickness: 5
      })
      .setOrigin(0.5)
      .setDepth(45);

    this.cameras.main.flash(220, 255, 237, 188);

    for (let sparkIndex = 0; sparkIndex < 8; sparkIndex += 1) {
      const spark = this.add
        .rectangle(goalCenterX, goalCenterY, 4, 4, sparkIndex % 2 === 0 ? 0xfff3bf : 0x8de6ff)
        .setDepth(44);
      const sparkAngle = (Math.PI * 2 * sparkIndex) / 8;
      const travelDistance = 22 + sparkIndex * 2;

      this.tweens.add({
        targets: spark,
        x: goalCenterX + Math.cos(sparkAngle) * travelDistance,
        y: goalCenterY + Math.sin(sparkAngle) * travelDistance,
        alpha: 0,
        scaleX: 0.2,
        scaleY: 0.2,
        duration: 340,
        ease: "Quad.Out",
        onComplete: () => {
          spark.destroy();
        }
      });
    }

    this.tweens.add({
      targets: clearText,
      y: 74,
      alpha: 0,
      duration: 520,
      delay: 140,
      ease: "Quad.Out",
      onComplete: () => {
        clearText.destroy();
      }
    });

    this.tweens.add({
      targets: this.player,
      angle: 0,
      y: this.player.y - 10,
      duration: 160,
      yoyo: true,
      ease: "Sine.Out"
    });
  }

  handleGoalReached() {
    if (this.levelState !== "playing") {
      return;
    }

    this.levelState = "won";
    this.physics.world.pause();
    this.player.setVelocity(0, 0);
    this.player.setTint(0xfff2c4);
    playSoundCue(this, "clear");
    this.showLevelCompleteEffect();

    const unlockStatus = unlockNextLevel(this, this.currentLevelIndex);
    let clearBannerText = `Level ${this.currentLevelIndex + 1} clear.`;

    if (unlockStatus.didUnlockNewLevel) {
      clearBannerText += ` Level ${unlockStatus.newlyUnlockedLevel} unlocked.`;
    } else if (this.currentLevelIndex === TOTAL_LEVELS - 1) {
      clearBannerText = "Final chamber clear. All chambers open.";
    } else {
      clearBannerText += " Replay unlocked.";
    }

    this.registry.set("clearBannerText", clearBannerText);

    this.time.delayedCall(720, () => {
      if (this.currentLevelIndex === TOTAL_LEVELS - 1) {
        this.scene.start("WinScene");
        return;
      }

      this.scene.start("LevelSelectScene");
    });
  }

  handleHazardDeath(message) {
    if (this.levelState !== "playing") {
      return;
    }

    this.levelState = "dead";
    this.cameras.main.shake(180, 0.006);
    this.physics.world.pause();
    this.player.setVelocity(0, 0);
    this.player.setTint(0xffd27a);
    this.player.setTexture("crab-jump");
    playSoundCue(this, "death");
    this.lowWetnessWarning
      .setVisible(true)
      .setAlpha(1)
      .setColor("#ff9f7a")
      .setText(message);
    this.updateWetnessHud();

    this.time.delayedCall(700, () => {
      this.scene.restart();
    });
  }

  handleDryOut() {
    if (this.levelState !== "playing") {
      return;
    }

    this.levelState = "dry";
    this.cameras.main.shake(160, 0.005);
    this.physics.world.pause();
    this.player.setVelocity(0, 0);
    this.player.setTint(0xf2b661);
    playSoundCue(this, "dry");
    this.lowWetnessWarning
      .setVisible(true)
      .setAlpha(1)
      .setColor("#ff9f7a")
      .setText("Too dry! Restarting...");
    this.updateWetnessHud();

    this.time.delayedCall(700, () => {
      this.scene.restart();
    });
  }

  updatePlayerMovement() {
    const moveLeft = this.cursors.left.isDown || this.keys.A.isDown;
    const moveRight = this.cursors.right.isDown || this.keys.D.isDown;
    const jumpPressed =
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.keys.W) ||
      Phaser.Input.Keyboard.JustDown(this.keys.SPACE);
    const onGround = this.player.body.blocked.down || this.player.body.touching.down;

    if (moveLeft === moveRight) {
      this.player.setVelocityX(0);
    } else if (moveLeft) {
      this.player.setVelocityX(-110);
      this.facingDirection = -1;
    } else {
      this.player.setVelocityX(110);
      this.facingDirection = 1;
    }

    if (jumpPressed && onGround) {
      this.player.setVelocityY(-320);
      playSoundCue(this, "jump");
    }

    this.player.setFlipX(this.facingDirection < 0);
  }

  updatePlayerAnimation(time) {
    const onGround = this.player.body.blocked.down || this.player.body.touching.down;
    const horizontalSpeed = Math.abs(this.player.body.velocity.x);
    let nextTexture = "crab-idle";

    if (!onGround) {
      nextTexture = "crab-jump";
      this.player.setAngle(this.player.body.velocity.y < 0 ? -5 : 5);
    } else if (horizontalSpeed > 5) {
      nextTexture =
        Math.floor(time / this.scuttleFrameDuration) % 2 === 0
          ? "crab-scuttle-a"
          : "crab-scuttle-b";
      this.player.setAngle(Math.sin(time / 90) * 2);
    } else {
      this.player.setAngle(0);
    }

    if (this.player.texture.key !== nextTexture) {
      this.player.setTexture(nextTexture);
    }
  }

  updateBlades(time) {
    this.blades.forEach((blade) => {
      let travel = 0.5;

      if (!blade.broken) {
        travel =
          0.5 +
          0.5 *
            Math.sin(((time + blade.phase) / blade.duration) * Math.PI * 2);
      }

      blade.currentX = Phaser.Math.Linear(blade.x1, blade.x2, travel);
      blade.currentY = Phaser.Math.Linear(blade.y1, blade.y2, travel);
      blade.display.setPosition(blade.currentX, blade.currentY);
      blade.display.setAngle(
        blade.broken
          ? blade.angleOffset + Math.sin(time / 180) * 4
          : blade.angleOffset + time / 4
      );
    });
  }

  getCrusherDropProgress(cycle) {
    if (cycle < 0.16) {
      return Phaser.Math.Easing.Cubic.Out(cycle / 0.16);
    }

    if (cycle < 0.32) {
      return 1;
    }

    if (cycle < 0.58) {
      return 1 - Phaser.Math.Easing.Cubic.InOut((cycle - 0.32) / 0.26);
    }

    return 0;
  }

  updateCrushers(time) {
    this.crushers.forEach((crusher) => {
      if (crusher.fake) {
        const fakeY =
          crusher.topY + crusher.height / 2 + Math.sin(time / 220) * 1.5;

        crusher.head.setY(fakeY);
        crusher.warning.setAlpha(0.12);
        crusher.active = false;
        crusher.hitRect.setTo(
          crusher.x - crusher.width / 2,
          fakeY - crusher.height / 2,
          crusher.width,
          crusher.height
        );
        return;
      }

      const cycle = ((time + crusher.phase) % crusher.period) / crusher.period;
      const progress = this.getCrusherDropProgress(cycle);
      const headY = crusher.topY + crusher.height / 2 + crusher.drop * progress;

      crusher.head.setY(headY);
      crusher.warning.setAlpha(0.18 + progress * 0.68);
      crusher.active = progress > 0.72;
      crusher.hitRect.setTo(
        crusher.x - crusher.width / 2 + 3,
        headY - crusher.height / 2,
        crusher.width - 6,
        crusher.height + 8
      );
    });
  }

  getPlayerHitbox() {
    const { x, y, width, height } = this.player.body;

    return new Phaser.Geom.Rectangle(x + 2, y + 2, width - 4, height - 2);
  }

  circleIntersectsRect(circleX, circleY, radius, rect) {
    const closestX = Phaser.Math.Clamp(circleX, rect.x, rect.right);
    const closestY = Phaser.Math.Clamp(circleY, rect.y, rect.bottom);
    const distanceX = circleX - closestX;
    const distanceY = circleY - closestY;

    return distanceX * distanceX + distanceY * distanceY <= radius * radius;
  }

  checkHazards() {
    const hitbox = this.getPlayerHitbox();

    if (hitbox.bottom >= GAME_HEIGHT - 4) {
      this.handleHazardDeath("Lost in the chamber! Restarting...");
      return;
    }

    for (const spikeStrip of this.currentLevel.spikes || []) {
      const spikeHitbox = new Phaser.Geom.Rectangle(
        spikeStrip.x,
        spikeStrip.y - 16,
        spikeStrip.width,
        16
      );

      if (Phaser.Geom.Intersects.RectangleToRectangle(hitbox, spikeHitbox)) {
        this.handleHazardDeath("Bronze spikes! Restarting...");
        return;
      }
    }

    for (const lavaPool of this.currentLevel.lavaPools || []) {
      const lavaHitbox = new Phaser.Geom.Rectangle(
        lavaPool.x,
        lavaPool.y,
        lavaPool.width,
        lavaPool.height
      );

      if (Phaser.Geom.Intersects.RectangleToRectangle(hitbox, lavaHitbox)) {
        this.handleHazardDeath("Too hot! Restarting...");
        return;
      }
    }

    for (const blade of this.blades) {
      if (
        !blade.broken &&
        this.circleIntersectsRect(
          blade.currentX,
          blade.currentY,
          blade.radius - 1,
          hitbox
        )
      ) {
        this.handleHazardDeath("Sliced by blades! Restarting...");
        return;
      }
    }

    for (const crusher of this.crushers) {
      if (
        crusher.active &&
        Phaser.Geom.Intersects.RectangleToRectangle(hitbox, crusher.hitRect)
      ) {
        this.handleHazardDeath("Flattened! Restarting...");
        return;
      }
    }
  }

  update(_, delta) {
    if (this.levelState !== "playing") {
      return;
    }

    this.updatePlayerMovement();
    this.updatePlayerAnimation(this.time.now);
    this.updateBlades(this.time.now);
    this.updateCrushers(this.time.now);
    this.checkHazards();

    if (this.levelState !== "playing") {
      return;
    }

    this.wetness = Math.max(0, this.wetness - (this.dryRate * delta) / 1000);
    this.updateWetnessHud();

    if (this.wetness <= 0) {
      this.handleDryOut();
    }
  }
}

class WinScene extends Phaser.Scene {
  constructor() {
    super("WinScene");
  }

  create() {
    const currentLevelIndex = getSelectedLevelIndex(this);
    const highestUnlockedLevel = getHighestUnlockedLevel(this);
    const progressMessage =
      highestUnlockedLevel === TOTAL_LEVELS
        ? "All five chambers are now open for replay."
        : `Levels 1-${highestUnlockedLevel} remain open for replay.`;

    drawSky(this);
    drawStars(this);

    const river = this.add.graphics();
    river.fillStyle(COLORS.waterDeep, 1);
    river.fillRect(0, 178, GAME_WIDTH, 92);
    river.fillStyle(COLORS.water, 1);
    river.fillRect(0, 178, GAME_WIDTH, 84);

    this.add.ellipse(96, 150, 40, 16, COLORS.crab, 1);
    this.add.rectangle(340, 154, 34, 70, 0xd6c394, 1);
    this.add.triangle(340, 118, 322, 152, 358, 152, 340, 96, 0xb59a67, 1);

    createPanel(this, 44, 40, 392, 118);
    addSceneTitle(this, "You Win", `Level ${currentLevelIndex + 1} clear`);

    this.add
      .text(
        GAME_WIDTH / 2,
        108,
        "The crab reached the Nile.\nSomewhere, a mummy is still very confused in the ocean.",
        {
          ...LABEL_STYLE,
          align: "center"
        }
      )
      .setOrigin(0.5);

    this.add
      .text(
        GAME_WIDTH / 2,
        172,
        progressMessage,
        {
          ...LABEL_STYLE,
          fontSize: "12px"
        }
      )
      .setOrigin(0.5);

    createTextButton(this, 160, 214, "Level Select", () => {
      this.scene.start("LevelSelectScene");
    }, 120);

    createTextButton(this, 320, 214, "Main Menu", () => {
      this.scene.start("MainMenuScene");
    }, 120);

    addCrtOverlay(this);
  }
}

const config = {
  type: Phaser.AUTO,
  parent: "game",
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: "#120d07",
  autoRound: true,
  pixelArt: true,
  roundPixels: true,
  antialias: false,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 820 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT
  },
  scene: [
    MainMenuScene,
    SettingsScene,
    LevelSelectScene,
    ReportScene,
    GameScene,
    WinScene
  ]
};

new Phaser.Game(config);
