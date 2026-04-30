import {
  BUTTON_STYLE,
  COLORS,
  COLOR_VALUES,
  FONTS,
  GAME_HEIGHT,
  GAME_WIDTH,
  LABEL_STYLE,
  PYRAMID_TILEGROUND_KEY,
  RUIN_PLATFORM_FRAMES
} from '../config/constants.js';
import { playSoundCue } from '../systems/audio.js';
import { resetGameProgress } from '../state/progress.js';

// Reusable UI pieces: panels, text buttons, scene titles, and the new-game dialog.
export function createPanel(scene, x, y, width, height) {
  const panel = scene.add.graphics();

  panel.fillStyle(0x2c170b, 0.82);
  panel.fillRoundedRect(x, y, width, height, 10);
  panel.lineStyle(2, COLOR_VALUES.gold, 1);
  panel.strokeRoundedRect(x, y, width, height, 10);

  return panel;
}

export function getTextButtonPalette(variant) {
  if (variant === "danger") {
    return {
      top: 0x92512a,
      mid: 0x71301f,
      dark: 0x1b0905,
      hoverTop: 0xb56431,
      hoverMid: 0x8a3822,
      downTop: 0x5e2619,
      downMid: 0x451911,
      trim: 0xffc760,
      accent: 0xd97432,
      grain: 0x35110a,
      text: "#fff0bf",
      hoverText: "#ffe08a",
      downText: "#ffd06a"
    };
  }

  if (variant === "secondary") {
    return {
      top: 0x5c4129,
      mid: 0x49301f,
      dark: 0x180d08,
      hoverTop: 0x705034,
      hoverMid: 0x5a3a25,
      downTop: 0x3f291b,
      downMid: 0x2e1d13,
      trim: 0xb98d4b,
      accent: 0x7e5a34,
      grain: 0x24140b,
      text: COLORS.white,
      hoverText: "#fff3b4",
      downText: "#e8c981"
    };
  }

  return {
    top: 0x704020,
    mid: 0x5c3820,
    dark: 0x241109,
    hoverTop: 0x8a552d,
    hoverMid: 0x744226,
    downTop: 0x5b321c,
    downMid: 0x4a2817,
    trim: COLOR_VALUES.gold,
    accent: 0xb06f32,
    grain: 0x34180b,
    text: BUTTON_STYLE.color,
    hoverText: "#fff3b4",
    downText: "#f7d58a"
  };
}

export function paintTextButton(graphics, width, height, state = "normal", variant = "normal") {
  const isHover = state === "hover";
  const isDown = state === "down";
  const palette = getTextButtonPalette(variant);
  const topColor = isDown ? palette.downTop : isHover ? palette.hoverTop : palette.top;
  const midColor = isDown ? palette.downMid : isHover ? palette.hoverMid : palette.mid;
  const darkColor = isDown ? 0x1b0d07 : palette.dark;
  const goldAlpha = isHover ? 1 : 0.72;

  graphics.clear();
  graphics.fillStyle(0x090403, 0.62);
  graphics.fillRect(-width / 2 + 3, -height / 2 + 4, width, height);

  graphics.fillStyle(darkColor, 1);
  graphics.fillRect(-width / 2, -height / 2, width, height);
  graphics.fillStyle(topColor, 1);
  graphics.fillRect(-width / 2 + 4, -height / 2 + 4, width - 8, height - 8);
  graphics.fillStyle(midColor, 1);
  graphics.fillRect(-width / 2 + 4, -height / 2 + 12, width - 8, height - 16);

  graphics.fillStyle(palette.accent, isHover ? 0.44 : 0.28);
  for (let stripeX = -width / 2 + 12; stripeX < width / 2 - 8; stripeX += 16) {
    graphics.fillRect(stripeX, -height / 2 + 7, 9, 2);
  }

  graphics.fillStyle(palette.grain, 0.38);
  for (let grainX = -width / 2 + 10; grainX < width / 2 - 10; grainX += 18) {
    graphics.fillRect(grainX, height / 2 - 12, 10, 2);
  }

  graphics.fillStyle(palette.trim, goldAlpha);
  graphics.fillRect(-width / 2 + 6, -height / 2 + 5, width - 12, 2);
  graphics.fillRect(-width / 2 + 6, height / 2 - 7, width - 12, 2);
  graphics.fillRect(-width / 2 + 6, -height / 2 + 5, 2, 8);
  graphics.fillRect(width / 2 - 8, -height / 2 + 5, 2, 8);
  graphics.fillRect(-width / 2 + 6, height / 2 - 13, 2, 8);
  graphics.fillRect(width / 2 - 8, height / 2 - 13, 2, 8);

  graphics.fillStyle(0xfff3b4, isHover ? 0.45 : 0.16);
  graphics.fillRect(-width / 2 + 10, -height / 2 + 8, width - 20, 1);

  if (isHover) {
    graphics.fillStyle(0xffe08a, 0.82);
    graphics.fillTriangle(-width / 2 + 13, 0, -width / 2 + 23, -6, -width / 2 + 23, 6);
    graphics.fillTriangle(width / 2 - 13, 0, width / 2 - 23, -6, width / 2 - 23, 6);
  }
}

export function createTextButton(scene, x, y, label, onClick, width = 140, options = {}) {
  const height = 34;
  const variant = options.variant || "normal";
  const palette = getTextButtonPalette(variant);
  const button = scene.add.container(x, y);
  const background = scene.add.graphics();
  const hitZone = scene.add
    .zone(0, 0, width, height)
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });
  const text = scene.add
    .text(0, 0, label, {
      fontFamily: BUTTON_STYLE.fontFamily,
      fontSize: BUTTON_STYLE.fontSize,
      color: palette.text
    })
    .setOrigin(0.5)
    .setShadow(0, 2, "#1a0f08", 0, true, true);

  button.baseY = y;
  button.add([background, text, hitZone]);
  button.setSize(width, height);
  button.setDepth(40);

  paintTextButton(background, width, height, "normal", variant);

  const animateButton = (state) => {
    scene.tweens.killTweensOf(button);
    scene.tweens.killTweensOf(text);

    if (state === "hover") {
      paintTextButton(background, width, height, "hover", variant);
      text.setColor(palette.hoverText);
      scene.tweens.add({
        targets: button,
        y: button.baseY - 3,
        scaleX: 1.055,
        scaleY: 1.055,
        duration: 120,
        ease: "Back.Out"
      });
      scene.tweens.add({
        targets: text,
        y: -1,
        duration: 180,
        yoyo: true,
        repeat: -1,
        ease: "Sine.InOut"
      });
      return;
    }

    if (state === "down") {
      paintTextButton(background, width, height, "down", variant);
      text.setColor(palette.downText);
      scene.tweens.add({
        targets: button,
        y: button.baseY + 1,
        scaleX: 0.98,
        scaleY: 0.98,
        duration: 60,
        ease: "Quad.Out"
      });
      return;
    }

    paintTextButton(background, width, height, "normal", variant);
    text.setColor(palette.text);
    text.setY(0);
    scene.tweens.add({
      targets: button,
      y: button.baseY,
      scaleX: 1,
      scaleY: 1,
      duration: 110,
      ease: "Quad.Out"
    });
  };

  hitZone
    .on("pointerover", () => {
      animateButton("hover");
      playSoundCue(scene, "ui-hover");
    })
    .on("pointerout", () => {
      animateButton("normal");
    })
    .on("pointerdown", () => {
      playSoundCue(scene, "ui-click");
      animateButton("down");
      onClick();
    })
    .on("pointerup", () => {
      animateButton("hover");
    });

  return button;
}

export function createInfoButton(scene, x, y, onClick) {
  const size = 32;
  const button = scene.add.container(x, y).setDepth(42);
  const background = scene.add.graphics();
  const icon = scene.add
    .text(0.5, 0, "i", {
      fontFamily: '"Courier New", monospace',
      fontSize: "22px",
      fontStyle: "bold",
      color: COLORS.gold
    })
    .setOrigin(0.5)
    .setShadow(0, 2, "#120905", 0, true, true);
  const hitZone = scene.add
    .zone(0, 0, size, size)
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });

  const paint = (state = "normal") => {
    const isHover = state === "hover";
    const isDown = state === "down";
    const frameColor = isHover ? 0xffe08a : COLOR_VALUES.gold;
    const fillColor = isDown ? 0x3a1d0d : isHover ? 0x704020 : 0x4a2916;

    background.clear();
    background.fillStyle(0x090403, 0.68);
    background.fillRect(-size / 2 + 3, -size / 2 + 4, size, size);
    background.fillStyle(0x0d0603, 1);
    background.fillRect(-size / 2, -size / 2, size, size);
    background.fillStyle(fillColor, 1);
    background.fillRect(-size / 2 + 4, -size / 2 + 4, size - 8, size - 8);
    background.fillStyle(frameColor, 1);
    background.fillRect(-size / 2 + 5, -size / 2 + 3, size - 10, 2);
    background.fillRect(-size / 2 + 5, size / 2 - 5, size - 10, 2);
    background.fillRect(-size / 2 + 3, -size / 2 + 5, 2, size - 10);
    background.fillRect(size / 2 - 5, -size / 2 + 5, 2, size - 10);
    background.fillStyle(0xfff3b4, isHover ? 0.35 : 0.16);
    background.fillRect(-8, -10, 16, 1);
  };

  paint();
  button.add([background, icon, hitZone]);

  hitZone
    .on("pointerover", () => {
      paint("hover");
      button.setScale(1.08);
      icon.setColor("#fff3b4");
      playSoundCue(scene, "ui-hover");
    })
    .on("pointerout", () => {
      paint("normal");
      button.setScale(1);
      icon.setColor(COLORS.gold);
    })
    .on("pointerdown", () => {
      paint("down");
      button.setScale(0.96);
      playSoundCue(scene, "ui-click");
      onClick();
    })
    .on("pointerup", () => {
      paint("hover");
      button.setScale(1.08);
    });

  return button;
}

export function drawPixelDialogFrame(scene, x, y, width, height, depth = 90) {
  const graphics = scene.add.graphics().setDepth(depth);

  graphics.fillStyle(0x050201, 0.76);
  graphics.fillRect(x + 8, y + 8, width, height);

  graphics.fillStyle(0x0d0603, 1);
  graphics.fillRect(x, y, width, height);
  graphics.fillStyle(COLOR_VALUES.gold, 1);
  graphics.fillRect(x + 6, y, width - 12, 4);
  graphics.fillRect(x + 6, y + height - 4, width - 12, 4);
  graphics.fillRect(x, y + 6, 4, height - 12);
  graphics.fillRect(x + width - 4, y + 6, 4, height - 12);
  graphics.fillRect(x + 4, y + 4, 10, 10);
  graphics.fillRect(x + width - 14, y + 4, 10, 10);
  graphics.fillRect(x + 4, y + height - 14, 10, 10);
  graphics.fillRect(x + width - 14, y + height - 14, 10, 10);

  graphics.fillStyle(0x2a1409, 1);
  graphics.fillRect(x + 14, y + 14, width - 28, height - 28);
  graphics.fillStyle(0x170a05, 0.96);
  graphics.fillRect(x + 26, y + 64, width - 52, height - 112);

  graphics.fillStyle(0x32190c, 0.48);
  for (let tileY = y + 74; tileY < y + height - 74; tileY += 20) {
    for (let tileX = x + 38; tileX < x + width - 38; tileX += 48) {
      graphics.fillRect(tileX, tileY, 28, 1);
    }
  }

  graphics.fillStyle(0x6d4416, 1);
  graphics.fillRect(x + 18, y + 18, width - 36, 2);
  graphics.fillRect(x + 18, y + height - 20, width - 36, 2);

  graphics.fillStyle(COLOR_VALUES.gold, 0.28);
  for (let glyphX = x + 44; glyphX <= x + width - 54; glyphX += 46) {
    graphics.fillRect(glyphX, y + 30, 5, 5);
    graphics.fillRect(glyphX + 12, y + 32, 18, 2);
  }

  return graphics;
}

export function drawWarningGlyph(scene, x, y, depth = 94) {
  const graphics = scene.add.graphics().setDepth(depth);

  graphics.fillStyle(0x120905, 1);
  graphics.fillTriangle(x - 11, y + 9, x, y - 12, x + 11, y + 9);
  graphics.fillStyle(0xd06a2e, 1);
  graphics.fillTriangle(x - 9, y + 7, x, y - 9, x + 9, y + 7);
  graphics.fillStyle(0xffd37a, 1);
  graphics.fillRect(x - 1, y - 3, 2, 7);
  graphics.fillRect(x - 1, y + 6, 2, 2);

  return graphics;
}

export function showNewGameConfirmation(scene) {
  if (scene.newGameDialogObjects?.length) {
    return;
  }

  const panelWidth = 336;
  const panelHeight = 214;
  const panelX = (GAME_WIDTH - panelWidth) / 2;
  const panelY = (GAME_HEIGHT - panelHeight) / 2;
  const centerX = GAME_WIDTH / 2;
  const dialogObjects = [];
  const blocker = scene.add
    .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x070302, 0.72)
    .setDepth(80)
    .setInteractive();

  dialogObjects.push(blocker);
  dialogObjects.push(drawPixelDialogFrame(scene, panelX, panelY, panelWidth, panelHeight));

  const titlePlate = scene.add.graphics().setDepth(91);
  titlePlate.fillStyle(0x090403, 1);
  titlePlate.fillRect(centerX - 92, panelY + 20, 184, 40);
  titlePlate.fillStyle(0x5c3218, 1);
  titlePlate.fillRect(centerX - 84, panelY + 26, 168, 28);
  titlePlate.fillStyle(COLOR_VALUES.gold, 1);
  titlePlate.fillRect(centerX - 78, panelY + 29, 156, 3);
  titlePlate.fillRect(centerX - 78, panelY + 50, 156, 3);
  titlePlate.fillStyle(0xffefad, 0.34);
  titlePlate.fillRect(centerX - 68, panelY + 33, 136, 1);
  dialogObjects.push(titlePlate);

  const title = scene.add
    .text(centerX, panelY + 41, "New Game?", {
      fontFamily: FONTS.title,
      fontSize: "20px",
      color: COLORS.gold,
      stroke: "#120905",
      strokeThickness: 3
    })
    .setOrigin(0.5)
    .setDepth(94);

  const body = scene.add
    .text(
      centerX,
      panelY + 96,
      "Start over from Level 1?",
      {
        ...LABEL_STYLE,
        align: "center",
        fontSize: "13px",
        color: "#fff4d0",
        wordWrap: { width: 236, useAdvancedWrap: true }
      }
    )
    .setOrigin(0.5)
    .setDepth(94);

  const warningPlate = scene.add.graphics().setDepth(91);
  warningPlate.fillStyle(0x090403, 1);
  warningPlate.fillRect(centerX - 132, panelY + 124, 264, 34);
  warningPlate.fillStyle(0x3c1b0d, 1);
  warningPlate.fillRect(centerX - 126, panelY + 130, 252, 22);
  warningPlate.fillStyle(0x7a2d1a, 0.82);
  warningPlate.fillRect(centerX - 122, panelY + 134, 244, 14);
  warningPlate.fillStyle(COLOR_VALUES.gold, 0.74);
  warningPlate.fillRect(centerX - 118, panelY + 132, 236, 2);
  dialogObjects.push(warningPlate);
  dialogObjects.push(drawWarningGlyph(scene, centerX - 106, panelY + 141));

  const warning = scene.add
    .text(centerX + 16, panelY + 141, "All saved progress will be erased.", {
      fontFamily: FONTS.ui,
      fontSize: "10px",
      color: "#ffe09a"
    })
    .setOrigin(0.5)
    .setDepth(94);

  dialogObjects.push(title, body, warning);

  const closeDialog = () => {
    dialogObjects.forEach((object) => object.destroy());
    scene.newGameDialogObjects = [];
  };

  const okButton = createTextButton(scene, centerX - 68, panelY + 188, "Okay", () => {
    resetGameProgress(scene);
    closeDialog();
    scene.scene.start("LevelSelectScene");
  }, 112, { variant: "danger" }).setDepth(96);

  const cancelButton = createTextButton(
    scene,
    centerX + 68,
    panelY + 188,
    "Cancel",
    closeDialog,
    112,
    { variant: "secondary" }
  ).setDepth(96);

  dialogObjects.push(okButton, cancelButton);
  scene.newGameDialogObjects = dialogObjects;
}

function addDialogText(scene, objects, x, y, text, style = {}) {
  const textObject = scene.add
    .text(x, y, text, {
      fontFamily: FONTS.ui,
      fontSize: "10px",
      color: COLORS.white,
      lineSpacing: 3,
      wordWrap: { width: 250, useAdvancedWrap: true },
      ...style
    })
    .setOrigin(0, 0.5)
    .setDepth(95);

  objects.push(textObject);
  return textObject;
}

function drawInfoKeycap(scene, objects, x, y, label, width = 34) {
  const key = scene.add.graphics().setDepth(95);

  key.fillStyle(0x0d0603, 1);
  key.fillRect(x, y, width, 18);
  key.fillStyle(0x3a2415, 1);
  key.fillRect(x + 2, y + 2, width - 4, 14);
  key.fillStyle(COLOR_VALUES.gold, 1);
  key.fillRect(x + 3, y + 2, width - 6, 1);
  key.fillRect(x + 3, y + 15, width - 6, 1);
  key.lineStyle(1, 0x120905, 1);
  key.strokeRect(x, y, width, 18);

  const keyText = scene.add
    .text(x + width / 2, y + 9, label, {
      fontFamily: '"Courier New", monospace',
      fontSize: "11px",
      fontStyle: "bold",
      color: "#fff4d0"
    })
    .setOrigin(0.5)
    .setDepth(96);

  objects.push(key, keyText);
}

function drawInfoRuinLedge(scene, objects, x, y) {
  const graphics = scene.add.graphics().setDepth(95);

  // Small supports make the guide sample match the in-level ruin ledges better.
  graphics.fillStyle(0x3c2518, 0.88);
  graphics.fillRect(x - 19, y + 14, 9, 16);
  graphics.fillRect(x + 15, y + 14, 9, 16);
  graphics.fillStyle(COLORS.wallLight, 0.38);
  graphics.fillRect(x - 17, y + 17, 5, 10);
  graphics.fillRect(x + 17, y + 17, 5, 10);
  graphics.fillStyle(COLORS.bronzeDark, 0.9);
  graphics.fillRect(x - 21, y + 12, 13, 3);
  graphics.fillRect(x + 13, y + 12, 13, 3);
  graphics.fillRect(x - 21, y + 28, 13, 3);
  graphics.fillRect(x + 13, y + 28, 13, 3);

  graphics.fillStyle(0x3c2518, 0.82);
  graphics.fillRect(x - 28, y + 7, 64, 7);
  graphics.fillStyle(0x8b5630, 0.92);
  graphics.fillRect(x - 26, y + 5, 60, 7);
  graphics.lineStyle(1, 0x2c170b, 0.75);
  graphics.strokeRect(x - 27, y + 4, 62, 10);
  objects.push(graphics);

  if (!scene.textures.exists(PYRAMID_TILEGROUND_KEY)) {
    return;
  }

  [x - 20, x + 16].forEach((pillarX) => {
    objects.push(
      scene.add
        .image(pillarX, y + 12, PYRAMID_TILEGROUND_KEY, 22)
        .setOrigin(0)
        .setDepth(95)
    );
  });

  const frames = [
    RUIN_PLATFORM_FRAMES.left,
    RUIN_PLATFORM_FRAMES.middle,
    RUIN_PLATFORM_FRAMES.middle,
    RUIN_PLATFORM_FRAMES.right
  ];

  frames.forEach((frame, index) => {
    objects.push(
      scene.add
        .image(x - 28 + index * 16, y - 4, PYRAMID_TILEGROUND_KEY, frame)
        .setOrigin(0)
        .setDepth(96)
    );
  });
}

function drawInfoPillar(scene, objects, x, y) {
  if (scene.textures.exists(PYRAMID_TILEGROUND_KEY)) {
    [22, 34, 58].forEach((frame, index) => {
      objects.push(
        scene.add
          .image(x - 8, y - 21 + index * 13, PYRAMID_TILEGROUND_KEY, frame)
          .setOrigin(0)
          .setScale(0.82)
          .setDepth(96)
      );
    });
    return;
  }

  const pillar = scene.add.graphics().setDepth(95);

  pillar.fillStyle(0x2c170b, 0.74);
  pillar.fillRect(x - 11, y - 19, 22, 40);
  pillar.fillStyle(COLORS.wallMid, 1);
  pillar.fillRect(x - 7, y - 18, 14, 38);
  pillar.fillStyle(COLORS.wallLight, 0.45);
  pillar.fillRect(x - 4, y - 14, 4, 28);
  pillar.fillStyle(COLORS.bronzeDark, 1);
  pillar.fillRect(x - 11, y - 21, 22, 5);
  pillar.fillRect(x - 10, y + 17, 20, 5);
  pillar.fillStyle(COLOR_VALUES.gold, 0.46);
  pillar.fillRect(x - 5, y - 18, 10, 1);
  pillar.fillRect(x - 5, y + 14, 10, 1);
  pillar.lineStyle(1, COLORS.wallDark, 0.85);
  pillar.strokeRect(x - 7, y - 18, 14, 38);

  objects.push(pillar);
}

function drawInfoBlade(scene, objects, x, y) {
  const blade = scene.add.graphics().setDepth(96);

  blade.fillStyle(COLORS.metal, 1);
  blade.fillCircle(x, y, 12);
  blade.fillStyle(COLORS.metalDark, 1);
  blade.fillCircle(x, y, 3);
  blade.lineStyle(2, COLORS.metalDark, 1);

  for (let spoke = 0; spoke < 4; spoke += 1) {
    const angle = spoke * (Math.PI / 2) + 0.25;
    blade.lineBetween(
      x + Math.cos(angle) * 4,
      y + Math.sin(angle) * 4,
      x + Math.cos(angle) * 14,
      y + Math.sin(angle) * 14
    );
  }

  objects.push(blade);
}

function drawInfoMovingPlatform(scene, objects, x, y) {
  const platform = scene.add.graphics().setDepth(95);

  platform.fillStyle(0x2c170b, 0.78);
  platform.fillRect(x - 28, y + 7, 58, 6);
  platform.fillStyle(COLORS.sandDark, 1);
  platform.fillRoundedRect(x - 26, y, 54, 11, 2);
  platform.fillStyle(COLORS.sandLight, 0.9);
  platform.fillRect(x - 22, y + 2, 46, 3);
  platform.lineStyle(1, COLORS.bronzeDark, 0.9);
  platform.strokeRoundedRect(x - 26, y, 54, 11, 2);

  for (let grooveX = x - 16; grooveX < x + 22; grooveX += 14) {
    platform.lineBetween(grooveX, y + 2, grooveX - 4, y + 9);
  }

  objects.push(platform);
}

function drawInfoSealPlate(scene, objects, x, y) {
  const plate = scene.add.graphics().setDepth(95);

  plate.fillStyle(0xffe7a3, 0.18);
  plate.fillEllipse(x, y + 5, 48, 18);
  plate.fillStyle(0x2c170b, 0.78);
  plate.fillRoundedRect(x - 23, y + 5, 46, 5, 2);
  plate.fillStyle(0x6d4416, 1);
  plate.fillRoundedRect(x - 21, y - 2, 42, 10, 2);
  plate.fillStyle(0x2f7967, 1);
  plate.fillRoundedRect(x - 20, y - 1, 40, 8, 2);
  plate.lineStyle(1, 0x2c170b, 0.85);
  plate.strokeRoundedRect(x - 20, y - 1, 40, 8, 2);
  plate.fillStyle(COLOR_VALUES.gold, 1);
  plate.fillEllipse(x, y + 3, 8, 5);
  plate.fillRect(x - 1, y, 2, 6);
  plate.lineBetween(x - 13, y + 3, x + 13, y + 3);
  objects.push(plate);
}

function drawInfoStoneBlock(scene, objects, x, y) {
  const block = scene.add.graphics().setDepth(95);

  block.fillStyle(COLORS.stone, 1);
  block.fillRect(x - 11, y - 10, 22, 20);
  block.lineStyle(2, COLORS.wallDark, 0.95);
  block.strokeRect(x - 11, y - 10, 22, 20);
  block.lineStyle(1, COLOR_VALUES.gold, 0.82);
  block.strokeRect(x - 7, y - 6, 14, 12);
  block.fillStyle(COLOR_VALUES.gold, 0.94);
  block.fillEllipse(x, y, 8, 5);
  block.fillRect(x - 1, y - 6, 2, 12);
  block.lineStyle(1, COLORS.bronzeDark, 0.65);
  block.lineBetween(x - 7, y, x + 7, y);
  objects.push(block);
}

function drawInfoCrusher(scene, objects, x, y) {
  const crusher = scene.add.graphics().setDepth(95);

  crusher.fillStyle(COLORS.wallDark, 1);
  crusher.fillRect(x - 31, y - 22, 5, 39);
  crusher.fillRect(x + 26, y - 22, 5, 39);
  crusher.fillRect(x - 31, y - 22, 62, 6);
  crusher.fillStyle(COLORS.stone, 1);
  crusher.fillRect(x - 23, y - 12, 46, 20);
  crusher.fillStyle(COLORS.wallLight, 0.24);
  crusher.fillRect(x - 19, y - 8, 38, 5);
  crusher.lineStyle(2, COLORS.wallDark, 0.95);
  crusher.strokeRect(x - 23, y - 12, 46, 20);
  crusher.fillStyle(COLORS.danger, 0.65);
  crusher.fillRect(x - 18, y + 16, 36, 3);

  objects.push(crusher);
}

function drawInfoObjectSample(scene, objects, type, x, y) {
  if (type === "ledge") {
    drawInfoRuinLedge(scene, objects, x, y);
    return;
  }

  if (type === "pillar") {
    drawInfoPillar(scene, objects, x, y);
    return;
  }

  if (type === "blade") {
    drawInfoBlade(scene, objects, x, y);
    return;
  }

  if (type === "movingPlatform") {
    drawInfoMovingPlatform(scene, objects, x, y);
    return;
  }

  if (type === "seal") {
    drawInfoSealPlate(scene, objects, x, y);
    return;
  }

  if (type === "crusher") {
    drawInfoCrusher(scene, objects, x, y);
    return;
  }

  drawInfoStoneBlock(scene, objects, x, y);
}

function ensureGuideStyles() {
  if (document.getElementById("crab-guide-styles")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "crab-guide-styles";
  style.textContent = `
    .crab-guide-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      padding: 14px;
      background: rgba(7, 3, 2, 0.76);
      color: #fff8de;
      font-family: "Courier New", monospace;
      font-smooth: never;
      -webkit-font-smoothing: none;
      text-rendering: optimizeSpeed;
      user-select: none;
    }

    .crab-guide-overlay * {
      box-sizing: border-box;
      font-smooth: never;
      -webkit-font-smoothing: none;
      text-rendering: optimizeSpeed;
      letter-spacing: 0;
    }

    .crab-guide-header,
    .crab-guide-tab,
    .crab-guide-close,
    .crab-guide-label,
    .crab-guide-object-name,
    .crab-guide-copy,
    .crab-guide-key {
      text-transform: uppercase;
    }

    .crab-guide-panel {
      width: min(1140px, calc(100vw - 14px));
      height: min(650px, calc(100vh - 14px));
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      border: 10px solid #f3d36b;
      background:
        linear-gradient(rgba(109, 68, 22, 0.42) 3px, transparent 3px) 0 70px / 100% 58px,
        linear-gradient(90deg, rgba(109, 68, 22, 0.24) 3px, transparent 3px) 0 0 / 104px 100%,
        #170a05;
      box-shadow:
        0 0 0 12px #090403 inset,
        0 0 0 18px #2a1409 inset,
        14px 14px 0 rgba(0, 0, 0, 0.5);
    }

    .crab-guide-header {
      margin: 20px auto 16px;
      min-width: min(560px, calc(100% - 72px));
      padding: 12px 36px;
      border-top: 5px solid #f3d36b;
      border-bottom: 5px solid #f3d36b;
      background: #5c3218;
      color: #f3d36b;
      font-family: "Courier New", monospace;
      font-size: 56px;
      font-weight: 700;
      line-height: 1;
      text-align: center;
      text-shadow:
        3px 0 0 #120905,
        -3px 0 0 #120905,
        0 3px 0 #120905,
        3px 3px 0 #120905;
    }

    .crab-guide-tabs {
      display: flex;
      gap: 24px;
      justify-content: center;
      padding: 0 28px 16px;
      flex-wrap: wrap;
    }

    .crab-guide-tab,
    .crab-guide-close {
      min-width: 250px;
      border: 5px solid #b5782c;
      border-top-color: #e6c98a;
      border-bottom-color: #6d4416;
      background: #49301f;
      color: #fff4d0;
      padding: 15px 24px;
      font: 700 30px/1 "Courier New", monospace;
      text-shadow:
        2px 0 0 #120905,
        0 2px 0 #120905,
        2px 2px 0 #120905;
      cursor: pointer;
      box-shadow: 8px 8px 0 rgba(0, 0, 0, 0.38);
      image-rendering: pixelated;
    }

    .crab-guide-tab:hover,
    .crab-guide-close:hover,
    .crab-guide-tab.is-active {
      color: #ffe08a;
      border-color: #f3d36b;
      background: #5c3820;
    }

    .crab-guide-tab.is-active::after {
      content: "";
      display: block;
      height: 5px;
      margin: 10px 16px 0;
      background: #f3d36b;
    }

    .crab-guide-content {
      min-height: 0;
      flex: 1 1 auto;
      overflow-y: auto;
      margin: 0 44px;
      padding: 24px 30px 26px;
      border: 5px solid #2a1409;
      background: rgba(13, 6, 3, 0.78);
      scrollbar-color: #f3d36b #2a1409;
    }

    .crab-guide-controls,
    .crab-guide-objects {
      display: grid;
      gap: 22px;
    }

    .crab-guide-control-row {
      display: grid;
      grid-template-columns: 150px minmax(360px, 0.9fr) minmax(330px, 1.1fr);
      gap: 26px;
      align-items: center;
      min-height: 86px;
    }

    .crab-guide-object-row {
      display: grid;
      grid-template-columns: 164px 220px minmax(360px, 1fr);
      gap: 26px;
      align-items: center;
      min-height: 104px;
    }

    .crab-guide-label,
    .crab-guide-object-name {
      color: #f3d36b;
      font-size: 31px;
      font-weight: 700;
      font-family: "Courier New", monospace;
      line-height: 1.05;
      text-shadow:
        2px 0 0 #120905,
        0 2px 0 #120905,
        2px 2px 0 #120905;
    }

    .crab-guide-copy {
      color: #fff4d0;
      font-family: "Courier New", monospace;
      font-size: 28px;
      font-weight: 700;
      line-height: 1.28;
      text-shadow:
        2px 0 0 #120905,
        0 2px 0 #120905,
        2px 2px 0 #120905;
    }

    .crab-guide-key-row {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .crab-guide-key {
      min-width: 56px;
      box-sizing: border-box;
      border: 4px solid #b5782c;
      border-top-color: #f3d36b;
      border-bottom-color: #6d4416;
      background: #3a2415;
      color: #fff4d0;
      padding: 10px 14px 9px;
      font: 700 26px/1 "Courier New", monospace;
      text-align: center;
      text-shadow:
        2px 0 0 #120905,
        0 2px 0 #120905,
        2px 2px 0 #120905;
      box-shadow: 5px 5px 0 rgba(0, 0, 0, 0.38);
    }

    .crab-guide-object-canvas {
      width: 160px;
      height: 80px;
      image-rendering: pixelated;
      image-rendering: crisp-edges;
    }

    .crab-guide-footer {
      display: flex;
      justify-content: center;
      padding: 18px 28px 24px;
    }

    @media (max-width: 720px) {
      .crab-guide-panel {
        width: calc(100vw - 12px);
        height: calc(100vh - 12px);
      }

      .crab-guide-header {
        margin-top: 16px;
        min-width: min(360px, calc(100% - 44px));
        font-size: 38px;
      }

      .crab-guide-content {
        margin: 0 18px;
        padding: 18px;
      }

      .crab-guide-control-row,
      .crab-guide-object-row {
        grid-template-columns: 1fr;
        gap: 12px;
      }

      .crab-guide-tab,
      .crab-guide-close {
        min-width: 180px;
        font-size: 24px;
      }

      .crab-guide-label,
      .crab-guide-object-name {
        font-size: 27px;
      }

      .crab-guide-copy {
        font-size: 24px;
      }

      .crab-guide-key {
        font-size: 22px;
      }
    }
  `;

  document.head.appendChild(style);
}

function createGuideElement(tagName, className, text = "") {
  const element = document.createElement(tagName);
  element.className = className;

  if (text) {
    element.textContent = text;
  }

  return element;
}

function createGuideKey(label) {
  return createGuideElement("span", "crab-guide-key", label);
}

function drawGuideTileFrame(scene, context, frameKey, x, y, scale = 2) {
  if (!scene.textures.exists(PYRAMID_TILEGROUND_KEY)) {
    return false;
  }

  const frame = scene.textures.getFrame(PYRAMID_TILEGROUND_KEY, frameKey);

  if (!frame?.source?.image) {
    return false;
  }

  context.drawImage(
    frame.source.image,
    frame.cutX,
    frame.cutY,
    frame.cutWidth,
    frame.cutHeight,
    x,
    y,
    frame.cutWidth * scale,
    frame.cutHeight * scale
  );

  return true;
}

function drawGuideObjectCanvas(scene, type) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = 64;
  canvas.height = 32;
  canvas.className = "crab-guide-object-canvas";
  context.imageSmoothingEnabled = false;

  context.clearRect(0, 0, canvas.width, canvas.height);

  if (type === "ledge") {
    context.fillStyle = "#3c2518";
    context.fillRect(4, 21, 56, 5);
    context.fillStyle = "#8b5630";
    context.fillRect(6, 18, 52, 5);

    const frames = [
      RUIN_PLATFORM_FRAMES.left,
      RUIN_PLATFORM_FRAMES.middle,
      RUIN_PLATFORM_FRAMES.middle,
      RUIN_PLATFORM_FRAMES.right
    ];
    const drewTiles = frames.every((frame, index) => (
      drawGuideTileFrame(scene, context, frame, index * 16, 5, 1)
    ));

    if (!drewTiles) {
      context.fillStyle = "#c48a42";
      for (let x = 4; x < 60; x += 14) {
        context.fillRect(x, 8, 12, 9);
        context.strokeStyle = "#6d4416";
        context.strokeRect(x, 8, 12, 9);
      }
    }
  } else if (type === "blade") {
    context.fillStyle = "#c2ced7";
    context.strokeStyle = "#58656d";
    context.lineWidth = 2;
    context.beginPath();
    context.arc(32, 16, 12, 0, Math.PI * 2);
    context.fill();
    context.stroke();

    for (let spoke = 0; spoke < 4; spoke += 1) {
      const angle = spoke * (Math.PI / 2);

      context.beginPath();
      context.moveTo(32 + Math.cos(angle) * 4, 16 + Math.sin(angle) * 4);
      context.lineTo(32 + Math.cos(angle) * 15, 16 + Math.sin(angle) * 15);
      context.stroke();
    }

    context.fillStyle = "#58656d";
    context.fillRect(30, 14, 4, 4);
    context.fillStyle = "#eef5f8";
    context.fillRect(24, 10, 4, 4);
    context.fillRect(38, 20, 4, 4);
  } else if (type === "movingPlatform") {
    context.fillStyle = "#2c170b";
    context.fillRect(9, 20, 46, 5);
    context.fillStyle = "#7a5326";
    context.fillRect(11, 13, 42, 9);
    context.fillStyle = "#e6c98a";
    context.fillRect(15, 15, 34, 2);
    context.strokeStyle = "#6d4416";
    context.lineWidth = 1;
    context.strokeRect(11, 13, 42, 9);
    for (let x = 18; x < 48; x += 12) {
      context.strokeStyle = "#6d4416";
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(x, 15);
      context.lineTo(x - 4, 21);
      context.stroke();
    }
  } else if (type === "seal") {
    context.fillStyle = "rgba(255, 231, 163, 0.22)";
    context.beginPath();
    context.ellipse(32, 17, 23, 8, 0, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#2c170b";
    context.fillRect(10, 18, 44, 5);
    context.fillStyle = "#6d4416";
    context.fillRect(12, 11, 40, 9);
    context.fillStyle = "#2f7967";
    context.fillRect(14, 12, 36, 7);
    context.strokeStyle = "#2c170b";
    context.lineWidth = 1;
    context.strokeRect(14, 12, 36, 7);
    context.fillStyle = "#f3d36b";
    context.fillRect(31, 13, 2, 6);
    context.fillRect(21, 15, 22, 2);
  } else {
    context.fillStyle = "#6f5a49";
    context.fillRect(22, 7, 20, 19);
    context.strokeStyle = "#24150c";
    context.lineWidth = 2;
    context.strokeRect(22, 7, 20, 19);
    context.strokeStyle = "#f3d36b";
    context.lineWidth = 1;
    context.strokeRect(26, 11, 12, 11);
    context.fillStyle = "#f3d36b";
    context.fillRect(31, 12, 2, 9);
    context.fillRect(27, 15, 10, 2);
  }

  return canvas;
}

function createControlRow(label, keys, description) {
  const row = createGuideElement("div", "crab-guide-control-row");
  const labelElement = createGuideElement("div", "crab-guide-label", label);
  const keyRow = createGuideElement("div", "crab-guide-key-row");
  const copy = createGuideElement("div", "crab-guide-copy", description);

  keys.forEach((key) => {
    keyRow.appendChild(createGuideKey(key));
  });

  row.append(labelElement, keyRow, copy);
  return row;
}

function createObjectRow(scene, type, name, description) {
  const row = createGuideElement("div", "crab-guide-object-row");
  const canvas = drawGuideObjectCanvas(scene, type);
  const nameElement = createGuideElement("div", "crab-guide-object-name", name);
  const copy = createGuideElement("div", "crab-guide-copy", description);

  row.append(canvas, nameElement, copy);
  return row;
}

export function showInfoDialog(scene) {
  if (scene.infoDialogObjects?.length) {
    return;
  }

  const panelWidth = 456;
  const panelHeight = 254;
  const panelX = (GAME_WIDTH - panelWidth) / 2;
  const panelY = (GAME_HEIGHT - panelHeight) / 2;
  const centerX = GAME_WIDTH / 2;
  const dialogObjects = [];
  let contentObjects = [];
  let activeTab = "controls";
  let objectScroll = 0;
  const contentBounds = {
    x: panelX + 28,
    y: panelY + 105,
    width: panelWidth - 56,
    height: 112
  };
  const controlRows = [
    ["Move", ["A", "D", "Left", "Right"], "Move left and right."],
    ["Jump", ["W", "Up", "Space"], "Jump from floor or platform."],
    ["Pause", ["Esc"], "Open settings, resume, or level select."]
  ];
  const objectRows = [
    ["ledge", "Ruin Ledge", "Solid stone platform. Stand on it, jump from it."],
    ["pillar", "Pillar", "Tall stone support. It blocks paths and gives ledges structure."],
    ["blade", "Blade", "Moving metal hazard. Touching it restarts the room."],
    ["crusher", "Crusher", "Timed stone press. Move through after it rises."],
    ["movingPlatform", "Moving Platform", "Ride it across gaps or up shafts."],
    ["seal", "Seal Plate", "Wake enough seals to open locked chamber doors."],
    ["block", "Stone Block", "Push it onto box-only seals or use it as a step."]
  ];

  const blocker = scene.add
    .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x070302, 0.72)
    .setDepth(80)
    .setInteractive();

  dialogObjects.push(blocker);
  dialogObjects.push(drawPixelDialogFrame(scene, panelX, panelY, panelWidth, panelHeight));

  const titlePlate = scene.add.graphics().setDepth(91);
  titlePlate.fillStyle(0x090403, 1);
  titlePlate.fillRect(centerX - 112, panelY + 18, 224, 42);
  titlePlate.fillStyle(0x5c3218, 1);
  titlePlate.fillRect(centerX - 104, panelY + 24, 208, 30);
  titlePlate.fillStyle(COLOR_VALUES.gold, 1);
  titlePlate.fillRect(centerX - 98, panelY + 27, 196, 3);
  titlePlate.fillRect(centerX - 98, panelY + 51, 196, 3);
  titlePlate.fillStyle(0xffefad, 0.34);
  titlePlate.fillRect(centerX - 86, panelY + 32, 172, 1);
  dialogObjects.push(titlePlate);

  const title = scene.add
    .text(centerX, panelY + 40, "Field Guide", {
      fontFamily: FONTS.title,
      fontSize: "22px",
      color: COLORS.gold,
      stroke: "#120905",
      strokeThickness: 4
    })
    .setOrigin(0.5)
    .setDepth(94);
  dialogObjects.push(title);

  const contentFrame = scene.add.graphics().setDepth(91);
  contentFrame.fillStyle(0x090403, 1);
  contentFrame.fillRect(contentBounds.x - 4, contentBounds.y - 4, contentBounds.width + 8, contentBounds.height + 8);
  contentFrame.fillStyle(0x0d0603, 0.96);
  contentFrame.fillRect(contentBounds.x, contentBounds.y, contentBounds.width, contentBounds.height);
  contentFrame.lineStyle(2, 0x2a1409, 1);
  contentFrame.strokeRect(contentBounds.x, contentBounds.y, contentBounds.width, contentBounds.height);
  dialogObjects.push(contentFrame);

  const contentMaskGraphics = scene.make.graphics({ add: false });
  contentMaskGraphics.fillStyle(0xffffff, 1);
  contentMaskGraphics.fillRect(
    contentBounds.x + 2,
    contentBounds.y + 2,
    contentBounds.width - 4,
    contentBounds.height - 4
  );
  const contentMask = contentMaskGraphics.createGeometryMask();

  const createTabButton = (x, y, width, label, tab) => {
    const height = 30;
    const tabButton = scene.add.container(x, y).setDepth(96);
    const background = scene.add.graphics();
    const text = scene.add
      .text(0, 0, label, {
        fontFamily: FONTS.ui,
        fontSize: "13px",
        color: "#fff4d0",
        fontStyle: "bold"
      })
      .setOrigin(0.5)
      .setShadow(0, 2, "#120905", 0, true, true);
    const hitZone = scene.add
      .zone(0, 0, width, height)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const paint = (isActive, isHover = false) => {
      background.clear();
      background.fillStyle(0x090403, 1);
      background.fillRect(-width / 2 + 4, -height / 2 + 5, width, height);
      background.fillStyle(isActive ? 0x5c3820 : isHover ? 0x614026 : 0x49301f, 1);
      background.fillRect(-width / 2, -height / 2, width, height);
      background.fillStyle(isActive ? COLOR_VALUES.gold : 0xb5782c, 1);
      background.fillRect(-width / 2, -height / 2, width, 3);
      background.fillRect(-width / 2, height / 2 - 3, width, 3);
      background.fillRect(-width / 2, -height / 2, 3, height);
      background.fillRect(width / 2 - 3, -height / 2, 3, height);

      if (isActive) {
        background.fillRect(-width / 2 + 22, height / 2 - 9, width - 44, 2);
      }

      text.setColor(isActive || isHover ? "#ffe08a" : "#fff4d0");
    };

    tabButton.paint = paint;
    tabButton.add([background, text, hitZone]);
    tabButton.setSize(width, height);
    paint(tab === activeTab);

    hitZone
      .on("pointerover", () => {
        paint(tab === activeTab, true);
        playSoundCue(scene, "ui-hover");
      })
      .on("pointerout", () => {
        paint(tab === activeTab);
      })
      .on("pointerdown", () => {
        playSoundCue(scene, "ui-click");
        switchTab(tab);
      });

    dialogObjects.push(tabButton);
    return tabButton;
  };

  const controlsTab = createTabButton(centerX - 76, panelY + 78, 126, "Controls", "controls");
  const objectsTab = createTabButton(centerX + 86, panelY + 78, 150, "Game Objects", "objects");

  const clearContent = () => {
    contentObjects.forEach((object) => object.destroy());
    contentObjects = [];
  };
  const addContentText = (x, y, text, style = {}) => (
    addDialogText(scene, contentObjects, x, y, text, {
      fontSize: "12px",
      color: "#fff4d0",
      wordWrap: { width: 144, useAdvancedWrap: true },
      ...style
    })
  );
  const objectRowHeight = 56;
  const getObjectMaxScroll = () => Math.max(0, objectRows.length * objectRowHeight - (contentBounds.height - 12));
  const drawControls = () => {
    const rowGap = 34;

    controlRows.forEach(([label, keys, copy], index) => {
      const y = contentBounds.y + 19 + index * rowGap;
      let keyX = contentBounds.x + 100;

      addContentText(contentBounds.x + 14, y, label, {
        fontSize: "13px",
        color: COLORS.gold,
        fontStyle: "bold",
        wordWrap: { width: 60, useAdvancedWrap: true }
      });
      keys.forEach((key) => {
        const keyWidth = key.length > 4 ? 44 : key.length > 2 ? 34 : 26;

        drawInfoKeycap(scene, contentObjects, keyX, y - 9, key, keyWidth);
        keyX += keyWidth + 7;
      });
      addContentText(contentBounds.x + 260, y, copy, {
        fontSize: "11px",
        wordWrap: { width: 138, useAdvancedWrap: true }
      });
    });
  };
  const drawObjectScrollbar = () => {
    const maxScroll = getObjectMaxScroll();

    if (maxScroll <= 0) {
      return;
    }

    const trackX = contentBounds.x + contentBounds.width - 9;
    const trackY = contentBounds.y + 8;
    const trackHeight = contentBounds.height - 16;
    const thumbHeight = Math.max(18, Math.floor((contentBounds.height / (objectRows.length * objectRowHeight)) * trackHeight));
    const thumbY = trackY + Math.floor((objectScroll / maxScroll) * (trackHeight - thumbHeight));
    const scrollGraphics = scene.add.graphics().setDepth(96);

    scrollGraphics.fillStyle(0x6d4416, 1);
    scrollGraphics.fillRect(trackX, trackY, 4, trackHeight);
    scrollGraphics.fillStyle(COLOR_VALUES.gold, 1);
    scrollGraphics.fillRect(trackX, thumbY, 4, thumbHeight);
    scrollGraphics.fillTriangle(trackX + 2, trackY - 6, trackX - 2, trackY - 1, trackX + 6, trackY - 1);
    scrollGraphics.fillTriangle(trackX + 2, trackY + trackHeight + 6, trackX - 2, trackY + trackHeight + 1, trackX + 6, trackY + trackHeight + 1);
    contentObjects.push(scrollGraphics);
  };
  const drawObjects = () => {
    objectRows.forEach(([type, name, description], index) => {
      const y = contentBounds.y + 20 + index * objectRowHeight - objectScroll;

      if (y < contentBounds.y + 10 || y > contentBounds.y + contentBounds.height - 14) {
        return;
      }

      drawInfoObjectSample(scene, contentObjects, type, contentBounds.x + 46, y);
      addContentText(contentBounds.x + 92, y, name, {
        fontSize: "12px",
        color: COLORS.gold,
        fontStyle: "bold",
        wordWrap: { width: 76, useAdvancedWrap: true }
      });
      addContentText(contentBounds.x + 184, y, description, {
        fontSize: "11px",
        wordWrap: { width: 198, useAdvancedWrap: true }
      });
    });

    drawObjectScrollbar();
  };
  const renderContent = () => {
    clearContent();
    controlsTab.paint(activeTab === "controls");
    objectsTab.paint(activeTab === "objects");

    if (activeTab === "controls") {
      drawControls();
    } else {
      objectScroll = Phaser.Math.Clamp(objectScroll, 0, getObjectMaxScroll());
      drawObjects();
    }

    contentObjects.forEach((object) => {
      object.setMask(contentMask);
    });
  };
  function switchTab(tab) {
    activeTab = tab;
    objectScroll = 0;
    renderContent();
  }

  const handleWheel = (_pointer, _gameObjects, _deltaX, deltaY) => {
    if (activeTab !== "objects") {
      return;
    }

    const maxScroll = getObjectMaxScroll();

    if (maxScroll <= 0) {
      return;
    }

    objectScroll = Phaser.Math.Clamp(objectScroll + Math.sign(deltaY) * 18, 0, maxScroll);
    renderContent();
  };
  const handleEscape = () => {
    playSoundCue(scene, "ui-click");
    closeDialog();
  };
  const closeDialog = () => {
    scene.input.off("wheel", handleWheel);
    scene.input.keyboard?.off("keydown-ESC", handleEscape);
    scene.events.off("shutdown", closeDialog);
    contentObjects.forEach((object) => object.destroy());
    dialogObjects.forEach((object) => object.destroy());
    contentMask.destroy();
    contentMaskGraphics.destroy();
    scene.infoDialogObjects = [];
  };
  const closeButton = createTextButton(scene, centerX, panelY + 236, "Close", closeDialog, 126)
    .setDepth(96);

  dialogObjects.push(closeButton);
  scene.infoDialogObjects = dialogObjects;
  scene.input.on("wheel", handleWheel);
  scene.input.keyboard?.on("keydown-ESC", handleEscape);
  scene.events.once("shutdown", closeDialog);
  renderContent();
}

function drawGuidePanel(context) {
  context.fillStyle = "#090403";
  context.fillRect(12, 10, 456, 250);
  context.fillStyle = "#f3d36b";
  context.fillRect(15, 13, 450, 244);
  context.fillStyle = "#170a05";
  context.fillRect(20, 18, 440, 234);

  context.strokeStyle = "#3a1d0d";
  context.lineWidth = 1;
  for (let x = 20; x <= 460; x += 48) {
    context.beginPath();
    context.moveTo(x, 18);
    context.lineTo(x, 252);
    context.stroke();
  }
  for (let y = 40; y <= 244; y += 28) {
    context.beginPath();
    context.moveTo(20, y);
    context.lineTo(460, y);
    context.stroke();
  }
}

function drawGuideTitle(context) {
  context.fillStyle = "#5c3218";
  context.fillRect(132, 22, 216, 32);
  context.fillStyle = "#f3d36b";
  context.fillRect(132, 22, 216, 2);
  context.fillRect(132, 52, 216, 2);
  drawCenteredGuideText(context, "FIELD GUIDE", 240, 39, 15, COLORS.gold);
}

function drawGuideTab(context, rect, label, isActive) {
  context.fillStyle = "#090403";
  context.fillRect(rect.x + 3, rect.y + 3, rect.width, rect.height);
  context.fillStyle = isActive ? "#5c3820" : "#49301f";
  context.fillRect(rect.x, rect.y, rect.width, rect.height);
  context.fillStyle = isActive ? "#f3d36b" : "#b5782c";
  context.fillRect(rect.x, rect.y, rect.width, 2);
  context.fillRect(rect.x, rect.y + rect.height - 2, rect.width, 2);
  context.fillRect(rect.x, rect.y, 2, rect.height);
  context.fillRect(rect.x + rect.width - 2, rect.y, 2, rect.height);
  drawCenteredGuideText(context, label, rect.x + rect.width / 2, rect.y + 13, 8, isActive ? COLORS.gold : COLORS.white);

  if (isActive) {
    context.fillStyle = "#f3d36b";
    context.fillRect(rect.x + 18, rect.y + rect.height - 7, rect.width - 36, 2);
  }
}

function drawGuideContentFrame(context, rect) {
  context.fillStyle = "#0d0603";
  context.fillRect(rect.x, rect.y, rect.width, rect.height);
  context.strokeStyle = "#2a1409";
  context.lineWidth = 2;
  context.strokeRect(rect.x, rect.y, rect.width, rect.height);
}

function drawGuideText(context, text, x, y, size = 9, color = COLORS.white) {
  context.font = `bold ${size}px "Courier New", monospace`;
  context.textBaseline = "middle";
  context.fillStyle = "#120905";
  context.fillText(text, x + 1, y + 1);
  context.fillStyle = color;
  context.fillText(text, x, y);
}

function drawCenteredGuideText(context, text, x, y, size = 9, color = COLORS.white) {
  context.font = `bold ${size}px "Courier New", monospace`;
  context.textBaseline = "middle";
  context.textAlign = "center";
  context.fillStyle = "#120905";
  context.fillText(text, x + 1, y + 1);
  context.fillStyle = color;
  context.fillText(text, x, y);
  context.textAlign = "start";
}

function drawWrappedGuideText(context, text, x, y, maxWidth, size = 8, color = COLORS.white) {
  const words = text.split(" ");
  const lines = [];
  let line = "";

  context.font = `bold ${size}px "Courier New", monospace`;

  words.forEach((word) => {
    const testLine = line ? `${line} ${word}` : word;

    if (context.measureText(testLine).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = testLine;
    }
  });
  lines.push(line);

  lines.forEach((wrappedLine, index) => {
    drawGuideText(context, wrappedLine, x, y + index * (size + 3), size, color);
  });
}

function drawGuideKeycap(context, x, y, width, label) {
  context.fillStyle = "#090403";
  context.fillRect(x + 2, y + 2, width, 17);
  context.fillStyle = "#3a2415";
  context.fillRect(x, y, width, 17);
  context.fillStyle = "#f3d36b";
  context.fillRect(x + 2, y + 2, width - 4, 2);
  context.fillRect(x + 2, y + 14, width - 4, 2);
  drawCenteredGuideText(context, label, x + width / 2, y + 9, 7, COLORS.white);
}

function drawGuideObjectSample(context, scene, type, x, y) {
  context.save();

  if (type === "ledge") {
    context.fillStyle = "#3c2518";
    context.fillRect(x - 30, y + 6, 60, 5);
    context.fillStyle = "#8b5630";
    context.fillRect(x - 28, y + 3, 56, 5);

    const frames = [
      RUIN_PLATFORM_FRAMES.left,
      RUIN_PLATFORM_FRAMES.middle,
      RUIN_PLATFORM_FRAMES.middle,
      RUIN_PLATFORM_FRAMES.right
    ];
    const drewTiles = frames.every((frame, index) => (
      drawGuideTileFrame(scene, context, frame, x - 32 + index * 16, y - 10, 1)
    ));

    if (!drewTiles) {
      context.fillStyle = "#c48a42";
      context.fillRect(x - 30, y - 8, 60, 12);
    }
  } else if (type === "blade") {
    context.fillStyle = "#c2ced7";
    context.strokeStyle = "#58656d";
    context.lineWidth = 2;
    context.beginPath();
    context.arc(x, y, 10, 0, Math.PI * 2);
    context.fill();
    context.stroke();

    for (let spoke = 0; spoke < 4; spoke += 1) {
      const angle = spoke * (Math.PI / 2);

      context.beginPath();
      context.moveTo(x + Math.cos(angle) * 3, y + Math.sin(angle) * 3);
      context.lineTo(x + Math.cos(angle) * 12, y + Math.sin(angle) * 12);
      context.stroke();
    }

    context.fillStyle = "#58656d";
    context.fillRect(x - 2, y - 2, 4, 4);
  } else if (type === "movingPlatform") {
    context.fillStyle = "#2c170b";
    context.fillRect(x - 24, y + 7, 48, 5);
    context.fillStyle = "#7a5326";
    context.fillRect(x - 22, y, 44, 10);
    context.fillStyle = "#e6c98a";
    context.fillRect(x - 18, y + 2, 36, 2);
    context.strokeStyle = "#6d4416";
    context.strokeRect(x - 22, y, 44, 10);
  } else if (type === "seal") {
    context.fillStyle = "#2c170b";
    context.fillRect(x - 24, y + 6, 48, 6);
    context.fillStyle = "#6d4416";
    context.fillRect(x - 22, y - 3, 44, 11);
    context.fillStyle = "#2f7967";
    context.fillRect(x - 18, y - 1, 36, 7);
    context.fillStyle = "#f3d36b";
    context.fillRect(x - 1, y, 2, 6);
    context.fillRect(x - 10, y + 2, 20, 2);
  } else {
    context.fillStyle = "#6f5a49";
    context.fillRect(x - 10, y - 12, 20, 20);
    context.strokeStyle = "#24150c";
    context.lineWidth = 2;
    context.strokeRect(x - 10, y - 12, 20, 20);
    context.strokeStyle = "#f3d36b";
    context.lineWidth = 1;
    context.strokeRect(x - 6, y - 8, 12, 12);
    context.fillStyle = "#f3d36b";
    context.fillRect(x - 1, y - 7, 2, 10);
    context.fillRect(x - 6, y - 3, 12, 2);
  }

  context.restore();
}

export function createPapyrusActionText(scene, x, y, label, onClick, hitWidth = 130) {
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

export function addSceneTitle(scene, title, subtitle = "", subtitleY = 62) {
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

export function addCrtOverlay(scene) {
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

