import Phaser from 'phaser';
import { ENDING_SCENE_BACKGROUND_KEY, GAME_WIDTH, LABEL_STYLE, TOTAL_LEVELS } from '../config/constants.js';
import { ENDING_SCENE_BACKGROUND_URL } from '../config/assets.js';
import { getHighestUnlockedLevel, getSelectedLevelIndex } from '../state/progress.js';
import { playBackgroundMusic } from '../systems/audio.js';
import { addCrtOverlay, addSceneTitle, createPanel, createTextButton } from '../ui/buttons.js';
import { addEndingSceneBackground, preloadImageIfNeeded } from '../ui/backgrounds.js';

// Win scene: final message and navigation after the ending storyboard finishes.
export class WinScene extends Phaser.Scene {
  constructor() {
    super("WinScene");
  }

  preload() {
    preloadImageIfNeeded(
      this,
      ENDING_SCENE_BACKGROUND_KEY,
      ENDING_SCENE_BACKGROUND_URL
    );
  }

  create() {
    const currentLevelIndex = getSelectedLevelIndex(this);
    const highestUnlockedLevel = getHighestUnlockedLevel(this);
    const progressMessage =
      highestUnlockedLevel === TOTAL_LEVELS
        ? "All five chambers are now open for replay."
        : `Levels 1-${highestUnlockedLevel} remain open for replay.`;

    playBackgroundMusic(this, "bg-music");

    addEndingSceneBackground(this);

    createPanel(this, 44, 40, 392, 118);
    addSceneTitle(this, "You Win", `Level ${currentLevelIndex + 1} clear`);

    this.add
      .text(
        GAME_WIDTH / 2,
        108,
        "The crab reached the Nile...\nbut luck had other tanks in mind. Meanwhile a mummy\n at the bottom of the North Atlantic is still\n very confused.",
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

