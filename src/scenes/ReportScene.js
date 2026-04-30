import Phaser from 'phaser';
import { FONTS, GAME_WIDTH } from '../config/constants.js';
import { getCurrentLevel, getRomanNumeral, getSelectedLevelIndex } from '../state/progress.js';
import { addCrtOverlay, createPapyrusActionText } from '../ui/buttons.js';
import { drawReportParchment } from '../ui/backgrounds.js';

// Report scene: a short narrative pause before the selected chamber starts.
export class ReportScene extends Phaser.Scene {
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

