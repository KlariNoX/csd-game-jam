import Phaser from 'phaser';
import {
  COLORS,
  COLOR_VALUES,
  CRAB_IDLE_FRAME,
  CRAB_SPRITESHEET_KEY,
  FONTS,
  GAME_HEIGHT,
  GAME_WIDTH,
  LABEL_STYLE,
  PYRAMID_TILEGROUND_KEY,
  RUIN_PLATFORM_FRAMES,
  TOTAL_LEVELS
} from '../config/constants.js';
import { getCurrentLevel, getSelectedLevelIndex, unlockNextLevel } from '../state/progress.js';
import { getMusicSettingLabel, getSoundSettingLabel, playBackgroundMusic, playSoundCue, sharedState, updateMusicSetting } from '../systems/audio.js';
import { playEndingStoryboardThenStartWin } from '../storyboard.js';
import { addCrtOverlay, addSceneTitle, createPanel, createTextButton } from '../ui/buttons.js';
import {
  addLevelBackground,
  ensureCrabAnimations,
  preloadCrabSpritesheetIfNeeded,
  preloadLevelBackgroundIfNeeded,
  preloadPyramidRuinsAssetsIfNeeded
} from '../ui/backgrounds.js';

// Gameplay scene: platforming, puzzles, hazards, pause menu, and win/death flow.
export class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  preload() {
    preloadLevelBackgroundIfNeeded(this, getSelectedLevelIndex(this));
    preloadPyramidRuinsAssetsIfNeeded(this);
    preloadCrabSpritesheetIfNeeded(this);
  }

  create() {
    this.currentLevelIndex = getSelectedLevelIndex(this);
    this.currentLevel = getCurrentLevel(this);
    
    playBackgroundMusic(this, `track-${this.currentLevelIndex + 1}`);
    
    // Runtime state is reset on every scene start so retries never inherit
    // hazard positions, puzzle progress, or old object references.
    this.levelState = "playing";
    this.pauseMenuOpen = false;
    this.maxWetness = 100;
    this.wetness = this.maxWetness;
    this.lowWetnessThreshold = 24;
    this.dryRate = 2.6;
    this.facingDirection = 1;
    this.blades = [];
    this.crushers = [];
    this.movingPlatforms = [];
    this.ridingMovingPlatform = null;
    this.pushBoxes = [];
    this.staticSolids = [];
    this.puzzleState = this.createPuzzleState(this.currentLevel);

    this.cameras.main.setBackgroundColor("#120d07");

    // Draw the selected chamber before creating physics bodies so visual art
    // and collision data stay tied to the same level definition.
    addLevelBackground(this, this.currentLevelIndex);
    this.levelLayout = this.drawLevel(this.currentLevel);
    addSceneTitle(this, `Level ${this.currentLevelIndex + 1}`, this.currentLevel.name);

    ensureCrabAnimations(this);

    // The crab art is 32x32, but the active body is smaller so collisions feel
    // fair around legs and claws.
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
    this.createMovingPlatforms(this.levelLayout.movingPlatforms || []);
    this.createPushBoxes(this.levelLayout.boxes || []);

    // The goal is always an invisible physics zone. Door art and puzzle locks
    // decide whether touching it actually completes the level.
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
    this.createPuzzleSwitchZones();

    this.createWetnessHud();
    this.updateMovingPlatforms(this.time.now, 16);
    this.updatePushBoxes();
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
    // Pause UI objects are created once and toggled visible so reopening the
    // menu does not recreate buttons or duplicate input handlers.
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
    // Phaser containers can be visible while their input stays active, so
    // buttons are disabled explicitly when the pause menu is hidden.
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

  createPuzzleState(level) {
    const switches = level.puzzle?.switches || [];
    const requiredSwitchCount = level.puzzle?.requiredSwitchCount || switches.length;

    // Level puzzle state lives in one place so the switch overlaps, switch art,
    // HUD counter, and locked exit all agree on whether the gate is open.
    return {
      hasPuzzle: switches.length > 0 && requiredSwitchCount > 0,
      requiredSwitchCount,
      switchesActivated: 0,
      unlocked: switches.length === 0 || requiredSwitchCount === 0,
      switchStates: switches.map((switchConfig) => ({
        config: switchConfig,
        activated: false,
        display: null,
        glow: null,
        zone: null
      }))
    };
  }

  drawLevel(level) {
    const graphics = this.add.graphics().setDepth(2);

    // This method turns level data into scene objects. Solid collision bodies
    // are created later in createCollisionWorld.
    this.drawGoalArt(graphics, level.goal);
    this.createDoorLockVisual(level.goal);

    (level.lavaPools || []).forEach((pool) => {
      this.drawLavaPool(graphics, pool);
    });

    (level.decorations || []).forEach((decoration) => {
      this.drawLevelDecoration(graphics, decoration);
    });

    level.solids.forEach((solid) => {
      this.drawSolidRect(graphics, solid);
    });

    (level.spikes || []).forEach((spikeStrip) => {
      this.drawSpikeStrip(graphics, spikeStrip);
    });

    this.drawPuzzleSwitches();

    (level.blades || []).forEach((blade) => {
      this.createBlade(blade);
    });

    (level.crushers || []).forEach((crusher) => {
      this.createCrusher(crusher);
    });

    return level;
  }

  drawLevelDecoration(graphics, decoration) {
    // Decorations are visual-only unless the same rectangle also appears in solids.
    if (decoration.type === "sandPit") {
      graphics.fillStyle(0x3c2518, 0.72);
      graphics.fillRect(decoration.x, decoration.y, decoration.width, decoration.height);
      graphics.fillStyle(COLORS.sandDark, 0.86);
      graphics.fillRect(decoration.x + 2, decoration.y + 4, decoration.width - 4, decoration.height - 4);
      graphics.fillStyle(COLORS.sandMid, 0.9);

      for (let sandX = decoration.x + 8; sandX < decoration.x + decoration.width - 4; sandX += 18) {
        graphics.fillEllipse(
          sandX,
          decoration.y + 14 + ((sandX - decoration.x) % 14),
          12,
          4
        );
      }

      return;
    }

    if (decoration.type === "ceilingLedge") {
      this.drawRuinPlatform(decoration);

      graphics.fillStyle(0x2c170b, 0.56);
      graphics.fillRect(
        decoration.x - 2,
        decoration.y + decoration.height,
        decoration.width + 4,
        3
      );
      graphics.lineStyle(1, COLORS.bronzeDark, 0.45);

      for (let crackX = decoration.x + 12; crackX < decoration.x + decoration.width - 8; crackX += 22) {
        graphics.lineBetween(crackX, decoration.y + decoration.height, crackX + 4, decoration.y + decoration.height + 5);
      }
    }
  }

  drawGoalArt(graphics, goal) {
    // Goal kinds share completion logic but get different themed art.
    if (goal.kind === "river") {
      graphics.fillStyle(COLORS.waterDeep, 1);
      graphics.fillRoundedRect(goal.x, goal.y, goal.width, goal.height, 10);
      graphics.fillStyle(COLORS.water, 1);
      graphics.fillRoundedRect(goal.x + 6, goal.y + 6, goal.width - 12, goal.height - 12, 8);
      graphics.lineStyle(2, COLOR_VALUES.gold, 0.95);
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

  createDoorLockVisual(goal) {
    if (!this.puzzleState?.hasPuzzle || goal.kind !== "door") {
      return;
    }

    // Puzzle doors keep a separate lock overlay so the base door can stay
    // unchanged when the seals open.
    this.doorLockGraphics = this.add.graphics().setDepth(11);
    this.doorLockText = this.add
      .text(goal.x + goal.width / 2, goal.y + 18, "", {
        fontFamily: FONTS.ui,
        fontSize: "8px",
        color: COLORS.gold,
        stroke: "#2c170b",
        strokeThickness: 3
      })
      .setOrigin(0.5)
      .setDepth(12);
    this.updateDoorLockVisual();
  }

  updateDoorLockVisual() {
    if (!this.doorLockGraphics || !this.puzzleState?.hasPuzzle) {
      return;
    }

    const goal = this.currentLevel.goal;
    const isLocked = this.isExitLocked();

    this.doorLockGraphics.clear();

    if (isLocked) {
      this.doorLockGraphics.fillStyle(0x2c170b, 0.82);
      this.doorLockGraphics.fillRoundedRect(goal.x + 3, goal.y + 30, goal.width - 6, 7, 2);
      this.doorLockGraphics.fillRoundedRect(goal.x + 3, goal.y + 50, goal.width - 6, 7, 2);
      this.doorLockGraphics.fillStyle(0xb5782c, 1);
      this.doorLockGraphics.fillRoundedRect(goal.x + 6, goal.y + 31, goal.width - 12, 4, 2);
      this.doorLockGraphics.fillRoundedRect(goal.x + 6, goal.y + 51, goal.width - 12, 4, 2);
      this.doorLockGraphics.fillStyle(0xf3d36b, 1);
      this.doorLockGraphics.fillCircle(goal.x + goal.width / 2, goal.y + 44, 4);
      this.doorLockGraphics.lineStyle(1, 0x2c170b, 0.9);
      this.doorLockGraphics.strokeCircle(goal.x + goal.width / 2, goal.y + 44, 4);
      this.doorLockText.setText("LOCKED").setColor(COLORS.gold).setAlpha(1);
      return;
    }

    this.doorLockGraphics.fillStyle(0xfff0a8, 0.26);
    this.doorLockGraphics.fillRoundedRect(goal.x + 5, goal.y + 10, goal.width - 10, goal.height - 14, {
      tl: 15,
      tr: 15,
      bl: 0,
      br: 0
    });
    this.doorLockGraphics.lineStyle(2, 0xf3d36b, 0.9);
    this.doorLockGraphics.strokeRoundedRect(goal.x + 4, goal.y + 8, goal.width - 8, goal.height - 10, {
      tl: 16,
      tr: 16,
      bl: 0,
      br: 0
    });
    this.doorLockText.setText("OPEN").setColor("#fff8de").setAlpha(1);
  }

  drawPuzzleSwitches() {
    if (!this.puzzleState?.hasPuzzle) {
      return;
    }

    this.puzzleState.switchStates.forEach((switchState, switchIndex) => {
      switchState.glow = this.add.graphics().setDepth(6);
      switchState.display = this.add.graphics().setDepth(7);
      this.drawPuzzleSwitchState(switchIndex);
    });
  }

  drawPuzzleSwitchState(switchIndex) {
    const switchState = this.puzzleState.switchStates[switchIndex];

    if (!switchState?.display || !switchState.glow) {
      return;
    }

    const { x, y, width, height } = switchState.config;
    const isActive = switchState.activated;
    const bodyColor = isActive ? 0xf3d36b : 0x2f7967;
    const glyphColor = isActive ? 0x2c170b : 0xf3d36b;

    switchState.glow.clear();
    switchState.display.clear();

    if (isActive) {
      switchState.glow.fillStyle(0xffe7a3, 0.28);
      switchState.glow.fillEllipse(x + width / 2, y + height / 2, width + 14, height + 13);
    }

    // Pressure plates are tiny themed interactables: stone base, gold glyph,
    // and a brighter glow once the crab has stepped on them.
    switchState.display.fillStyle(0x2c170b, 0.78);
    switchState.display.fillRoundedRect(x - 2, y + height - 1, width + 4, 5, 2);
    switchState.display.fillStyle(0x6d4416, 1);
    switchState.display.fillRoundedRect(x - 1, y - 1, width + 2, height + 2, 2);
    switchState.display.fillStyle(bodyColor, 1);
    switchState.display.fillRoundedRect(x, y, width, height, 2);
    switchState.display.lineStyle(1, 0x2c170b, 0.85);
    switchState.display.strokeRoundedRect(x, y, width, height, 2);
    switchState.display.fillStyle(glyphColor, 1);
    switchState.display.fillEllipse(x + width / 2, y + height / 2, 7, 5);
    switchState.display.fillRect(x + width / 2 - 1, y + 1, 2, height - 2);
    switchState.display.lineStyle(1, glyphColor, 1);
    switchState.display.lineBetween(x + 6, y + height / 2, x + width - 6, y + height / 2);
  }

  createPuzzleSwitchZones() {
    if (!this.puzzleState?.hasPuzzle) {
      return;
    }

    this.puzzleState.switchStates.forEach((switchState, switchIndex) => {
      const { x, y, width, height } = switchState.config;
      const activation = switchState.config.activation || "player";
      const switchZone = this.add.zone(
        x + width / 2,
        y + height / 2,
        width + 12,
        height + 18
      );

      this.physics.add.existing(switchZone, true);

      // Most seals wake when the crab reaches them. Level 3 can mark a seal as
      // activation: "box" so only a pushed stone box can press it.
      if (activation === "box") {
        this.pushBoxes.forEach((boxState) => {
          this.physics.add.overlap(boxState.bodyObject, switchZone, () => {
            this.activatePuzzleSwitch(switchIndex, "box");
          });
        });
      } else {
        this.physics.add.overlap(this.player, switchZone, () => {
          this.activatePuzzleSwitch(switchIndex, "player");
        });
      }

      switchState.zone = switchZone;
    });
  }

  activatePuzzleSwitch(switchIndex, activator = "player") {
    if (this.levelState !== "playing" || !this.puzzleState?.hasPuzzle) {
      return;
    }

    const switchState = this.puzzleState.switchStates[switchIndex];

    if (!switchState || switchState.activated) {
      return;
    }

    if ((switchState.config.activation || "player") === "box" && activator !== "box") {
      return;
    }

    switchState.activated = true;
    this.puzzleState.switchesActivated += 1;
    this.drawPuzzleSwitchState(switchIndex);
    this.playPuzzleSwitchSparkles(switchState.config);
    this.updatePuzzleHud();
    playSoundCue(this, "ui-click");

    // Once the required number of plates is active, the door becomes a normal
    // exit again; until then the exit overlap only gives locked feedback.
    if (this.puzzleState.switchesActivated >= this.puzzleState.requiredSwitchCount) {
      this.puzzleState.unlocked = true;
      this.updateDoorLockVisual();
      this.showPuzzleMessage(`${this.currentLevel.name} unlocked`, "#fff8de");
      playSoundCue(this, "clear");
      this.cameras.main.flash(160, 255, 238, 176);
      return;
    }

    this.showPuzzleMessage(
      `Seal ${this.puzzleState.switchesActivated}/${this.puzzleState.requiredSwitchCount} awakened`,
      "#ffd27a"
    );
  }

  playPuzzleSwitchSparkles(switchConfig) {
    const centerX = switchConfig.x + switchConfig.width / 2;
    const centerY = switchConfig.y + switchConfig.height / 2;

    for (let sparkIndex = 0; sparkIndex < 6; sparkIndex += 1) {
      const spark = this.add
        .rectangle(centerX, centerY, 3, 3, sparkIndex % 2 === 0 ? 0xfff3bf : 0x8de6ff)
        .setDepth(14);
      const angle = (Math.PI * 2 * sparkIndex) / 6;

      this.tweens.add({
        targets: spark,
        x: centerX + Math.cos(angle) * 13,
        y: centerY + Math.sin(angle) * 9,
        alpha: 0,
        duration: 280,
        ease: "Quad.Out",
        onComplete: () => {
          spark.destroy();
        }
      });
    }
  }

  isExitLocked() {
    return Boolean(this.puzzleState?.hasPuzzle && !this.puzzleState.unlocked);
  }

  drawSolidRect(graphics, rect) {
    // The style field controls art only. Every solid still becomes the same
    // invisible Arcade Physics body later.
    if (rect.style === "invisible") {
      return;
    }

    if (rect.style === "backgroundFloor") {
      this.drawBackgroundFloor(rect);
      return;
    }

    if (rect.style === "ruinLedge") {
      this.drawRuinPlatform(rect);
      return;
    }

    if (rect.style === "assetPillar") {
      this.drawAssetPillar(rect);
      return;
    }

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

  drawBackgroundFloor(rect) {
    if (!this.textures.exists(PYRAMID_TILEGROUND_KEY)) {
      const fallbackGraphics = this.add.graphics().setDepth(3);
      fallbackGraphics.fillStyle(COLORS.wallMid, 1);
      fallbackGraphics.fillRect(rect.x, rect.y, rect.width, rect.height);
      fallbackGraphics.lineStyle(2, COLORS.wallDark, 0.6);
      fallbackGraphics.strokeRect(rect.x, rect.y, rect.width, rect.height);
      return;
    }

    const tileSize = 16;
    const tileColumns = Math.ceil(rect.width / tileSize);
    const tileRows = Math.ceil(rect.height / tileSize);
    const frames = {
      top: [13, 14, 15],
      middle: [25, 26, 27],
      bottom: [37, 38, 39]
    };

    for (let row = 0; row < tileRows; row += 1) {
      const rowFrames =
        row === 0
          ? frames.top
          : row === tileRows - 1
            ? frames.bottom
            : frames.middle;
      const tileY = rect.y + row * tileSize;
      const cropHeight = Math.min(tileSize, rect.y + rect.height - tileY);

      for (let column = 0; column < tileColumns; column += 1) {
        const tileX = rect.x + column * tileSize;
        const cropWidth = Math.min(tileSize, rect.x + rect.width - tileX);
        let frame = rowFrames[1];

        if (column === 0) {
          frame = rowFrames[0];
        } else if (column === tileColumns - 1) {
          frame = rowFrames[2];
        }

        const floorTile = this.add
          .image(tileX, tileY, PYRAMID_TILEGROUND_KEY, frame)
          .setOrigin(0)
          .setDepth(3);

        if (cropWidth < tileSize || cropHeight < tileSize) {
          floorTile.setCrop(0, 0, cropWidth, cropHeight);
        }
      }
    }
  }

  drawRuinPlatform(rect) {
    const platformGraphics = this.add.graphics().setDepth(4);
    const tileCount = Math.max(2, Math.ceil(rect.width / 16));
    const displayWidth = tileCount * 16;

    platformGraphics.fillStyle(0x3c2518, 0.82);
    platformGraphics.fillRect(rect.x - 2, rect.y + 10, displayWidth + 4, 7);
    platformGraphics.fillStyle(0x8b5630, 0.92);
    platformGraphics.fillRect(rect.x, rect.y + 8, displayWidth, 7);
    platformGraphics.lineStyle(1, 0x2c170b, 0.75);
    platformGraphics.strokeRect(rect.x - 1, rect.y + 7, displayWidth + 2, 10);

    if (!this.textures.exists(PYRAMID_TILEGROUND_KEY)) {
      return;
    }

    for (let tileIndex = 0; tileIndex < tileCount; tileIndex += 1) {
      let frame = RUIN_PLATFORM_FRAMES.middle;

      if (tileIndex === 0) {
        frame = RUIN_PLATFORM_FRAMES.left;
      } else if (tileIndex === tileCount - 1) {
        frame = RUIN_PLATFORM_FRAMES.right;
      }

      this.add
        .image(rect.x + tileIndex * 16, rect.y, PYRAMID_TILEGROUND_KEY, frame)
        .setOrigin(0)
        .setDepth(5);
    }
  }

  drawAssetPillar(rect) {
    // Draws skinny vertical pillars using the Pyramid Ruins tile assets instead of gray debug rectangles.
    // Collision still comes from the original solid rect.
    if (!this.textures.exists(PYRAMID_TILEGROUND_KEY)) {
      return;
    }

    const tileSize = 16;

    // These frames are the custom skinny pillar pieces from PR_TileGround 16x16.png.
    const topFrame = 22;
    const middleFrame = 34;
    const lowerMiddleFrame = 46;
    const bottomFrame = 58;

    const tileCount = Math.max(2, Math.ceil(rect.height / tileSize));

    for (let tileIndex = 0; tileIndex < tileCount; tileIndex += 1) {
      let frame = middleFrame;

      if (tileIndex === 0) {
        frame = topFrame;
      } else if (tileIndex === tileCount - 1) {
        frame = bottomFrame;
      } else if (tileIndex % 2 === 0) {
        frame = lowerMiddleFrame;
      }

      const tileY = rect.y + tileIndex * tileSize;
      const remainingHeight = rect.y + rect.height - tileY;

      // Do not draw past the original collision height.
      if (remainingHeight <= 0) {
        break;
      }

      const pillarTile = this.add
        .image(rect.x, tileY, PYRAMID_TILEGROUND_KEY, frame)
        .setOrigin(0)
        .setDepth(5);

      // If the final tile would stick out too much, hide the excess by scaling slightly.
      if (remainingHeight < tileSize) {
        pillarTile.setCrop(0, 0, tileSize, remainingHeight);
      }
    }
  }

  drawSpikeStrip(graphics, spikeStrip) {
    const spikeHeight = 14;
    const pointsDown = spikeStrip.direction === "down";
    const baseY = pointsDown ? spikeStrip.y : spikeStrip.y - 4;
    const tipY = pointsDown ? spikeStrip.y + spikeHeight : spikeStrip.y - spikeHeight;

    graphics.fillStyle(COLORS.bronzeDark, 1);
    graphics.fillRect(spikeStrip.x, baseY, spikeStrip.width, 4);

    for (let spikeX = spikeStrip.x; spikeX < spikeStrip.x + spikeStrip.width; spikeX += 12) {
      graphics.fillStyle(COLORS.bronze, 1);

      // Floor spikes point up; unreachable shelf spikes use direction: "down".
      graphics.fillTriangle(
        spikeX,
        baseY + (pointsDown ? 4 : 0),
        spikeX + 6,
        tipY,
        spikeX + 12,
        baseY + (pointsDown ? 4 : 0)
      );
      graphics.lineStyle(1, COLORS.bronzeDark, 0.65);
      graphics.strokeTriangle(
        spikeX,
        baseY + (pointsDown ? 4 : 0),
        spikeX + 6,
        tipY,
        spikeX + 12,
        baseY + (pointsDown ? 4 : 0)
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
    // Blades are graphics objects plus lightweight state; collision uses a
    // circle-vs-rectangle check instead of Arcade Physics bodies.
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
    // Crushers animate as display objects, then update a Phaser rectangle used
    // for manual hitbox checks.
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

  createMovingPlatforms(platforms) {
    platforms.forEach((platformConfig) => {
      this.createMovingPlatform(platformConfig);
    });
  }

  createMovingPlatform(platformConfig) {
    // Moving platforms use Arcade Physics bodies so the player and boxes can
    // collide with them while their art is redrawn every frame.
    const centerX = platformConfig.x + platformConfig.width / 2;
    const centerY = platformConfig.y + platformConfig.height / 2;
    const platformBody = this.add
      .rectangle(centerX, centerY, platformConfig.width, platformConfig.height, COLORS.sandMid, 0.01)
      .setDepth(6);
    const platformArt = this.add.graphics().setDepth(6);

    this.physics.add.existing(platformBody);
    platformBody.body.setAllowGravity(false);
    platformBody.body.setImmovable(true);
    platformBody.body.setSize(platformConfig.width, platformConfig.height);
    platformBody.body.pushable = false;
    const movingPlatform = {
      ...platformConfig,
      bodyObject: platformBody,
      art: platformArt,
      previousX: centerX,
      previousY: centerY
    };

    this.physics.add.collider(this.player, platformBody, () => {
      this.markPlayerRidingMovingPlatform(movingPlatform);
    });
    this.movingPlatforms.push(movingPlatform);
  }

  drawMovingPlatformArt(movingPlatform) {
    const { bodyObject, art, width, height } = movingPlatform;
    const left = bodyObject.x - width / 2;
    const top = bodyObject.y - height / 2;

    art.clear();
    art.fillStyle(0x2c170b, 0.78);
    art.fillRect(left - 2, top + height - 1, width + 4, 6);
    art.fillStyle(COLORS.sandDark, 1);
    art.fillRoundedRect(left, top, width, height, 2);
    art.fillStyle(COLORS.sandLight, 0.9);
    art.fillRect(left + 3, top + 2, width - 6, 3);
    art.lineStyle(1, COLORS.bronzeDark, 0.9);
    art.strokeRoundedRect(left, top, width, height, 2);

    for (let grooveX = left + 10; grooveX < left + width - 4; grooveX += 14) {
      art.lineBetween(grooveX, top + 2, grooveX - 4, top + height - 2);
    }
  }

  updateMovingPlatforms(time, delta) {
    const safeDelta = Math.max(delta || 16, 1);

    this.movingPlatforms.forEach((movingPlatform) => {
      const {
        bodyObject,
        width,
        height,
        y,
        fromX = movingPlatform.x,
        toX = movingPlatform.x,
        fromY = y,
        toY = y,
        duration = 2400,
        phase = 0
      } = movingPlatform;
      const cycle = ((time + phase) % duration) / duration;
      const travel = 0.5 - Math.cos(cycle * Math.PI * 2) * 0.5;
      const nextX = Phaser.Math.Linear(fromX + width / 2, toX + width / 2, travel);
      const nextY = Phaser.Math.Linear(fromY + height / 2, toY + height / 2, travel);
      const previousX = bodyObject.x;
      const previousY = bodyObject.y;
      const deltaX = nextX - previousX;
      const deltaY = nextY - previousY;
      const shouldCarryPlayer = this.isConfirmedMovingPlatformRider(
        movingPlatform,
        previousX,
        previousY
      );

      bodyObject.setPosition(nextX, nextY);
      bodyObject.body.updateFromGameObject();
      bodyObject.body.setVelocity((deltaX * 1000) / safeDelta, (deltaY * 1000) / safeDelta);
      this.drawMovingPlatformArt(movingPlatform);

      // Only carry the crab after Arcade Physics has confirmed it collided
      // with this exact platform from above. Geometry-only checks can drag the
      // crab from nearby floor tiles.
      if (shouldCarryPlayer && (Math.abs(deltaX) > 0 || Math.abs(deltaY) > 0)) {
        this.carryPlayerWithMovingPlatform(movingPlatform, nextX, nextY, deltaX, deltaY);
      }

      movingPlatform.previousX = nextX;
      movingPlatform.previousY = nextY;
    });
  }

  markPlayerRidingMovingPlatform(movingPlatform) {
    if (!this.player?.body || !this.isPlayerOverMovingPlatform(movingPlatform)) {
      return;
    }

    const platformTop = movingPlatform.bodyObject.y - movingPlatform.height / 2;

    this.ridingMovingPlatform = movingPlatform;
    movingPlatform.riderSeenAt = this.time.now;
    movingPlatform.riderOffsetX = this.player.x - movingPlatform.bodyObject.x;
    movingPlatform.riderOffsetY = this.player.y - platformTop;
  }

  isConfirmedMovingPlatformRider(movingPlatform, platformCenterX, platformCenterY) {
    if (this.ridingMovingPlatform !== movingPlatform) {
      return false;
    }

    if (this.time.now - (movingPlatform.riderSeenAt || 0) > 160) {
      return false;
    }

    return this.isPlayerOverMovingPlatform(movingPlatform, platformCenterX, platformCenterY);
  }

  isPlayerOverMovingPlatform(movingPlatform, platformCenterX = movingPlatform.bodyObject.x, platformCenterY = movingPlatform.bodyObject.y) {
    if (!this.player?.body) {
      return false;
    }

    const body = this.player.body;
    const { width, height } = movingPlatform;
    const platformLeft = platformCenterX - width / 2;
    const platformRight = platformCenterX + width / 2;
    const platformTop = platformCenterY - height / 2;
    const playerCenterX = body.x + body.width / 2;
    const playerBottom = body.y + body.height;
    const centerIsOnPlatform =
      playerCenterX >= platformLeft + 4 &&
      playerCenterX <= platformRight - 4;
    const feetAreOnTop =
      playerBottom >= platformTop - 8 &&
      playerBottom <= platformTop + 8;
    const isFallingOrResting = body.velocity.y >= -8;

    return centerIsOnPlatform && feetAreOnTop && isFallingOrResting;
  }

  isHorizontalMoveInputDown() {
    if (!this.cursors || !this.keys) {
      return false;
    }

    return this.cursors.left.isDown ||
      this.cursors.right.isDown ||
      this.keys.A.isDown ||
      this.keys.D.isDown;
  }

  carryPlayerWithMovingPlatform(movingPlatform, nextPlatformX, nextPlatformY, deltaX, deltaY) {
    const isWalking = this.isHorizontalMoveInputDown();
    const platformTop = nextPlatformY - movingPlatform.height / 2;
    let nextPlayerX;

    if (isWalking) {
      nextPlayerX = Phaser.Math.Clamp(this.player.x + deltaX, 0, GAME_WIDTH);
      movingPlatform.riderOffsetX = nextPlayerX - nextPlatformX;
    } else {
      nextPlayerX = Phaser.Math.Clamp(
        nextPlatformX + (movingPlatform.riderOffsetX || 0),
        0,
        GAME_WIDTH
      );
    }

    const nextPlayerY = platformTop + (movingPlatform.riderOffsetY ?? 0);

    this.player.setPosition(nextPlayerX, nextPlayerY);
    this.player.body.updateFromGameObject();
  }

  createPushBoxes(boxes) {
    boxes.forEach((boxConfig) => {
      this.createPushBox(boxConfig);
    });
  }

  createPushBox(boxConfig) {
    // Push boxes are regular physics rectangles with a little custom art drawn
    // on top. Bounds in level data prevent easy puzzle softlocks.
    const bodyObject = this.add
      .rectangle(
        boxConfig.x + boxConfig.width / 2,
        boxConfig.y + boxConfig.height / 2,
        boxConfig.width,
        boxConfig.height,
        COLORS.stone,
        1
      )
      .setStrokeStyle(2, COLORS.wallDark, 0.95)
      .setDepth(7);
    const markings = this.add.graphics().setDepth(8);

    this.physics.add.existing(bodyObject);
    bodyObject.body.setSize(boxConfig.width, boxConfig.height);
    bodyObject.body.setAllowGravity(true);
    bodyObject.body.setCollideWorldBounds(true);
    bodyObject.body.setBounce(0);
    bodyObject.body.setDragX(620);
    bodyObject.body.setMaxVelocity(70, 380);
    bodyObject.body.pushable = true;

    this.physics.add.collider(this.player, bodyObject);
    this.staticSolids.forEach((solid) => {
      this.physics.add.collider(bodyObject, solid);
    });
    this.movingPlatforms.forEach((movingPlatform) => {
      this.physics.add.collider(bodyObject, movingPlatform.bodyObject);
    });
    this.pushBoxes.forEach((otherBox) => {
      this.physics.add.collider(bodyObject, otherBox.bodyObject);
    });

    this.pushBoxes.push({
      ...boxConfig,
      startX: boxConfig.x + boxConfig.width / 2,
      startY: boxConfig.y + boxConfig.height / 2,
      bodyObject,
      markings,
      resetCooldownUntil: 0
    });
  }

  drawPushBoxMarkings(boxState) {
    const { bodyObject, markings, width, height } = boxState;
    const left = bodyObject.x - width / 2;
    const top = bodyObject.y - height / 2;
    const centerX = bodyObject.x;
    const centerY = bodyObject.y;

    markings.clear();
    markings.fillStyle(0x2c170b, 0.22);
    markings.fillRect(left + 2, top + height - 4, width - 4, 3);
    markings.lineStyle(1, COLOR_VALUES.gold, 0.82);
    markings.strokeRect(left + 3, top + 3, width - 6, height - 6);
    markings.fillStyle(COLOR_VALUES.gold, 0.94);
    markings.fillEllipse(centerX, centerY, 7, 5);
    markings.fillRect(centerX - 1, top + 5, 2, height - 10);
    markings.lineStyle(1, COLORS.bronzeDark, 0.65);
    markings.lineBetween(left + 4, centerY, left + width - 4, centerY);
  }

  updatePushBoxes() {
    this.pushBoxes.forEach((boxState) => {
      const { bodyObject, width, height, bounds } = boxState;
      const halfWidth = width / 2;

      // Anti-softlock handling: boxes are fenced into their puzzle yard, and if
      // one drops below the playable floor it returns to its original position.
      if (bounds) {
        const clampedX = Phaser.Math.Clamp(
          bodyObject.x,
          bounds.minX + halfWidth,
          bounds.maxX - halfWidth
        );

        if (clampedX !== bodyObject.x) {
          bodyObject.setX(clampedX);
          bodyObject.body.updateFromGameObject();
          bodyObject.body.setVelocityX(0);
        }
      }

      if (bodyObject.y + height / 2 >= GAME_HEIGHT - 2) {
        this.resetPushBox(boxState);
        return;
      }

      this.drawPushBoxMarkings(boxState);
    });
  }

  resetPushBox(boxState) {
    if (this.time.now < boxState.resetCooldownUntil) {
      return;
    }

    boxState.resetCooldownUntil = this.time.now + 500;
    boxState.bodyObject.setPosition(boxState.startX, boxState.startY);
    boxState.bodyObject.body.reset(boxState.startX, boxState.startY);
    boxState.bodyObject.body.setVelocity(0, 0);
    this.drawPushBoxMarkings(boxState);
    this.showPuzzleMessage("Stone block reset", "#ffd27a");
  }

  createCollisionWorld(solids) {
    // Static solids are invisible zones. The visible platform art was already
    // drawn from the same rectangles in drawSolidRect.
    this.staticSolids = solids.map((solid) => (
      this.createSolidBody(solid.x, solid.y, solid.width, solid.height)
    ));
  }

  createSolidBody(x, y, width, height) {
    const solid = this.add.zone(x + width / 2, y + height / 2, width, height);
    this.physics.add.existing(solid, true);
    this.physics.add.collider(this.player, solid);

    return solid;
  }

  createWetnessHud() {
    // Wetness is the level timer: it drains during play and restarts the room
    // when it hits zero.
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

    this.createPuzzleHud();
    this.updateWetnessHud();
  }

  createPuzzleHud() {
    if (!this.puzzleState?.hasPuzzle) {
      this.puzzleCounterText = null;
      this.puzzleMessageText = null;
      return;
    }

    this.puzzleCounterText = this.add
      .text(GAME_WIDTH - 12, 34, "", {
        fontFamily: FONTS.ui,
        fontSize: "10px",
        color: COLORS.gold,
        stroke: "#2c170b",
        strokeThickness: 3
      })
      .setOrigin(1, 0)
      .setDepth(22);

    this.puzzleMessageY = 84;
    this.puzzleMessageText = this.add
      .text(GAME_WIDTH / 2, this.puzzleMessageY, "", {
        fontFamily: FONTS.ui,
        fontSize: "12px",
        color: COLORS.gold,
        stroke: "#2c170b",
        strokeThickness: 4
      })
      .setOrigin(0.5)
      .setDepth(23)
      .setVisible(false);

    this.updatePuzzleHud();
  }

  updatePuzzleHud() {
    if (!this.puzzleCounterText || !this.puzzleState?.hasPuzzle) {
      return;
    }

    this.puzzleCounterText.setText(
      `SEALS ${this.puzzleState.switchesActivated}/${this.puzzleState.requiredSwitchCount}`
    );
  }

  showPuzzleMessage(message, color = COLORS.gold) {
    if (!this.puzzleMessageText) {
      return;
    }

    this.tweens.killTweensOf(this.puzzleMessageText);
    this.puzzleMessageText
      .setText(message)
      .setColor(color)
      .setY(this.puzzleMessageY)
      .setAlpha(1)
      .setVisible(true);

    this.tweens.add({
      targets: this.puzzleMessageText,
      y: this.puzzleMessageY - 7,
      alpha: 0,
      delay: 700,
      duration: 460,
      ease: "Quad.Out",
      onComplete: () => {
        this.puzzleMessageText.setVisible(false).setY(this.puzzleMessageY);
      }
    });
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
      fillColor = COLOR_VALUES.gold;
    }

    this.wetnessFrame.clear();
    this.wetnessFrame.fillStyle(0x2c170b, 0.85);
    this.wetnessFrame.fillRoundedRect(barX, barY, barWidth, barHeight, 6);
    this.wetnessFrame.lineStyle(2, COLOR_VALUES.gold, 1);
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

  showLockedDoorFeedback() {
    if (this.time.now - (this.lockedDoorFeedbackAt || 0) < 650) {
      return;
    }

    this.lockedDoorFeedbackAt = this.time.now;
    playSoundCue(this, "ui-hover");
    this.cameras.main.shake(80, 0.002);
    this.showPuzzleMessage(
      `Gate sealed: ${this.puzzleState.switchesActivated}/${this.puzzleState.requiredSwitchCount} seals`,
      "#ffd27a"
    );

    if (this.doorLockText) {
      this.tweens.killTweensOf(this.doorLockText);
      this.doorLockText.setAlpha(1);
      this.tweens.add({
        targets: this.doorLockText,
        alpha: 0.45,
        duration: 90,
        yoyo: true,
        repeat: 2
      });
    }
  }

  handleGoalReached() {
    if (this.levelState !== "playing") {
      return;
    }

    // Locked puzzle doors block level completion until the required plates are active.
    if (this.isExitLocked()) {
      this.showLockedDoorFeedback();
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
        playEndingStoryboardThenStartWin(this);
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
    // Input is intentionally simple: horizontal scuttle plus one grounded jump.
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

  getSpikeHitbox(spikeStrip) {
    if (spikeStrip.direction === "down") {
      return new Phaser.Geom.Rectangle(
        spikeStrip.x,
        spikeStrip.y,
        spikeStrip.width,
        16
      );
    }

    return new Phaser.Geom.Rectangle(
      spikeStrip.x,
      spikeStrip.y - 16,
      spikeStrip.width,
      16
    );
  }

  checkHazards() {
    // Hazard checks are manual because the hazards are mostly drawn graphics,
    // not Arcade Physics sprites.
    const hitbox = this.getPlayerHitbox();

    if (hitbox.bottom >= GAME_HEIGHT - 4) {
      this.handleHazardDeath("Lost in the chamber! Restarting...");
      return;
    }

    for (const spikeStrip of this.currentLevel.spikes || []) {
      const spikeHitbox = this.getSpikeHitbox(spikeStrip);

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

    // Main frame loop order: move dynamic platforms, apply player input, update
    // hazard positions, then test for damage and wetness loss.
    this.updateMovingPlatforms(this.time.now, delta);
    this.updatePushBoxes();
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

