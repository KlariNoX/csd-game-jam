import Phaser from "phaser";

const GAME_WIDTH = 480;
const GAME_HEIGHT = 270;
const TOTAL_LEVELS = 5;
const PROGRESS_STORAGE_KEY = "crab-out-of-nile-progress";

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
  crab: 0xd95f43,
  white: "#fff8de",
  gold: "#f3d36b"
};

const BUTTON_STYLE = {
  fontFamily: "Verdana",
  fontSize: "14px",
  color: COLORS.white,
  backgroundColor: "#4b2f1c",
  padding: { x: 14, y: 8 }
};

const LABEL_STYLE = {
  fontFamily: "Verdana",
  fontSize: "14px",
  color: COLORS.white
};

const LEVELS = [
  {
    name: "Burial Gate",
    report:
      "Ancient Engineer Report #1:\nThe architect demanded a perfect chamber.\nUnfortunately, we ran out of bronze spikes.\nOne corridor remains embarrassingly safe.",
    startX: 48,
    startY: 208,
    riverX: 400,
    riverY: 146,
    riverWidth: 80,
    riverHeight: 124
  },
  {
    name: "Sand Hall",
    report:
      "Ancient Engineer Report #2:\nThe rotating blade trap was approved.\nUnfortunately, we ran out of rope.\nThe blades do not rotate.\nPlease do not tell the Pharaoh.",
    startX: 56,
    startY: 198,
    riverX: 384,
    riverY: 138,
    riverWidth: 96,
    riverHeight: 132
  },
  {
    name: "Scarab Steps",
    report:
      "Ancient Engineer Report #3:\nThe lava channel was planned beautifully.\nUnfortunately, we ran out of lava.\nWe filled it with warm sand instead.",
    startX: 44,
    startY: 190,
    riverX: 370,
    riverY: 132,
    riverWidth: 110,
    riverHeight: 138
  },
  {
    name: "Moon Shaft",
    report:
      "Ancient Engineer Report #4:\nThe crushing ceiling was installed.\nUnfortunately, we ran out of counterweights.\nIt only looks threatening.",
    startX: 66,
    startY: 182,
    riverX: 354,
    riverY: 126,
    riverWidth: 126,
    riverHeight: 144
  },
  {
    name: "River Mouth",
    report:
      "Ancient Engineer Report #5:\nThe final chamber was meant to be flawless.\nUnfortunately, we ran out of doors.\nThe exit is just sitting there.",
    startX: 54,
    startY: 174,
    riverX: 338,
    riverY: 120,
    riverWidth: 142,
    riverHeight: 150
  }
];

const LEVEL_NODE_POSITIONS = [
  { x: 74, y: 205 },
  { x: 145, y: 184 },
  { x: 224, y: 156 },
  { x: 306, y: 120 },
  { x: 382, y: 82 }
];

const EXIT_POINT = { x: 434, y: 50 };

const sharedState = {
  musicOn: true,
  soundOn: true
};

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

  button.setFixedSize(width, 34);
  button.setAlign("center");
  button.setPadding(0, 8, 0, 0);

  button
    .on("pointerover", () => {
      button.setStyle({ backgroundColor: "#6f472c", color: "#fff3b4" });
    })
    .on("pointerout", () => {
      button.setStyle({
        backgroundColor: BUTTON_STYLE.backgroundColor,
        color: BUTTON_STYLE.color
      });
    })
    .on("pointerdown", () => {
      onClick();
    });

  return button;
}

function addSceneTitle(scene, title, subtitle = "") {
  scene.add
    .text(GAME_WIDTH / 2, 36, title, {
      fontFamily: "Georgia",
      fontSize: "28px",
      color: COLORS.gold,
      stroke: "#2c170b",
      strokeThickness: 6
    })
    .setOrigin(0.5);

  if (subtitle) {
    scene.add
      .text(GAME_WIDTH / 2, 62, subtitle, {
        ...LABEL_STYLE,
        fontSize: "12px"
      })
      .setOrigin(0.5);
  }
}

function addMenuBackground(scene) {
  drawSky(scene);
  drawStars(scene);
  drawPyramids(scene);

  scene.add.ellipse(60, 38, 26, 26, 0xfaf0ae, 0.85);
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

  graphics.fillStyle(COLORS.wallDark, 1);
  graphics.fillRoundedRect(410, 22, 44, 70, 8);
  graphics.lineStyle(2, COLORS.gold, 1);
  graphics.strokeRoundedRect(410, 22, 44, 70, 8);

  graphics.fillStyle(0xf4df95, 0.25);
  graphics.fillTriangle(432, 22, 454, 92, 410, 92);

  scene.add
    .text(432, 58, "EXIT", {
      fontFamily: "Verdana",
      fontSize: "12px",
      color: COLORS.white
    })
    .setOrigin(0.5);
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
        fontFamily: "Verdana",
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
  }

  refreshLabels() {
    this.musicText.setText(`Music: ${sharedState.musicOn ? "On" : "Off"}`);
    this.soundText.setText(`Sound: ${sharedState.soundOn ? "On" : "Off"}`);
  }
}

class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super("LevelSelectScene");
  }

  create() {
    const highestUnlockedLevel = getHighestUnlockedLevel(this);

    drawPyramidInterior(this);
    drawLevelSelectExit(this);
    addSceneTitle(this, "Level Select", "Choose an unlocked chamber");

    this.add
      .text(76, 22, `Unlocked: ${highestUnlockedLevel}/${TOTAL_LEVELS}`, {
        fontFamily: "Verdana",
        fontSize: "12px",
        color: COLORS.white
      })
      .setOrigin(0.5);

    const pathPoints = [...LEVEL_NODE_POSITIONS, EXIT_POINT];

    for (let index = 0; index < pathPoints.length - 1; index += 1) {
      const start = pathPoints[index];
      const end = pathPoints[index + 1];
      const activeSegment =
        index < highestUnlockedLevel - 1 ||
        (index === TOTAL_LEVELS - 1 && highestUnlockedLevel === TOTAL_LEVELS);

      drawDashedLine(
        this,
        start.x,
        start.y,
        end.x,
        end.y,
        activeSegment ? COLORS.gold : COLORS.wallLine,
        activeSegment ? 0.95 : 0.35
      );
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
          fontFamily: "Verdana",
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
        "Gold chambers can be replayed. Dark seals stay locked.",
        {
          fontFamily: "Verdana",
          fontSize: "11px",
          color: COLORS.white
        }
      )
      .setOrigin(0.5);

    createTextButton(this, 404, 234, "Main Menu", () => {
      this.scene.start("MainMenuScene");
    }, 120);
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
        fontFamily: "Georgia",
        fontSize: "24px",
        color: "#6a3f18",
        stroke: "#f7e2b4",
        strokeThickness: 3
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 52, `Level ${levelIndex + 1}: ${level.name}`, {
        fontFamily: "Georgia",
        fontSize: "14px",
        color: "#6a3f18"
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 118, level.report, {
        fontFamily: "Georgia",
        fontSize: "16px",
        color: "#3e2713",
        align: "center",
        wordWrap: { width: 270 },
        lineSpacing: 6
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 196, "Press Space or click below to enter the chamber.", {
        fontFamily: "Verdana",
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
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  create() {
    this.currentLevelIndex = getSelectedLevelIndex(this);
    this.currentLevel = getCurrentLevel(this);

    this.cameras.main.setBackgroundColor("#10172e");
    drawSky(this);
    this.drawLevel(this.currentLevelIndex, this.currentLevel);
    addSceneTitle(this, `Level ${this.currentLevelIndex + 1}`, this.currentLevel.name);

    this.player = this.add.container(
      this.currentLevel.startX,
      this.currentLevel.startY
    );
    this.createCrab(this.player);

    this.goalZone = this.add.rectangle(
      this.currentLevel.riverX + this.currentLevel.riverWidth / 2,
      this.currentLevel.riverY + this.currentLevel.riverHeight / 2,
      this.currentLevel.riverWidth - 14,
      this.currentLevel.riverHeight - 14,
      COLORS.water,
      0
    );

    this.add.text(10, GAME_HEIGHT - 18, "Arrows / WASD to move", {
      ...LABEL_STYLE,
      fontSize: "12px"
    });

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys("W,A,S,D");
  }

  createCrab(container) {
    const body = this.add.graphics();

    body.fillStyle(COLORS.crab, 1);
    body.fillEllipse(0, 0, 24, 14);
    body.fillEllipse(-10, -1, 8, 8);
    body.fillEllipse(10, -1, 8, 8);

    body.lineStyle(2, 0x7e2715, 1);
    body.beginPath();
    body.moveTo(-5, 2);
    body.lineTo(-13, 7);
    body.moveTo(5, 2);
    body.lineTo(13, 7);
    body.moveTo(-8, -4);
    body.lineTo(-13, -9);
    body.moveTo(8, -4);
    body.lineTo(13, -9);
    body.strokePath();

    const eyes = this.add.graphics();
    eyes.fillStyle(0xffffff, 1);
    eyes.fillCircle(-4, -8, 2);
    eyes.fillCircle(4, -8, 2);
    eyes.fillStyle(0x000000, 1);
    eyes.fillCircle(-4, -8, 1);
    eyes.fillCircle(4, -8, 1);

    container.add([body, eyes]);
  }

  drawLevel(levelIndex, level) {
    const graphics = this.add.graphics();
    const tombX = 20 + levelIndex * 10;
    const tombY = 170 - levelIndex * 6;
    const pathY = 188 - levelIndex * 8;
    const pathWidth = 182 - levelIndex * 12;
    const ledgeX = 305 - levelIndex * 8;
    const ledgeY = 172 - levelIndex * 10;
    const ledgeWidth = 70 + levelIndex * 6;

    graphics.fillStyle(COLORS.sandLight, 1);
    graphics.fillRect(0, 150, GAME_WIDTH, 120);

    graphics.fillStyle(COLORS.stone, 1);
    graphics.fillRect(tombX, tombY, 92, 56);
    graphics.fillRect(tombX - 8, tombY + 56, 112, 12);

    graphics.fillStyle(COLORS.sandMid, 1);
    graphics.fillRect(120, pathY, pathWidth, 26);
    graphics.fillRect(ledgeX, ledgeY, ledgeWidth, 18);

    graphics.fillStyle(COLORS.waterDeep, 1);
    graphics.fillRect(level.riverX, level.riverY, level.riverWidth, level.riverHeight);
    graphics.fillStyle(COLORS.water, 1);
    graphics.fillRect(
      level.riverX + 8,
      level.riverY,
      level.riverWidth - 8,
      level.riverHeight
    );

    // A few stones help each level read differently without adding real collision logic.
    graphics.fillStyle(0x8f744f, 1);

    for (let stoneIndex = 0; stoneIndex < 4; stoneIndex += 1) {
      const stoneX = 160 + stoneIndex * 38 + levelIndex * 4;
      const stoneY = 220 - ((stoneIndex + levelIndex) % 2) * 22 - levelIndex * 2;
      const stoneRadius = 6 + ((stoneIndex + levelIndex) % 3);

      graphics.fillCircle(stoneX, stoneY, stoneRadius);
    }

    this.add
      .text(tombX + 38, tombY + 16, "TOMB", {
        fontFamily: "Verdana",
        fontSize: "12px",
        color: COLORS.white
      })
      .setOrigin(0.5);

    this.add
      .text(level.riverX + level.riverWidth / 2, level.riverY + 12, "NILE", {
        fontFamily: "Verdana",
        fontSize: "12px",
        color: COLORS.white
      })
      .setOrigin(0.5);
  }

  update() {
    const speed = 1.6;
    let moveX = 0;
    let moveY = 0;

    if (this.cursors.left.isDown || this.keys.A.isDown) {
      moveX -= speed;
    }
    if (this.cursors.right.isDown || this.keys.D.isDown) {
      moveX += speed;
    }
    if (this.cursors.up.isDown || this.keys.W.isDown) {
      moveY -= speed;
    }
    if (this.cursors.down.isDown || this.keys.S.isDown) {
      moveY += speed;
    }

    this.player.x = Phaser.Math.Clamp(this.player.x + moveX, 14, GAME_WIDTH - 14);
    this.player.y = Phaser.Math.Clamp(this.player.y + moveY, 88, GAME_HEIGHT - 12);

    const reachedGoal = Phaser.Geom.Rectangle.Contains(
      this.goalZone.getBounds(),
      this.player.x,
      this.player.y
    );

    if (reachedGoal) {
      this.scene.start("WinScene");
    }
  }
}

class WinScene extends Phaser.Scene {
  constructor() {
    super("WinScene");
  }

  create() {
    const currentLevelIndex = getSelectedLevelIndex(this);
    const unlockStatus = unlockNextLevel(this, currentLevelIndex);
    const highestUnlockedLevel = unlockStatus.highestUnlockedLevel;
    const unlockedEverything = highestUnlockedLevel === TOTAL_LEVELS;
    let progressMessage = `Levels 1-${highestUnlockedLevel} remain open for replay.`;

    if (unlockStatus.didUnlockNewLevel) {
      progressMessage = `Level ${unlockStatus.newlyUnlockedLevel} is now unlocked.`;
    } else if (unlockedEverything) {
      progressMessage = "All five levels are already unlocked.";
    }

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
  }
}

const config = {
  type: Phaser.AUTO,
  parent: "game",
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: "#120d07",
  pixelArt: true,
  roundPixels: true,
  antialias: false,
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
