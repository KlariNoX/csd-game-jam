import Phaser from 'phaser';
import { GAME_WIDTH, LABEL_STYLE, MAIN_MENU_BACKGROUND_KEY } from '../config/constants.js';
import { MAIN_MENU_BACKGROUND_URL } from '../config/assets.js';
import { getMusicSettingLabel, getSoundSettingLabel, sharedState, updateMusicSetting } from '../systems/audio.js';
import { addCrtOverlay, addSceneTitle, createPanel, createTextButton } from '../ui/buttons.js';
import { addMenuBackground, preloadImageIfNeeded } from '../ui/backgrounds.js';

// Settings scene: the same audio toggles used by the pause menu, exposed from the title flow.
export class SettingsScene extends Phaser.Scene {
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

    createTextButton(this, GAME_WIDTH / 2, 184, "Back", () => {
      this.scene.start("MainMenuScene");
    }, 110);

    addCrtOverlay(this);
  }

  refreshLabels() {
    this.musicText.setText(getMusicSettingLabel());
    this.soundText.setText(getSoundSettingLabel());
  }
}

