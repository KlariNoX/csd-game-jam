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
  RUIN_PLATFORM_FRAMES
} from '../config/constants.js';
import { playBackgroundMusic, playSoundCue } from '../systems/audio.js';
import { addCrtOverlay, addSceneTitle, createTextButton, drawPixelDialogFrame } from '../ui/buttons.js';
import {
  addLevelBackground,
  ensureCrabAnimations,
  getLevelBackground,
  preloadCrabSpritesheetIfNeeded,
  preloadLevelBackgroundIfNeeded,
  preloadPyramidRuinsAssetsIfNeeded
} from '../ui/backgrounds.js';
import {
  createUserLevel,
  loadSavedUserLevels as loadStoredUserLevels,
  saveUserLevels as saveStoredUserLevels
} from '../state/userLevels.js';

// Sandbox scene: a small no-progress practice room for movement and physics toys.
export class SandboxScene extends Phaser.Scene {
  constructor() {
    super("SandboxScene");
  }

  preload() {
    for (let backgroundIndex = 0; backgroundIndex < 5; backgroundIndex += 1) {
      preloadLevelBackgroundIfNeeded(this, backgroundIndex);
    }
    preloadPyramidRuinsAssetsIfNeeded(this);
    preloadCrabSpritesheetIfNeeded(this);
  }

  create() {
    playBackgroundMusic(this, "bg-music");
    ensureCrabAnimations(this);

    this.practiceStarted = false;
    this.facingDirection = 1;
    this.staticSolids = [];
    this.movingPlatforms = [];
    this.ridingMovingPlatform = null;

    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.cameras.main.setBackgroundColor("#120d07");

    addLevelBackground(this, 0);
    this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x120d07, 0.2)
      .setDepth(-7);

    this.showSandboxMenuPopup();
    addCrtOverlay(this);
  }

  showSandboxMenuPopup() {
    const panelWidth = 420;
    const panelHeight = 214;
    const panelX = (GAME_WIDTH - panelWidth) / 2;
    const panelY = (GAME_HEIGHT - panelHeight) / 2;
    const centerX = GAME_WIDTH / 2;
    const popupObjects = [];
    const blocker = this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x070302, 0.72)
      .setDepth(80)
      .setInteractive();

    popupObjects.push(blocker);
    popupObjects.push(drawPixelDialogFrame(this, panelX, panelY, panelWidth, panelHeight));

    const titlePlate = this.add.graphics().setDepth(91);
    titlePlate.fillStyle(0x090403, 1);
    titlePlate.fillRect(centerX - 98, panelY + 20, 196, 40);
    titlePlate.fillStyle(0x5c3218, 1);
    titlePlate.fillRect(centerX - 90, panelY + 26, 180, 28);
    titlePlate.fillStyle(COLOR_VALUES.gold, 1);
    titlePlate.fillRect(centerX - 84, panelY + 29, 168, 3);
    titlePlate.fillRect(centerX - 84, panelY + 50, 168, 3);
    titlePlate.fillStyle(0xffefad, 0.34);
    titlePlate.fillRect(centerX - 74, panelY + 33, 148, 1);
    popupObjects.push(titlePlate);

    const title = this.add
      .text(centerX, panelY + 41, "Sandbox", {
        fontFamily: FONTS.title,
        fontSize: "22px",
        color: COLORS.gold,
        stroke: "#120905",
        strokeThickness: 4
      })
      .setOrigin(0.5)
      .setDepth(94);
    const body = this.add
      .text(centerX, panelY + 98, "Choose a sandbox mode.", {
        ...LABEL_STYLE,
        align: "center",
        fontSize: "13px",
        color: "#fff4d0",
        wordWrap: { width: 260, useAdvancedWrap: true }
      })
      .setOrigin(0.5)
      .setDepth(94);
    const notePlate = this.add.graphics().setDepth(91);

    notePlate.fillStyle(0x090403, 1);
    notePlate.fillRect(centerX - 132, panelY + 124, 264, 34);
    notePlate.fillStyle(0x3c1b0d, 1);
    notePlate.fillRect(centerX - 126, panelY + 130, 252, 22);
    notePlate.fillStyle(0x5c3218, 0.82);
    notePlate.fillRect(centerX - 122, panelY + 134, 244, 14);
    notePlate.fillStyle(COLOR_VALUES.gold, 0.74);
    notePlate.fillRect(centerX - 118, panelY + 132, 236, 2);

    const note = this.add
      .text(centerX, panelY + 141, "Practice does not affect progress.", {
        fontFamily: FONTS.ui,
        fontSize: "10px",
        color: "#ffe09a"
      })
      .setOrigin(0.5)
      .setDepth(94);

    popupObjects.push(title, body, notePlate, note);

    const closePopup = () => {
      popupObjects.forEach((object) => object.destroy());
      this.sandboxMenuPopupObjects = [];
    };

    const myLevelsButton = createTextButton(this, centerX - 138, panelY + 188, "My Levels", () => {
      this.showMyLevelsPopup();
    }, 112, { variant: "secondary" }).setDepth(96);
    const practiceButton = createTextButton(this, centerX, panelY + 188, "Practice", () => {
      closePopup();
      this.startPracticeLevel();
    }, 112, { variant: "danger" }).setDepth(96);
    const backButton = createTextButton(this, centerX + 138, panelY + 188, "Back", () => {
      this.scene.start("MainMenuScene");
    }, 104, { variant: "secondary" }).setDepth(96);

    popupObjects.push(myLevelsButton, practiceButton, backButton);
    this.sandboxMenuPopupObjects = popupObjects;
  }

  loadSavedUserLevels() {
    return loadStoredUserLevels();
  }

  saveUserLevels(levels) {
    saveStoredUserLevels(levels);
  }

  showMyLevelsPopup() {
    if (this.myLevelsPopupObjects?.length) {
      return;
    }

    const panelWidth = 420;
    const panelHeight = 232;
    const panelX = (GAME_WIDTH - panelWidth) / 2;
    const panelY = (GAME_HEIGHT - panelHeight) / 2;
    const centerX = GAME_WIDTH / 2;
    const popupObjects = [];
    let listObjects = [];
    let savedLevels = this.loadSavedUserLevels();
    let listScroll = 0;
    const listBounds = {
      x: panelX + 38,
      y: panelY + 78,
      width: panelWidth - 76,
      height: 102
    };
    const rowHeight = 32;

    const blocker = this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x070302, 0.78)
      .setDepth(100)
      .setInteractive();

    popupObjects.push(blocker);
    popupObjects.push(drawPixelDialogFrame(this, panelX, panelY, panelWidth, panelHeight, 110));

    const titlePlate = this.add.graphics().setDepth(111);
    titlePlate.fillStyle(0x090403, 1);
    titlePlate.fillRect(centerX - 98, panelY + 18, 196, 38);
    titlePlate.fillStyle(0x5c3218, 1);
    titlePlate.fillRect(centerX - 90, panelY + 24, 180, 26);
    titlePlate.fillStyle(COLOR_VALUES.gold, 1);
    titlePlate.fillRect(centerX - 84, panelY + 27, 168, 3);
    titlePlate.fillRect(centerX - 84, panelY + 47, 168, 3);
    titlePlate.fillStyle(0xffefad, 0.34);
    titlePlate.fillRect(centerX - 74, panelY + 31, 148, 1);

    const title = this.add
      .text(centerX, panelY + 38, "My Levels", {
        fontFamily: FONTS.title,
        fontSize: "21px",
        color: COLORS.gold,
        stroke: "#120905",
        strokeThickness: 4
      })
      .setOrigin(0.5)
      .setDepth(124);

    const listFrame = this.add.graphics().setDepth(111);
    listFrame.fillStyle(0x090403, 1);
    listFrame.fillRect(listBounds.x - 4, listBounds.y - 4, listBounds.width + 8, listBounds.height + 8);
    listFrame.fillStyle(0x0d0603, 0.96);
    listFrame.fillRect(listBounds.x, listBounds.y, listBounds.width, listBounds.height);
    listFrame.lineStyle(2, 0x2a1409, 1);
    listFrame.strokeRect(listBounds.x, listBounds.y, listBounds.width, listBounds.height);

    popupObjects.push(titlePlate, title, listFrame);

    const clearListObjects = () => {
      listObjects.forEach((object) => object.destroy());
      listObjects = [];
    };
    const getMaxScroll = () => Math.max(0, savedLevels.length * rowHeight - (listBounds.height - 12));
    const deleteLevel = (levelId) => {
      savedLevels = savedLevels.filter((level) => level.id !== levelId);
      this.saveUserLevels(savedLevels);
      listScroll = Phaser.Math.Clamp(listScroll, 0, getMaxScroll());
      renderList();
    };
    const renderList = () => {
      clearListObjects();

      if (savedLevels.length === 0) {
        listObjects.push(
          this.add
            .text(centerX, listBounds.y + listBounds.height / 2, "No saved levels yet.", {
              ...LABEL_STYLE,
              fontSize: "12px",
              color: "#fff4d0",
              align: "center"
            })
            .setOrigin(0.5)
            .setDepth(124)
        );
        return;
      }

      savedLevels.forEach((level, index) => {
        const y = listBounds.y + 18 + index * rowHeight - listScroll;

        if (y < listBounds.y + 8 || y > listBounds.y + listBounds.height - 10) {
          return;
        }

        const rowLine = this.add.graphics().setDepth(121);
        rowLine.fillStyle(0x32190c, 0.7);
        rowLine.fillRect(listBounds.x + 8, y + 15, listBounds.width - 16, 1);

        const nameText = this.add
          .text(listBounds.x + 12, y, level.name, {
            fontFamily: FONTS.ui,
            fontSize: "11px",
            color: COLORS.gold,
            wordWrap: { width: 164, useAdvancedWrap: true }
          })
          .setOrigin(0, 0.5)
          .setDepth(124);
        const openButton = createTextButton(this, listBounds.x + 232, y, "Open", () => {
          this.scene.start("LevelEditorScene", { levelId: level.id, mode: "edit" });
        }, 58, { variant: "secondary" }).setDepth(126);
        const deleteButton = createTextButton(this, listBounds.x + 304, y, "Delete", () => {
          deleteLevel(level.id);
        }, 66, { variant: "danger" }).setDepth(126);

        listObjects.push(rowLine, nameText, openButton, deleteButton);
      });
    };
    const handleWheel = (_pointer, _gameObjects, _deltaX, deltaY) => {
      const maxScroll = getMaxScroll();

      if (maxScroll <= 0) {
        return;
      }

      listScroll = Phaser.Math.Clamp(listScroll + Math.sign(deltaY) * 18, 0, maxScroll);
      renderList();
    };
    const closePopup = () => {
      this.input.off("wheel", handleWheel);
      this.events.off("shutdown", closePopup);
      listObjects.forEach((object) => object.destroy());
      popupObjects.forEach((object) => object.destroy());
      this.myLevelsPopupObjects = [];
    };
    const createButton = createTextButton(this, centerX - 78, panelY + 206, "Create New Level", () => {
      this.showCreateLevelPopup(() => {
        savedLevels = this.loadSavedUserLevels();
        listScroll = Phaser.Math.Clamp(listScroll, 0, getMaxScroll());
        renderList();
      });
    }, 158, { variant: "danger" }).setDepth(126);
    const backButton = createTextButton(this, centerX + 112, panelY + 206, "Back", closePopup, 104, {
      variant: "secondary"
    }).setDepth(126);

    popupObjects.push(createButton, backButton);
    this.myLevelsPopupObjects = popupObjects;
    this.input.on("wheel", handleWheel);
    this.events.once("shutdown", closePopup);
    renderList();
  }

  showCreateLevelPopup(onCreated) {
    if (this.createLevelPopupObjects?.length) {
      return;
    }

    const panelWidth = 392;
    const panelHeight = 224;
    const panelX = (GAME_WIDTH - panelWidth) / 2;
    const panelY = (GAME_HEIGHT - panelHeight) / 2;
    const centerX = GAME_WIDTH / 2;
    const popupObjects = [];
    let levelName = "";
    let selectedBackgroundIndex = 0;
    let isNameFieldFocused = true;
    const nameMaxLength = 24;
    const backgroundButtons = [];

    const blocker = this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x070302, 0.82)
      .setDepth(130)
      .setInteractive();

    popupObjects.push(blocker);
    popupObjects.push(drawPixelDialogFrame(this, panelX, panelY, panelWidth, panelHeight, 140));

    const titlePlate = this.add.graphics().setDepth(141);
    titlePlate.fillStyle(0x090403, 1);
    titlePlate.fillRect(centerX - 116, panelY + 18, 232, 38);
    titlePlate.fillStyle(0x5c3218, 1);
    titlePlate.fillRect(centerX - 108, panelY + 24, 216, 26);
    titlePlate.fillStyle(COLOR_VALUES.gold, 1);
    titlePlate.fillRect(centerX - 102, panelY + 27, 204, 3);
    titlePlate.fillRect(centerX - 102, panelY + 47, 204, 3);
    titlePlate.fillStyle(0xffefad, 0.34);
    titlePlate.fillRect(centerX - 88, panelY + 31, 176, 1);
    popupObjects.push(titlePlate);

    const title = this.add
      .text(centerX, panelY + 38, "Create Level", {
        fontFamily: FONTS.title,
        fontSize: "20px",
        color: COLORS.gold,
        stroke: "#120905",
        strokeThickness: 4
      })
      .setOrigin(0.5)
      .setDepth(154);
    const nameLabel = this.add
      .text(panelX + 48, panelY + 76, "Level name", {
        fontFamily: FONTS.ui,
        fontSize: "11px",
        color: COLORS.gold
      })
      .setOrigin(0, 0.5)
      .setDepth(154);
    const nameBox = this.add.graphics().setDepth(142);
    const nameText = this.add
      .text(panelX + 52, panelY + 101, "", {
        fontFamily: FONTS.ui,
        fontSize: "12px",
        color: "#fff4d0"
      })
      .setOrigin(0, 0.5)
      .setDepth(154);
    const nameHitZone = this.add
      .zone(panelX + panelWidth / 2, panelY + 101, panelWidth - 88, 30)
      .setInteractive({ useHandCursor: true })
      .setDepth(155);
    const hintText = this.add
      .text(panelX + 48, panelY + 125, "Choose background", {
        fontFamily: FONTS.ui,
        fontSize: "11px",
        color: COLORS.gold
      })
      .setOrigin(0, 0.5)
      .setDepth(154);

    popupObjects.push(title, nameLabel, nameBox, nameText, nameHitZone, hintText);

    const paintNameBox = () => {
      const trimColor = isNameFieldFocused ? COLOR_VALUES.gold : 0x8b6631;
      const displayName = levelName || (isNameFieldFocused ? "|" : "Type a name...");

      nameBox.clear();
      nameBox.fillStyle(0x090403, 1);
      nameBox.fillRect(panelX + 44, panelY + 86, panelWidth - 88, 30);
      nameBox.fillStyle(0x3a2415, 1);
      nameBox.fillRect(panelX + 48, panelY + 90, panelWidth - 96, 22);
      nameBox.fillStyle(trimColor, 1);
      nameBox.fillRect(panelX + 50, panelY + 91, panelWidth - 100, 2);
      nameBox.fillRect(panelX + 50, panelY + 109, panelWidth - 100, 2);
      nameText.setText(levelName && isNameFieldFocused ? `${levelName}|` : displayName);
      nameText.setColor(levelName || isNameFieldFocused ? "#fff4d0" : "#9b8660");
    };
    const paintBackgroundChoices = () => {
      backgroundButtons.forEach(({ frame, index }) => {
        frame.clear();
        frame.fillStyle(index === selectedBackgroundIndex ? COLOR_VALUES.gold : 0x6d4416, 1);
        frame.fillRect(-2, -2, 56, 34);
        frame.fillStyle(0x090403, 1);
        frame.fillRect(1, 1, 50, 28);
      });
    };

    paintNameBox();
    nameHitZone
      .on("pointerover", () => {
        playSoundCue(this, "ui-hover");
      })
      .on("pointerdown", () => {
        playSoundCue(this, "ui-click");
        isNameFieldFocused = true;
        paintNameBox();
      });

    for (let index = 0; index < 5; index += 1) {
      const x = panelX + 52 + index * 60;
      const y = panelY + 140;
      const background = getLevelBackground(index);
      const choice = this.add.container(x, y).setDepth(154);
      const frame = this.add.graphics();
      const thumbnail = this.textures.exists(background.key)
        ? this.add.image(26, 15, background.key).setDisplaySize(48, 26)
        : this.add.rectangle(26, 15, 48, 26, 0x5c3820);
      const number = this.add
        .text(26, 15, `${index + 1}`, {
          fontFamily: FONTS.ui,
          fontSize: "12px",
          color: "#fff4d0",
          stroke: "#120905",
          strokeThickness: 3
        })
        .setOrigin(0.5);
      const hitZone = this.add
        .zone(26, 15, 56, 34)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      choice.add([frame, thumbnail, number, hitZone]);
      backgroundButtons.push({ frame, index });
      popupObjects.push(choice);
      hitZone
        .on("pointerover", () => {
          playSoundCue(this, "ui-hover");
        })
        .on("pointerdown", () => {
          playSoundCue(this, "ui-click");
          isNameFieldFocused = false;
          selectedBackgroundIndex = index;
          paintNameBox();
          paintBackgroundChoices();
        });
    }
    paintBackgroundChoices();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closePopup();
        return;
      }

      if (!isNameFieldFocused) {
        return;
      }

      if (event.key === "Backspace") {
        event.preventDefault();
        levelName = levelName.slice(0, -1);
        paintNameBox();
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        createLevel();
        return;
      }

      if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && levelName.length < nameMaxLength) {
        event.preventDefault();
        levelName += event.key;
        paintNameBox();
      }
    };
    const closePopup = () => {
      this.input.keyboard?.off("keydown", handleKeyDown);
      this.events.off("shutdown", closePopup);
      popupObjects.forEach((object) => object.destroy());
      this.createLevelPopupObjects = [];
    };
    const createLevel = () => {
      const trimmedName = levelName.trim() || `Untitled Level ${this.loadSavedUserLevels().length + 1}`;
      const newLevel = createUserLevel(trimmedName, selectedBackgroundIndex, this.loadSavedUserLevels().length);
      const savedLevels = [...this.loadSavedUserLevels(), newLevel];

      this.saveUserLevels(savedLevels);
      closePopup();
      onCreated?.(newLevel);
      this.scene.start("LevelEditorScene", { levelId: newLevel.id, mode: "edit" });
    };
    const createButton = createTextButton(this, centerX - 68, panelY + 198, "Create", createLevel, 112, {
      variant: "danger"
    }).setDepth(156);
    const cancelButton = createTextButton(this, centerX + 68, panelY + 198, "Cancel", closePopup, 112, {
      variant: "secondary"
    }).setDepth(156);

    popupObjects.push(createButton, cancelButton);
    this.createLevelPopupObjects = popupObjects;
    this.input.keyboard?.on("keydown", handleKeyDown);
    this.events.once("shutdown", closePopup);
  }

  startPracticeLevel() {
    if (this.practiceStarted) {
      return;
    }

    this.practiceStarted = true;
    this.facingDirection = 1;
    this.staticSolids = [];
    this.movingPlatforms = [];
    this.ridingMovingPlatform = null;

    addSceneTitle(this, "Sandbox", "Practice movement without progress or timers", 56);

    createTextButton(this, 408, 24, "Main Menu", () => {
      this.scene.start("MainMenuScene");
    }, 112);

    this.player = this.physics.add.sprite(42, 198, CRAB_SPRITESHEET_KEY, CRAB_IDLE_FRAME);
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

    this.createSandboxLayout();
    this.createPushBlock();

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys("W,A,D,SPACE");

    this.add
      .text(10, GAME_HEIGHT - 18, "Practice: A/D or arrows move, W/Up/Space jumps", {
        ...LABEL_STYLE,
        fontSize: "12px"
      })
      .setDepth(20);
  }

  createSandboxLayout() {
    const solids = [
      { x: 0, y: 207, width: GAME_WIDTH, height: 63, style: "backgroundFloor" },
      { x: 60, y: 190, width: 80, height: 12, style: "ruinLedge" },
      { x: 178, y: 160, width: 70, height: 12, style: "ruinLedge" },
      { x: 344, y: 128, width: 80, height: 12, style: "ruinLedge" },
      { x: 0, y: 110, width: 54, height: 12, style: "ruinLedge" }
    ];

    solids.forEach((solid) => {
      this.drawSolidArt(solid);
      this.createStaticSolid(solid);
    });

    this.createMovingPlatform({
      x: 260,
      y: 194,
      width: 62,
      height: 10,
      fromX: 260,
      toX: 370,
      duration: 2600
    });

    this.drawSealPlate(392, 120);
  }

  createStaticSolid(rect) {
    const solid = this.add.zone(
      rect.x + rect.width / 2,
      rect.y + rect.height / 2,
      rect.width,
      rect.height
    );

    this.physics.add.existing(solid, true);
    this.physics.add.collider(this.player, solid);
    this.staticSolids.push(solid);

    return solid;
  }

  drawSolidArt(rect) {
    if (rect.style === "backgroundFloor") {
      this.drawBackgroundFloor(rect);
      return;
    }

    this.drawRuinPlatform(rect);
  }

  drawBackgroundFloor(rect) {
    if (!this.textures.exists(PYRAMID_TILEGROUND_KEY)) {
      const graphics = this.add.graphics().setDepth(3);

      graphics.fillStyle(COLORS.wallMid, 1);
      graphics.fillRect(rect.x, rect.y, rect.width, rect.height);
      graphics.lineStyle(2, COLORS.wallDark, 0.6);
      graphics.strokeRect(rect.x, rect.y, rect.width, rect.height);
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

  drawSealPlate(x, y) {
    const plate = this.add.graphics().setDepth(7);

    plate.fillStyle(0xffe7a3, 0.2);
    plate.fillEllipse(x, y + 5, 44, 18);
    plate.fillStyle(0x2c170b, 0.78);
    plate.fillRoundedRect(x - 18, y + 5, 36, 5, 2);
    plate.fillStyle(0x6d4416, 1);
    plate.fillRoundedRect(x - 16, y - 2, 32, 10, 2);
    plate.fillStyle(0x2f7967, 1);
    plate.fillRoundedRect(x - 15, y - 1, 30, 8, 2);
    plate.lineStyle(1, 0x2c170b, 0.85);
    plate.strokeRoundedRect(x - 15, y - 1, 30, 8, 2);
    plate.fillStyle(COLOR_VALUES.gold, 1);
    plate.fillEllipse(x, y + 3, 7, 5);
    plate.fillRect(x - 1, y, 2, 6);
    plate.lineBetween(x - 10, y + 3, x + 10, y + 3);

    this.add
      .text(x, y + 20, "Seal plate", {
        fontFamily: FONTS.ui,
        fontSize: "9px",
        color: COLORS.gold,
        stroke: "#2c170b",
        strokeThickness: 3
      })
      .setOrigin(0.5)
      .setDepth(8);
  }

  createMovingPlatform(platformConfig) {
    const bodyObject = this.add
      .rectangle(
        platformConfig.x + platformConfig.width / 2,
        platformConfig.y + platformConfig.height / 2,
        platformConfig.width,
        platformConfig.height,
        COLORS.sandMid,
        0.01
      )
      .setDepth(6);
    const art = this.add.graphics().setDepth(6);

    this.physics.add.existing(bodyObject);
    bodyObject.body.setAllowGravity(false);
    bodyObject.body.setImmovable(true);
    bodyObject.body.pushable = false;
    const platform = {
      ...platformConfig,
      bodyObject,
      art
    };

    this.physics.add.collider(this.player, bodyObject, () => {
      this.markPlayerRidingPlatform(platform);
    });
    this.movingPlatforms.push(platform);
  }

  drawMovingPlatformArt(platform) {
    const { bodyObject, art, width, height } = platform;
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
  }

  updateMovingPlatforms(time, delta) {
    const safeDelta = Math.max(delta || 16, 1);

    this.movingPlatforms.forEach((platform) => {
      const cycle = (time % platform.duration) / platform.duration;
      const travel = 0.5 - Math.cos(cycle * Math.PI * 2) * 0.5;
      const nextX = Phaser.Math.Linear(
        platform.fromX + platform.width / 2,
        platform.toX + platform.width / 2,
        travel
      );
      const previousX = platform.bodyObject.x;
      const deltaX = nextX - previousX;
      const shouldCarryPlayer = this.isConfirmedPlatformRider(platform, previousX);

      platform.bodyObject.setPosition(nextX, platform.bodyObject.y);
      platform.bodyObject.body.updateFromGameObject();
      platform.bodyObject.body.setVelocity((deltaX * 1000) / safeDelta, 0);
      this.drawMovingPlatformArt(platform);

      if (shouldCarryPlayer && Math.abs(deltaX) > 0) {
        this.carryPlayerWithPlatform(platform, nextX, deltaX);
      }
    });
  }

  markPlayerRidingPlatform(platform) {
    if (!this.player?.body || !this.isPlayerOverPlatform(platform)) {
      return;
    }

    const platformTop = platform.bodyObject.y - platform.height / 2;

    this.ridingMovingPlatform = platform;
    platform.riderSeenAt = this.time.now;
    platform.riderOffsetX = this.player.x - platform.bodyObject.x;
    platform.riderOffsetY = this.player.y - platformTop;
  }

  isConfirmedPlatformRider(platform, platformCenterX) {
    if (this.ridingMovingPlatform !== platform) {
      return false;
    }

    if (this.time.now - (platform.riderSeenAt || 0) > 160) {
      return false;
    }

    return this.isPlayerOverPlatform(platform, platformCenterX);
  }

  isPlayerOverPlatform(platform, platformCenterX = platform.bodyObject.x) {
    const body = this.player.body;
    const platformLeft = platformCenterX - platform.width / 2;
    const platformRight = platformCenterX + platform.width / 2;
    const platformTop = platform.bodyObject.y - platform.height / 2;
    const playerCenterX = body.x + body.width / 2;
    const playerBottom = body.y + body.height;

    return (
      playerCenterX >= platformLeft + 4 &&
      playerCenterX <= platformRight - 4 &&
      playerBottom >= platformTop - 8 &&
      playerBottom <= platformTop + 8 &&
      body.velocity.y >= -8
    );
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

  carryPlayerWithPlatform(platform, nextPlatformX, deltaX) {
    let nextPlayerX;

    if (this.isHorizontalMoveInputDown()) {
      nextPlayerX = Phaser.Math.Clamp(this.player.x + deltaX, 0, GAME_WIDTH);
      platform.riderOffsetX = nextPlayerX - nextPlatformX;
    } else {
      nextPlayerX = Phaser.Math.Clamp(
        nextPlatformX + (platform.riderOffsetX || 0),
        0,
        GAME_WIDTH
      );
    }

    this.player.setPosition(nextPlayerX, this.player.y);
    this.player.body.updateFromGameObject();
  }

  createPushBlock() {
    this.pushBlock = this.add
      .rectangle(166, 197, 22, 20, COLORS.stone, 1)
      .setStrokeStyle(2, COLORS.wallDark, 0.95)
      .setDepth(7);
    this.pushBlockMarkings = this.add.graphics().setDepth(8);

    this.physics.add.existing(this.pushBlock);
    this.pushBlock.body.setAllowGravity(true);
    this.pushBlock.body.setCollideWorldBounds(true);
    this.pushBlock.body.setBounce(0);
    this.pushBlock.body.setDragX(620);
    this.pushBlock.body.setMaxVelocity(70, 380);
    this.physics.add.collider(this.player, this.pushBlock);

    this.staticSolids.forEach((solid) => {
      this.physics.add.collider(this.pushBlock, solid);
    });
    this.movingPlatforms.forEach((platform) => {
      this.physics.add.collider(this.pushBlock, platform.bodyObject);
    });

    this.drawPushBlockMarkings();
  }

  drawPushBlockMarkings() {
    const left = this.pushBlock.x - 11;
    const top = this.pushBlock.y - 10;

    this.pushBlockMarkings.clear();
    this.pushBlockMarkings.lineStyle(1, COLOR_VALUES.gold, 0.82);
    this.pushBlockMarkings.strokeRect(left + 4, top + 4, 14, 12);
    this.pushBlockMarkings.fillStyle(COLOR_VALUES.gold, 0.94);
    this.pushBlockMarkings.fillEllipse(this.pushBlock.x, this.pushBlock.y, 8, 5);
    this.pushBlockMarkings.fillRect(this.pushBlock.x - 1, top + 5, 2, 10);
    this.pushBlockMarkings.lineStyle(1, COLORS.bronzeDark, 0.65);
    this.pushBlockMarkings.lineBetween(left + 4, this.pushBlock.y, left + 18, this.pushBlock.y);
  }

  resetSandboxObjectsIfNeeded() {
    if (this.player.y > GAME_HEIGHT + 24) {
      this.player.setPosition(42, 198);
      this.player.body.reset(42, 198);
      this.player.setVelocity(0, 0);
    }

    if (this.pushBlock.y > GAME_HEIGHT + 24) {
      this.pushBlock.setPosition(166, 197);
      this.pushBlock.body.reset(166, 197);
      this.pushBlock.body.setVelocity(0, 0);
    }
  }

  updatePlayerMovement() {
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

  update(_, delta) {
    if (!this.practiceStarted || !this.player) {
      return;
    }

    this.updateMovingPlatforms(this.time.now, delta);
    this.updatePlayerMovement();
    this.updatePlayerAnimation(this.time.now);
    this.drawPushBlockMarkings();
    this.resetSandboxObjectsIfNeeded();
  }
}
