import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "./config/constants.js";
import { showOpeningStoryboard } from "./storyboard.js";
import { GameScene } from "./scenes/GameScene.js";
import { LevelEditorScene } from "./scenes/LevelEditorScene.js";
import { LevelSelectScene } from "./scenes/LevelSelectScene.js";
import { MainMenuScene } from "./scenes/MainMenuScene.js";
import { ReportScene } from "./scenes/ReportScene.js";
import { SandboxScene } from "./scenes/SandboxScene.js";
import { SettingsScene } from "./scenes/SettingsScene.js";
import { WinScene } from "./scenes/WinScene.js";

// Keep the entry file small: it only wires Phaser together and starts the opening storyboard.
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
    SandboxScene,
    LevelEditorScene,
    LevelSelectScene,
    ReportScene,
    GameScene,
    WinScene
  ]
};

showOpeningStoryboard(() => {
  new Phaser.Game(config);
});
