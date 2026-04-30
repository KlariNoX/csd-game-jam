import Phaser from 'phaser';
import { COLORS, COLOR_VALUES, FONTS, TOTAL_LEVELS } from '../config/constants.js';
import { EXIT_POINT } from '../data/levelMap.js';
import { playSoundCue } from '../systems/audio.js';
import { getRomanNumeral, selectLevel } from '../state/progress.js';
import { playEndingStoryboardThenStartWin } from '../storyboard.js';

// Map widgets for the level-select screen: route dashes, nodes, locks, and final exit.
export function drawDashedLine(scene, startX, startY, endX, endY, color, alpha = 1) {
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

export function drawLevelSelectExit(scene, unlocked = false) {
  const graphics = scene.add.graphics();
  const exitOuterRadius = 18;
  const exitInnerRadius = 10;
  const shaftX = EXIT_POINT.x;
  const shaftY = EXIT_POINT.y;

  graphics.fillStyle(COLORS.wallDark, 0.96);
  graphics.fillCircle(shaftX, shaftY, exitOuterRadius);
  graphics.fillStyle(COLORS.waterDeep, 1);
  graphics.fillCircle(shaftX, shaftY, exitInnerRadius);
  graphics.lineStyle(2, COLOR_VALUES.gold, 1);
  graphics.strokeCircle(shaftX, shaftY, exitOuterRadius);
  graphics.lineStyle(1, 0xfff4c7, 0.7);
  graphics.strokeCircle(shaftX, shaftY, exitInnerRadius + 4);

  scene.add
    .text(shaftX, shaftY - 28, "EXIT SHAFT", {
      fontFamily: FONTS.ui,
      fontSize: "11px",
      color: unlocked ? COLORS.white : "#b59a7b"
    })
    .setOrigin(0.5)
    .setDepth(12);

  if (!unlocked) {
    return;
  }

  const hitZone = scene.add
    .zone(shaftX, shaftY, exitOuterRadius * 2 + 10, exitOuterRadius * 2 + 10)
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
    .setDepth(13);

  hitZone
    .on("pointerover", () => {
      graphics.clear();
      graphics.fillStyle(0x090403, 0.65);
      graphics.fillCircle(shaftX + 2, shaftY + 2, exitOuterRadius + 2);
      graphics.fillStyle(COLORS.wallDark, 0.96);
      graphics.fillCircle(shaftX, shaftY, exitOuterRadius + 2);
      graphics.fillStyle(COLORS.waterDeep, 1);
      graphics.fillCircle(shaftX, shaftY, exitInnerRadius + 1);
      graphics.lineStyle(2, 0xfff4c7, 1);
      graphics.strokeCircle(shaftX, shaftY, exitOuterRadius + 2);
      graphics.lineStyle(1, COLOR_VALUES.gold, 1);
      graphics.strokeCircle(shaftX, shaftY, exitInnerRadius + 5);
      playSoundCue(scene, "ui-hover");
    })
    .on("pointerout", () => {
      graphics.clear();
      graphics.fillStyle(COLORS.wallDark, 0.96);
      graphics.fillCircle(shaftX, shaftY, exitOuterRadius);
      graphics.fillStyle(COLORS.waterDeep, 1);
      graphics.fillCircle(shaftX, shaftY, exitInnerRadius);
      graphics.lineStyle(2, COLOR_VALUES.gold, 1);
      graphics.strokeCircle(shaftX, shaftY, exitOuterRadius);
      graphics.lineStyle(1, 0xfff4c7, 0.7);
      graphics.strokeCircle(shaftX, shaftY, exitInnerRadius + 4);
    })
    .on("pointerdown", () => {
      playSoundCue(scene, "ui-click");
      selectLevel(scene, TOTAL_LEVELS - 1);
      playEndingStoryboardThenStartWin(scene);
    });
}

export function createLockIcon(scene) {
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

export function createLevelNode(scene, x, y, levelIndex, unlocked, onSelect) {
  const node = scene.add.container(x, y);
  const outerColor = unlocked ? COLOR_VALUES.gold : COLORS.locked;
  const innerColor = unlocked ? COLORS.sandLight : COLORS.stone;
  const shadow = scene.add.circle(3, 3, 17, 0x090403, 0.68);
  const outerRing = scene.add.circle(0, 0, 16, outerColor);
  const innerDot = scene.add.circle(0, 0, 8, innerColor);

  outerRing.setStrokeStyle(2, unlocked ? 0xb5782c : 0x87694d);
  innerDot.setStrokeStyle(1, unlocked ? 0xc48a42 : 0x5d4127);

  node.add([shadow, outerRing, innerDot]);

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

