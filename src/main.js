import Phaser from "phaser";

const GAME_WIDTH = 480;
const GAME_HEIGHT = 270;
const TOTAL_LEVELS = 5;
const PROGRESS_STORAGE_KEY = "crab-out-of-nile-progress";
const MAIN_MENU_BACKGROUND_KEY = "main-menu-background";
const LEVEL_SELECT_BACKGROUND_KEY = "level-select-background";
const CRAB_SPRITESHEET_KEY = "crab-sheet";
const CRAB_FRAME_SIZE = 32;
const CRAB_IDLE_FRAME = 0;
const CRAB_MENU_IDLE_FRAMES = [0, 1, 2, 1];
const CRAB_SCUTTLE_FRAMES = [0, 1, 2, 3];
const CRAB_JUMP_FRAME = 13;
const MAIN_MENU_BACKGROUND_URL = new URL(
  "../assets/main_menu_background.png",
  import.meta.url
).href;
const LEVEL_SELECT_BACKGROUND_URL = new URL(
  "../assets/level_selector_background.png",
  import.meta.url
).href;
const CRAB_SPRITESHEET_URL = new URL(
  "../assets/Crab Sprite Sheet.png",
  import.meta.url
).href;
const BG_MUSIC_URL = new URL("../assets/bg-music.mp3", import.meta.url).href;
const TRACK_URLS = [
  new URL("../assets/Track 1.mp3", import.meta.url).href,
  new URL("../assets/Track 2.mp3", import.meta.url).href,
  new URL("../assets/Track 3.mp3", import.meta.url).href,
  new URL("../assets/Track 4.mp3", import.meta.url).href,
  new URL("../assets/Track 5.mp3", import.meta.url).href
];
const LEVEL_BACKGROUNDS = [
  {
    key: "level-1-background",
    url: new URL("../assets/Level01_Background.png", import.meta.url).href
  },
  {
    key: "level-2-background",
    url: new URL("../assets/Level02_Background.png", import.meta.url).href
  },
  {
    key: "level-3-background",
    url: new URL("../assets/Level03_Background.png", import.meta.url).href
  },
  {
    key: "level-4-background",
    url: new URL("../assets/Level04_Background.png", import.meta.url).href
  },
  {
    key: "level-5-background",
    url: new URL("../assets/Level05_Background.png", import.meta.url).href
  }
];
const STORYBOARD_FRAMES = [
  {
    key: "storyboard-opening-1",
    url: new URL("../assets/Storyboard01/Opening Frame 1.png", import.meta.url).href
  },
  {
    key: "storyboard-opening-2",
    url: new URL("../assets/Storyboard01/Opening_Frame_2.png", import.meta.url).href
  },
  {
    key: "storyboard-opening-3",
    url: new URL("../assets/Storyboard01/Opening_Frame_3.png", import.meta.url).href
  },
  {
    key: "storyboard-opening-4",
    url: new URL("../assets/Storyboard01/Opening_Frame_4.png", import.meta.url).href
  },
  {
    key: "storyboard-opening-5",
    url: new URL("../assets/Storyboard02/Opening_Frame_5.png", import.meta.url).href
  },
  {
    key: "storyboard-opening-6",
    url: new URL("../assets/Storyboard02/Opening_Frame_6.png", import.meta.url).href
  },
  {
    key: "storyboard-opening-7",
    url: new URL("../assets/Storyboard02/Opening_Frame_7.png", import.meta.url).href
  },
  {
    key: "storyboard-opening-8",
    url: new URL("../assets/Storyboard02/Opening_Frame_8.png", import.meta.url).href
  }
];

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
    goal: { x: 430, y: 144, width: 34, height: 108, kind: "door", label: "EXIT" },
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
    goal: { x: 430, y: 140, width: 34, height: 112, kind: "door", label: "EXIT" },
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
    goal: { x: 428, y: 146, width: 34, height: 106, kind: "door", label: "EXIT" },
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
      "Ancient Engineer Report #4:\n𓂀 𓃭 𓊹 𓇳 𓈖 𓆣 𓋹\n𓉐 𓏏 𓐍 𓄿 𓅓 𓆑 𓂋\n𓁐 𓃀 𓇋 𓌳 𓎛 𓊃 𓊪",
    startX: 36,
    startY: 220,
    goal: { x: 430, y: 140, width: 34, height: 112, kind: "door", label: "EXIT" },
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
      x: 410,
      y: 122,
      width: 48,
      height: 110,
      kind: "river",
      label: "NILE"
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
  { x: 226, y: 84 },
  { x: 296, y: 114 },
  { x: 130, y: 150 },
  { x: 356, y: 181 },
  { x: 226, y: 221 }
];

const LEVEL_LABEL_OFFSETS = [
  { x: 0, y: 25 },
  { x: 0, y: 25 },
  { x: 34, y: 0 },
  { x: 0, y: 25 },
  { x: 0, y: -25 }
];

const LEVEL_ROUTE_POINTS = [
  LEVEL_NODE_POSITIONS[0],
  { x: 226, y: 98 },
  { x: 252, y: 112 },
  LEVEL_NODE_POSITIONS[1],
  { x: 270, y: 128 },
  { x: 236, y: 132 },
  { x: 198, y: 144 },
  LEVEL_NODE_POSITIONS[2],
  { x: 166, y: 160 },
  { x: 206, y: 160 },
  { x: 242, y: 174 },
  { x: 300, y: 181 },
  LEVEL_NODE_POSITIONS[3],
  { x: 334, y: 196 },
  { x: 292, y: 198 },
  { x: 250, y: 210 },
  LEVEL_NODE_POSITIONS[4],
  { x: 256, y: 220 },
  { x: 314, y: 210 },
  { x: 372, y: 210 }
];

const LEVEL_ROUTE_ACTIVE_SEGMENT_COUNTS = [0, 3, 7, 12, 20];
const EXIT_POINT = { x: 430, y: 222 };

const sharedState = {
  musicOn: true,
  soundOn: true,
  currentMusicKey: null,
  currentMusicInfo: null
};

function playBackgroundMusic(scene, key) {
  if (sharedState.currentMusicKey === key) {
    if (!sharedState.musicOn && sharedState.currentMusicInfo && sharedState.currentMusicInfo.isPlaying) {
      sharedState.currentMusicInfo.pause();
    } else if (sharedState.musicOn && sharedState.currentMusicInfo && sharedState.currentMusicInfo.isPaused) {
      sharedState.currentMusicInfo.resume();
    }
    return;
  }
  
  if (sharedState.currentMusicInfo) {
    sharedState.currentMusicInfo.stop();
    sharedState.currentMusicInfo.destroy();
  }
  
  sharedState.currentMusicKey = key;
  
  if (!key) {
    sharedState.currentMusicInfo = null;
    return;
  }
  
  sharedState.currentMusicInfo = scene.sound.add(key, { loop: true, volume: 0.4 });
  
  if (sharedState.musicOn) {
    sharedState.currentMusicInfo.play();
  }
}

function updateMusicSetting() {
  if (sharedState.currentMusicInfo) {
    if (sharedState.musicOn) {
      if (sharedState.currentMusicInfo.isPaused) {
        sharedState.currentMusicInfo.resume();
      } else if (!sharedState.currentMusicInfo.isPlaying) {
        sharedState.currentMusicInfo.play();
      }
    } else {
      if (sharedState.currentMusicInfo.isPlaying) {
        sharedState.currentMusicInfo.pause();
      }
    }
  }
}

function getMusicSettingLabel() {
  return `Music: ${sharedState.musicOn ? "On" : "Off"}`;
}

function getSoundSettingLabel() {
  return `Scuttle SFX: ${sharedState.soundOn ? "On" : "Off"}`;
}

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

function getRomanNumeral(value) {
  const numerals = ["I", "II", "III", "IV", "V"];

  return numerals[value - 1] || String(value);
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

function createPapyrusActionText(scene, x, y, label, onClick, hitWidth = 130) {
  const actionText = scene.add
    .text(x, y, label, {
      fontFamily: FONTS.title,
      fontSize: "15px",
      color: "#5b3314",
      stroke: "#efcf8d",
      strokeThickness: 1
    })
    .setOrigin(0.5)
    .setDepth(20);
  const underline = scene.add
    .rectangle(x, y + 12, actionText.width + 12, 1, 0x6a3f18, 0.55)
    .setDepth(19);
  const hitZone = scene.add
    .zone(x, y, hitWidth, 28)
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
    .setDepth(21);

  hitZone
    .on("pointerover", () => {
      actionText.setColor("#2f1b0a");
      underline.setAlpha(0.95);
      playSoundCue(scene, "ui-hover");
    })
    .on("pointerout", () => {
      actionText.setColor("#5b3314");
      underline.setAlpha(0.55);
    })
    .on("pointerdown", () => {
      playSoundCue(scene, "ui-click");
      actionText.setScale(0.97);
      onClick();
    })
    .on("pointerup", () => {
      actionText.setScale(1);
    });

  return actionText;
}

function addSceneTitle(scene, title, subtitle = "", subtitleY = 62) {
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
      .text(GAME_WIDTH / 2, subtitleY, subtitle, {
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
    return true;
  }

  return false;
}

function preloadAudioIfNeeded(scene, key, url) {
  if (!scene.cache.audio.exists(key)) {
    scene.load.audio(key, url);
    return true;
  }

  return false;
}

function preloadCrabSpritesheetIfNeeded(scene) {
  if (!scene.textures.exists(CRAB_SPRITESHEET_KEY)) {
    scene.load.spritesheet(CRAB_SPRITESHEET_KEY, CRAB_SPRITESHEET_URL, {
      frameWidth: CRAB_FRAME_SIZE,
      frameHeight: CRAB_FRAME_SIZE
    });
    return true;
  }

  return false;
}

function preloadMainMenuAssets(scene) {
  let queuedAsset = false;

  queuedAsset = preloadImageIfNeeded(
    scene,
    MAIN_MENU_BACKGROUND_KEY,
    MAIN_MENU_BACKGROUND_URL
  ) || queuedAsset;
  queuedAsset = preloadCrabSpritesheetIfNeeded(scene) || queuedAsset;
  queuedAsset = preloadAudioIfNeeded(scene, "bg-music", BG_MUSIC_URL) || queuedAsset;

  TRACK_URLS.forEach((url, i) => {
    queuedAsset = preloadAudioIfNeeded(scene, `track-${i + 1}`, url) || queuedAsset;
  });

  return queuedAsset;
}

function getLevelBackground(levelIndex) {
  return LEVEL_BACKGROUNDS[clampLevelIndex(levelIndex)];
}

function preloadLevelBackgroundIfNeeded(scene, levelIndex) {
  const background = getLevelBackground(levelIndex);

  return preloadImageIfNeeded(scene, background.key, background.url);
}

function addLevelBackground(scene, levelIndex) {
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

function ensureCrabAnimations(scene) {
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
      .text(0, 0, getRomanNumeral(levelIndex + 1), {
        fontFamily: FONTS.ui,
        fontSize: levelIndex >= 2 ? "10px" : "12px",
        color: "#2c170b"
      })
      .setOrigin(0.5);

    node.add(label);
  } else {
    node.add(createLockIcon(scene));
  }

  if (unlocked) {
    const hitZone = scene.add
      .zone(x, y, 46, 46)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setDepth(13);

    hitZone
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

function createIntroElement(tagName, styles = {}, text = "") {
  const element = document.createElement(tagName);

  Object.assign(element.style, styles);

  if (text) {
    element.textContent = text;
  }

  return element;
}

function loadStoryboardImage(frame) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.decoding = "async";
    image.onload = () => {
      resolve({ ...frame, image });
    };
    image.onerror = reject;
    image.src = frame.url;
  });
}

function showOpeningStoryboard(onComplete) {
  let currentFrameIndex = 0;
  let isFinished = false;
  let isTransitioning = false;
  let loadedFrames = [];
  let transitionTimer = null;
  let settleTimer = null;

  const overlay = createIntroElement("div", {
    position: "fixed",
    inset: "0",
    zIndex: "9999",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    padding: "24px",
    background: "#120d07",
    color: COLORS.white,
    fontFamily: FONTS.ui,
    opacity: "1",
    transition: "opacity 180ms ease"
  });
  const imageStage = createIntroElement("div", {
    width: "100%",
    height: "100%",
    minHeight: "0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  });
  const imageFrame = createIntroElement("div", {
    position: "relative",
    display: "inline-flex",
    maxWidth: "100%",
    maxHeight: "100%",
    boxSizing: "border-box",
    background: "#fff0bf",
    border: "4px solid #2c170b",
    boxShadow: "0 10px 28px rgba(0, 0, 0, 0.5)",
    overflow: "hidden",
    opacity: "1",
    transform: "translateX(0) scale(1)",
    willChange: "opacity, transform"
  });
  const image = createIntroElement("img", {
    maxWidth: "calc(100vw - 56px)",
    maxHeight: "calc(100vh - 56px)",
    display: "block",
    objectFit: "contain",
    imageRendering: "auto"
  });
  const promptText = createIntroElement("div", {
    position: "absolute",
    left: "50%",
    bottom: "18px",
    transform: "translateX(-50%)",
    color: COLORS.white,
    fontFamily: '"Courier New", monospace',
    fontSize: "clamp(12px, 1.4vw, 18px)",
    fontWeight: "700",
    lineHeight: "1",
    letterSpacing: "0",
    pointerEvents: "none",
    textAlign: "center",
    textShadow:
      "2px 0 #120d07, -2px 0 #120d07, 0 2px #120d07, 0 -2px #120d07, 2px 2px #120d07",
    whiteSpace: "nowrap"
  }, "Loading...");

  const skipButton = createIntroElement("button", {
    position: "absolute",
    top: "24px",
    right: "24px",
    background: "rgba(0, 0, 0, 0.6)",
    color: COLORS.white,
    fontFamily: '"Courier New", monospace',
    fontSize: "14px",
    fontWeight: "700",
    border: "2px solid #fff0bf",
    padding: "8px 16px",
    cursor: "pointer",
    zIndex: "10000"
  }, "Skip (Esc)");

  imageFrame.append(image, promptText);
  imageStage.appendChild(imageFrame);
  overlay.appendChild(imageStage);
  overlay.appendChild(skipButton);
  document.body.appendChild(overlay);

  skipButton.onclick = () => {
    finishIntro();
  };

  const cleanup = () => {
    window.removeEventListener("keydown", handleKeyDown);
    window.clearTimeout(transitionTimer);
    window.clearTimeout(settleTimer);
    overlay.remove();
  };
  const finishIntro = () => {
    if (isFinished) {
      return;
    }

    isFinished = true;
    overlay.style.opacity = "0";
    window.setTimeout(() => {
      cleanup();
      onComplete();
    }, 180);
  };
  const updateFrameContent = () => {
    const frame = loadedFrames[currentFrameIndex];

    image.src = frame.image.src;
    image.alt = `Opening storyboard panel ${currentFrameIndex + 1}`;
    promptText.textContent =
      currentFrameIndex === loadedFrames.length - 1
        ? "Press SPACE to start"
        : "Press SPACE for next image";
  };
  const showFrame = (direction = 1) => {
    updateFrameContent();
    imageFrame.style.transition = "none";
    imageFrame.style.opacity = "0";
    imageFrame.style.transform = `translateX(${28 * direction}px) scale(0.985)`;

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        imageFrame.style.transition = "opacity 240ms ease-out, transform 240ms ease-out";
        imageFrame.style.opacity = "1";
        imageFrame.style.transform = "translateX(0) scale(1)";
        settleTimer = window.setTimeout(() => {
          isTransitioning = false;
        }, 240);
      });
    });
  };
  function advanceFrame() {
    if (!loadedFrames.length || isTransitioning) {
      return;
    }

    if (currentFrameIndex >= loadedFrames.length - 1) {
      finishIntro();
      return;
    }

    isTransitioning = true;
    imageFrame.style.transition = "opacity 160ms ease-in, transform 160ms ease-in";
    imageFrame.style.opacity = "0";
    imageFrame.style.transform = "translateX(-28px) scale(0.985)";

    transitionTimer = window.setTimeout(() => {
      currentFrameIndex += 1;
      showFrame(1);
    }, 160);
  }
  function handleKeyDown(event) {
    if (event.repeat) {
      return;
    }

    if (event.code === "Escape") {
      event.preventDefault();
      finishIntro();
      return;
    }

    if (event.code === "Space") {
      event.preventDefault();
      advanceFrame();
    }
  }

  window.addEventListener("keydown", handleKeyDown);

  Promise.all(STORYBOARD_FRAMES.map(loadStoryboardImage))
    .then((frames) => {
      loadedFrames = frames;
      isTransitioning = true;
      showFrame(1);
    })
    .catch(() => {
      finishIntro();
    });
}

class MainMenuScene extends Phaser.Scene {
  constructor() {
    super("MainMenuScene");
  }

  preload() {
    const loadingText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, "Loading...", {
        fontFamily: FONTS.title,
        fontSize: "24px",
        color: COLORS.white
      })
      .setOrigin(0.5);
    const queuedAsset = preloadMainMenuAssets(this);

    if (queuedAsset) {
      this.load.once("complete", () => {
        loadingText.destroy();
      });
    } else {
      loadingText.destroy();
    }
  }

  create() {
    ensureProgress(this);
    addMenuBackground(this);
    playBackgroundMusic(this, "bg-music");
    ensureCrabAnimations(this);
    createPanel(this, 26, 82, 218, 146);

    this.add
      .text(36, 42, "Untitled Crab Game", {
        fontFamily: FONTS.title,
        fontSize: "27px",
        color: COLORS.gold,
        stroke: "#2c170b",
        strokeThickness: 6
      })
      .setOrigin(0, 0.5)
      .setDepth(30);

    this.add
      .text(40, 68, "CSD Game Jam submission", {
        ...LABEL_STYLE,
        fontSize: "12px"
      })
      .setOrigin(0, 0.5)
      .setDepth(30);

    this.add
      .text(
        135,
        112,
        "You're a crab in a Pyramid.\nNow you have to find a way out. Good luck!",
        {
          ...LABEL_STYLE,
          align: "center",
          wordWrap: { width: 182 }
        }
      )
      .setOrigin(0.5);

    createTextButton(this, 135, 158, "Play", () => {
      this.scene.start("LevelSelectScene");
    });

    createTextButton(this, 135, 202, "Settings", () => {
      this.scene.start("SettingsScene");
    });

    const crab = this.add
      .sprite(334, 208, CRAB_SPRITESHEET_KEY, CRAB_IDLE_FRAME)
      .setOrigin(0.5, 1)
      .setScale(2)
      .setFlipX(true)
      .setDepth(9);

    crab.anims.play("crab-menu-idle");

    this.add
      .ellipse(334, 212, 58, 10, 0x160d08, 0.34)
      .setDepth(8);

    addCrtOverlay(this);
  }
}

class SettingsScene extends Phaser.Scene {
  constructor() {
    super("SettingsScene");
  }

  preload() {
    preloadImageIfNeeded(this, MAIN_MENU_BACKGROUND_KEY, MAIN_MENU_BACKGROUND_URL);
  }

  create() {
    addMenuBackground(this);
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
        updateMusicSetting();
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

    addCrtOverlay(this);
  }

  refreshLabels() {
    this.musicText.setText(getMusicSettingLabel());
    this.soundText.setText(getSoundSettingLabel());
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
    addSceneTitle(this, "Level Select", "Choose an unlocked chamber", 56);
    playBackgroundMusic(this, "bg-music");

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
      const labelOffset = LEVEL_LABEL_OFFSETS[levelIndex];

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
        .text(nodePosition.x + labelOffset.x, nodePosition.y + labelOffset.y, `L${levelIndex + 1}`, {
          fontFamily: FONTS.ui,
          fontSize: "11px",
          color: isLevelUnlocked(this, levelIndex) ? COLORS.white : "#b59a7b"
        })
        .setOrigin(0.5);
    });

    createPanel(this, 16, 232, 190, 28);

    this.add
      .text(
        111,
        246,
        clearBannerText || "Gold chambers can be replayed. Dark seals stay locked.",
        {
          fontFamily: FONTS.ui,
          fontSize: "11px",
          color: clearBannerText ? COLORS.gold : COLORS.white,
          align: "center",
          wordWrap: { width: 172, useAdvancedWrap: true }
        }
      )
      .setOrigin(0.5);

    this.registry.set("clearBannerText", "");

    createTextButton(this, 408, 24, "Main Menu", () => {
      this.scene.start("MainMenuScene");
    }, 112);

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
    const reportLines = level.report.split("\n");
    reportLines.shift();
    const reportBody = reportLines.join("\n");
    const hasHieroglyphReport = /[\u{13000}-\u{1342f}]/u.test(reportBody);

    drawReportParchment(this);

    this.add
      .text(GAME_WIDTH / 2, 42, "Chamber Record", {
        fontFamily: FONTS.title,
        fontSize: "22px",
        color: "#5b3314",
        stroke: "#efcf8d",
        strokeThickness: 2
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 66, `Level ${getRomanNumeral(levelIndex + 1)} - ${level.name}`, {
        fontFamily: FONTS.ui,
        fontSize: "11px",
        color: "#5b3314"
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 132, reportBody, {
        fontFamily: hasHieroglyphReport
          ? '"Segoe UI Historic", "Noto Sans Egyptian Hieroglyphs", serif'
          : FONTS.title,
        fontSize: hasHieroglyphReport ? "18px" : "13px",
        color: "#3a210d",
        align: "center",
        wordWrap: { width: 308, useAdvancedWrap: true },
        lineSpacing: hasHieroglyphReport ? 10 : 8
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 201, "Press Space or click below to enter the chamber.", {
        fontFamily: FONTS.ui,
        fontSize: "11px",
        color: "#684019"
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

    createPapyrusActionText(this, 168, 218, "Back", () => {
      this.scene.start("LevelSelectScene");
    }, 94);

    createPapyrusActionText(this, 312, 218, "Enter Chamber", () => {
      enterChamber();
    }, 150);

    addCrtOverlay(this);
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  preload() {
    preloadLevelBackgroundIfNeeded(this, getSelectedLevelIndex(this));
    preloadCrabSpritesheetIfNeeded(this);
  }

  create() {
    this.currentLevelIndex = getSelectedLevelIndex(this);
    this.currentLevel = getCurrentLevel(this);
    
    playBackgroundMusic(this, `track-${this.currentLevelIndex + 1}`);
    
    this.levelState = "playing";
    this.pauseMenuOpen = false;
    this.maxWetness = 100;
    this.wetness = this.maxWetness;
    this.lowWetnessThreshold = 24;
    this.dryRate = 2.6;
    this.facingDirection = 1;
    this.blades = [];
    this.crushers = [];

    this.cameras.main.setBackgroundColor("#120d07");
    addLevelBackground(this, this.currentLevelIndex);
    this.levelLayout = this.drawLevel(this.currentLevel);
    addSceneTitle(this, `Level ${this.currentLevelIndex + 1}`, this.currentLevel.name);

    ensureCrabAnimations(this);

    this.player = this.physics.add.sprite(
      this.currentLevel.startX,
      this.currentLevel.startY,
      CRAB_SPRITESHEET_KEY,
      CRAB_IDLE_FRAME
    );
    this.player
      .setOrigin(0.5, 1)
      .setCollideWorldBounds(true)
      .setBounce(0)
      .setDragX(1200)
      .setMaxVelocity(120, 380)
      .setDepth(8);
    this.player.body.setSize(18, 12);
    this.player.body.setOffset(7, 20);
    this.player.anims.play("crab-idle");

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
    this.escapeKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC
    );
    this.handleEscapeKeyDown = () => {
      if (this.pauseMenuOpen) {
        this.closePauseMenu();
        return;
      }

      if (this.levelState === "playing") {
        this.openPauseMenu();
      }
    };
    this.escapeKey.on("down", this.handleEscapeKeyDown);
    this.events.once("shutdown", () => {
      this.escapeKey.off("down", this.handleEscapeKeyDown);
    });

    this.createPauseMenu();

    addCrtOverlay(this);
  }

  createPauseMenu() {
    this.pauseMenuShade = this.add
      .rectangle(
        GAME_WIDTH / 2,
        GAME_HEIGHT / 2,
        GAME_WIDTH,
        GAME_HEIGHT,
        0x120d07,
        0.72
      )
      .setDepth(46)
      .setVisible(false);
    this.pauseMenuPanel = createPanel(this, 92, 34, 296, 202)
      .setDepth(47)
      .setVisible(false);
    this.pauseMenuTitle = this.add
      .text(GAME_WIDTH / 2, 58, "Level Settings", {
        fontFamily: FONTS.title,
        fontSize: "24px",
        color: COLORS.gold,
        stroke: "#2c170b",
        strokeThickness: 5
      })
      .setOrigin(0.5)
      .setDepth(48)
      .setVisible(false);
    this.pauseMenuHint = this.add
      .text(GAME_WIDTH / 2, 80, "Press Esc to resume", {
        fontFamily: FONTS.ui,
        fontSize: "11px",
        color: COLORS.white
      })
      .setOrigin(0.5)
      .setDepth(48)
      .setVisible(false);
    this.pauseMusicText = this.add
      .text(122, 108, "", LABEL_STYLE)
      .setOrigin(0, 0.5)
      .setDepth(48)
      .setVisible(false);
    this.pauseSoundText = this.add
      .text(122, 146, "", LABEL_STYLE)
      .setOrigin(0, 0.5)
      .setDepth(48)
      .setVisible(false);

    this.pauseToggleMusicButton = createTextButton(
      this,
      314,
      108,
      "Toggle",
      () => {
        sharedState.musicOn = !sharedState.musicOn;
        this.refreshPauseMenuLabels();
        updateMusicSetting();
      },
      100
    )
      .setDepth(49)
      .setVisible(false);

    this.pauseToggleSoundButton = createTextButton(
      this,
      314,
      146,
      "Toggle",
      () => {
        sharedState.soundOn = !sharedState.soundOn;
        this.refreshPauseMenuLabels();
      },
      100
    )
      .setDepth(49)
      .setVisible(false);

    this.pauseQuitLevelButton = createTextButton(
      this,
      164,
      192,
      "Quit Level",
      () => {
        this.scene.start("LevelSelectScene");
      },
      118
    )
      .setDepth(49)
      .setVisible(false);

    this.pauseResumeButton = createTextButton(
      this,
      316,
      192,
      "Resume",
      () => {
        this.closePauseMenu();
      },
      120
    )
      .setDepth(49)
      .setVisible(false);

    this.pauseMenuObjects = [
      this.pauseMenuShade,
      this.pauseMenuPanel,
      this.pauseMenuTitle,
      this.pauseMenuHint,
      this.pauseMusicText,
      this.pauseSoundText,
      this.pauseToggleMusicButton,
      this.pauseToggleSoundButton,
      this.pauseQuitLevelButton,
      this.pauseResumeButton
    ];
    this.pauseMenuButtons = [
      this.pauseToggleMusicButton,
      this.pauseToggleSoundButton,
      this.pauseQuitLevelButton,
      this.pauseResumeButton
    ];

    this.refreshPauseMenuLabels();
    this.setPauseMenuVisible(false);
  }

  refreshPauseMenuLabels() {
    this.pauseMusicText.setText(getMusicSettingLabel());
    this.pauseSoundText.setText(getSoundSettingLabel());
  }

  setPauseMenuVisible(isVisible) {
    this.pauseMenuObjects.forEach((object) => {
      object.setVisible(isVisible);

      if (typeof object.setActive === "function") {
        object.setActive(isVisible);
      }
    });

    this.pauseMenuButtons.forEach((button) => {
      if (button.input) {
        button.input.enabled = isVisible;
      }
    });
  }

  openPauseMenu() {
    if (this.pauseMenuOpen || this.levelState !== "playing") {
      return;
    }

    this.pauseMenuOpen = true;
    this.physics.world.pause();
    this.refreshPauseMenuLabels();
    this.setPauseMenuVisible(true);
  }

  closePauseMenu() {
    if (!this.pauseMenuOpen) {
      return;
    }

    this.pauseMenuOpen = false;
    this.setPauseMenuVisible(false);

    if (this.levelState === "playing") {
      this.physics.world.resume();
      this.updateWetnessHud();
    }
  }

  drawLevel(level) {
    const graphics = this.add.graphics().setDepth(2);

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

    if (goal.kind === "door") {
      graphics.fillStyle(COLORS.wallDark, 1);
      graphics.fillRoundedRect(goal.x, goal.y, goal.width, goal.height, { tl: 22, tr: 22, bl: 0, br: 0 });
      graphics.lineStyle(2, COLORS.metalDark, 1);
      graphics.strokeRoundedRect(goal.x, goal.y, goal.width, goal.height, { tl: 22, tr: 22, bl: 0, br: 0 });
      
      graphics.fillStyle(COLORS.bronzeDark, 1);
      graphics.fillRect(goal.x + 6, goal.y + 22, goal.width - 12, goal.height - 22);
      
      this.add
        .text(goal.x + goal.width / 2, goal.y - 12, goal.label, {
          fontFamily: FONTS.ui,
          fontSize: "11px",
          color: COLORS.gold
        })
        .setOrigin(0.5)
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
    this.player.anims.play("crab-jump", true);
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
    let nextAnim = "crab-idle";

    if (!onGround) {
      nextAnim = "crab-jump";
      this.player.setAngle(this.player.body.velocity.y < 0 ? -5 : 5);
    } else if (horizontalSpeed > 5) {
      nextAnim = "crab-scuttle";
      this.player.setAngle(Math.sin(time / 90) * 2);
    } else {
      this.player.setAngle(0);
    }

    const currentAnim = this.player.anims.currentAnim;
    if (!currentAnim || currentAnim.key !== nextAnim) {
      this.player.anims.play(nextAnim, true);
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
    if (this.pauseMenuOpen) {
      return;
    }

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

    playBackgroundMusic(this, "bg-music");

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

showOpeningStoryboard(() => {
  new Phaser.Game(config);
});
