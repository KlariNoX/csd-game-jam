import Phaser from 'phaser';
import { COLORS, CRAB_IDLE_FRAME, CRAB_SPRITESHEET_KEY, FONTS, GAME_HEIGHT, GAME_WIDTH, LABEL_STYLE } from '../config/constants.js';
import { playBackgroundMusic } from '../systems/audio.js';
import { ensureProgress } from '../state/progress.js';
import {
  addCrtOverlay,
  createInfoButton,
  createTextButton,
  showInfoDialog,
  showNewGameConfirmation
} from '../ui/buttons.js';
import { addMenuBackground, ensureCrabAnimations, preloadMainMenuAssets } from '../ui/backgrounds.js';

// Main menu scene: title screen, continue flow, reset confirmation, and settings entry.
export class MainMenuScene extends Phaser.Scene {
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
      .text(150, 68, "CSD Game Jam submission", {
        ...LABEL_STYLE,
        fontSize: "12px",
        align: "center"
      })
      .setOrigin(0.5)
      .setDepth(30);

    createInfoButton(this, GAME_WIDTH - 38, 38, () => {
      showInfoDialog(this);
    });

    createTextButton(this, 150, 96, "Play", () => {
      this.scene.start("LevelSelectScene");
    }, 158);

    createTextButton(this, 150, 134, "Sandbox", () => {
      this.scene.start("SandboxScene");
    }, 158);

    createTextButton(this, 150, 172, "New Game", () => {
      showNewGameConfirmation(this);
    }, 158);

    createTextButton(this, 150, 210, "Settings", () => {
      this.scene.start("SettingsScene");
    }, 158);

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

