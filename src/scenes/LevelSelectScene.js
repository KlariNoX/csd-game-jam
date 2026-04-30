import Phaser from 'phaser';
import { COLORS, COLOR_VALUES, FONTS, GAME_WIDTH, LABEL_STYLE, LEVEL_SELECT_BACKGROUND_KEY, TOTAL_LEVELS } from '../config/constants.js';
import { LEVEL_SELECT_BACKGROUND_URL } from '../config/assets.js';
import { EXIT_POINT, LEVEL_LABEL_OFFSETS, LEVEL_NODE_POSITIONS, LEVEL_ROUTE_ACTIVE_SEGMENT_COUNTS, LEVEL_ROUTE_POINTS } from '../data/levelMap.js';
import { playBackgroundMusic } from '../systems/audio.js';
import { getHighestUnlockedLevel, isLevelUnlocked, selectLevel } from '../state/progress.js';
import { addCrtOverlay, addSceneTitle, createPanel, createTextButton } from '../ui/buttons.js';
import { addLevelSelectBackground, preloadImageIfNeeded } from '../ui/backgrounds.js';
import { createLevelNode, drawDashedLine, drawLevelSelectExit } from '../ui/levelSelectMap.js';

// Level select scene: shows progress, selectable chambers, and the final exit route.
export class LevelSelectScene extends Phaser.Scene {
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
    drawLevelSelectExit(this, highestUnlockedLevel === TOTAL_LEVELS);
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

      drawDashedLine(this, start.x, start.y, end.x, end.y, COLOR_VALUES.gold, 0.95);
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

