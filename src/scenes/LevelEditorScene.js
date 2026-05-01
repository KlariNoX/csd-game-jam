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
import { addCrtOverlay, createTextButton } from '../ui/buttons.js';
import {
  addLevelBackground,
  ensureCrabAnimations,
  preloadCrabSpritesheetIfNeeded,
  preloadLevelBackgroundIfNeeded,
  preloadPyramidRuinsAssetsIfNeeded
} from '../ui/backgrounds.js';
import { findUserLevel, normalizeUserLevel, upsertUserLevel } from '../state/userLevels.js';

const GRID_SIZE = 8;
const EDIT_AREA_TOP = 38;
const EDIT_AREA_BOTTOM = 236;
const RESIZE_HANDLE_RADIUS = 10;
const TOOL_BUTTON_WIDTH = 50;
const TOOL_BUTTON_HEIGHT = 24;

const EDITOR_TOOLS = [
  { id: "floor", label: "Floor" },
  { id: "ledge", label: "Ledge" },
  { id: "movingPlatform", label: "Plat" },
  { id: "spike", label: "Spike" },
  { id: "block", label: "Block" },
  { id: "goal", label: "Exit" },
  { id: "start", label: "Crab" },
  { id: "erase", label: "Erase" }
];

function makeEditorObjectId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function clampRectToWorld(x, y, width, height) {
  return {
    x: Phaser.Math.Clamp(x, 0, GAME_WIDTH - width),
    y: Phaser.Math.Clamp(y, EDIT_AREA_TOP, EDIT_AREA_BOTTOM - height),
    width,
    height
  };
}

// First custom level engine: edit a saved user level, then play-test it with real physics.
export class LevelEditorScene extends Phaser.Scene {
  constructor() {
    super("LevelEditorScene");
  }

  preload() {
    for (let backgroundIndex = 0; backgroundIndex < 5; backgroundIndex += 1) {
      preloadLevelBackgroundIfNeeded(this, backgroundIndex);
    }

    preloadPyramidRuinsAssetsIfNeeded(this);
    preloadCrabSpritesheetIfNeeded(this);
  }

  create(data = {}) {
    const levelId = data.levelId || this.registry.get("selectedUserLevelId");
    const savedLevel = findUserLevel(levelId);

    if (!savedLevel) {
      this.scene.start("SandboxScene");
      return;
    }

    this.level = normalizeUserLevel(savedLevel);
    this.mode = data.mode === "play" ? "play" : "edit";
    this.selectedTool = "ledge";
    this.isDirty = false;
    this.buildObjects = [];
    this.toolButtons = [];
    this.staticSolids = [];
    this.movingPlatforms = [];
    this.pushBlocks = [];
    this.ridingMovingPlatform = null;
    this.playtestWon = false;
    this.facingDirection = 1;
    this.selectedEditorTarget = null;
    this.dragState = null;
    this.resizeState = null;

    this.registry.set("selectedUserLevelId", this.level.id);
    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.cameras.main.setBackgroundColor("#120d07");
    playBackgroundMusic(this, "bg-music");
    ensureCrabAnimations(this);

    addLevelBackground(this, this.level.backgroundIndex);
    this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x120d07, 0.18)
      .setDepth(-7);

    this.drawTopHud();

    if (this.mode === "play") {
      this.physics.world.resume();
      this.startPlaytest();
    } else {
      this.physics.world.pause();
      this.drawToolPalette();
      this.renderEditor();
      this.handleEditorPointerDown = (pointer) => this.onEditorPointerDown(pointer);
      this.handleEditorPointerMove = (pointer) => this.onEditorPointerMove(pointer);
      this.handleEditorPointerUp = () => this.onEditorPointerUp();
      this.handleFlipSpike = () => this.flipSelectedSpike();
      this.input.on("pointerdown", this.handleEditorPointerDown);
      this.input.on("pointermove", this.handleEditorPointerMove);
      this.input.on("pointerup", this.handleEditorPointerUp);
      this.input.keyboard?.on("keydown-R", this.handleFlipSpike);
    }

    this.handleEscape = () => {
      if (this.mode === "play") {
        this.scene.restart({ levelId: this.level.id, mode: "edit" });
        return;
      }

      this.scene.start("SandboxScene");
    };
    this.input.keyboard?.on("keydown-ESC", this.handleEscape);
    this.events.once("shutdown", () => {
      if (this.handleEditorPointerDown) {
        this.input.off("pointerdown", this.handleEditorPointerDown);
        this.input.off("pointermove", this.handleEditorPointerMove);
        this.input.off("pointerup", this.handleEditorPointerUp);
        this.input.keyboard?.off("keydown-R", this.handleFlipSpike);
      }

      this.input.keyboard?.off("keydown-ESC", this.handleEscape);
    });

    addCrtOverlay(this);
  }

  drawTopHud() {
    const title = this.mode === "play"
      ? `${this.level.name} - Test`
      : `${this.level.name} - Editor`;

    createTextButton(this, 40, 20, "Back", () => {
      this.scene.start("SandboxScene");
    }, 68, { variant: "secondary" }).setDepth(60);

    createTextButton(this, 340, 20, "Save", () => {
      this.saveCurrentLevel();
    }, 72).setDepth(60);

    createTextButton(this, 424, 20, this.mode === "play" ? "Edit" : "Test", () => {
      if (this.mode === "play") {
        this.scene.restart({ levelId: this.level.id, mode: "edit" });
        return;
      }

      this.saveCurrentLevel(true);
      this.scene.restart({ levelId: this.level.id, mode: "play" });
    }, 76, { variant: "danger" }).setDepth(60);

    this.add
      .text(190, 19, title, {
        fontFamily: FONTS.title,
        fontSize: "14px",
        color: COLORS.gold,
        stroke: "#120905",
        strokeThickness: 4,
        align: "center",
        wordWrap: { width: 210, useAdvancedWrap: true }
      })
      .setOrigin(0.5)
      .setDepth(61);

    this.statusText = this.add
      .text(GAME_WIDTH / 2, this.mode === "play" ? 250 : 232, "", {
        ...LABEL_STYLE,
        fontSize: "10px",
        color: "#fff4d0",
        align: "center",
        wordWrap: { width: 300, useAdvancedWrap: true }
      })
      .setOrigin(0.5)
      .setDepth(61);

    this.showStatus(
      this.mode === "play"
        ? "Play test: reach the exit. Esc returns to editor."
        : "Click empty grid to place. Drag objects or corner boxes."
    );
  }

  drawToolPalette() {
    const startX = 51;

    EDITOR_TOOLS.forEach((tool, index) => {
      const button = this.createToolButton(startX + index * 54, 252, tool);

      this.toolButtons.push(button);
    });
  }

  createToolButton(x, y, tool) {
    const button = this.add.container(x, y).setDepth(60);
    const background = this.add.graphics();
    const label = this.add
      .text(0, 0, tool.label, {
        fontFamily: FONTS.ui,
        fontSize: "8px",
        color: "#fff4d0",
        fontStyle: "bold"
      })
      .setOrigin(0.5)
      .setShadow(0, 1, "#120905", 0, true, true);
    const hitZone = this.add
      .zone(0, 0, TOOL_BUTTON_WIDTH, TOOL_BUTTON_HEIGHT)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    button.toolId = tool.id;
    button.background = background;
    button.label = label;
    button.add([background, label, hitZone]);
    this.paintToolButton(button);

    hitZone
      .on("pointerover", () => {
        playSoundCue(this, "ui-hover");
        this.paintToolButton(button, true);
      })
      .on("pointerout", () => {
        this.paintToolButton(button);
      })
      .on("pointerdown", () => {
        playSoundCue(this, "ui-click");
        this.selectedTool = tool.id;
        this.refreshToolButtons();
      });

    return button;
  }

  paintToolButton(button, isHover = false) {
    const isActive = button.toolId === this.selectedTool;
    const fill = isActive ? 0x704020 : isHover ? 0x5c3820 : 0x3a2415;
    const trim = isActive ? COLOR_VALUES.gold : 0x9a6b34;

    button.background.clear();
    button.background.fillStyle(0x090403, 0.72);
    button.background.fillRect(-TOOL_BUTTON_WIDTH / 2 + 2, -TOOL_BUTTON_HEIGHT / 2 + 3, TOOL_BUTTON_WIDTH, TOOL_BUTTON_HEIGHT);
    button.background.fillStyle(0x120905, 1);
    button.background.fillRect(-TOOL_BUTTON_WIDTH / 2, -TOOL_BUTTON_HEIGHT / 2, TOOL_BUTTON_WIDTH, TOOL_BUTTON_HEIGHT);
    button.background.fillStyle(fill, 1);
    button.background.fillRect(-TOOL_BUTTON_WIDTH / 2 + 3, -TOOL_BUTTON_HEIGHT / 2 + 3, TOOL_BUTTON_WIDTH - 6, TOOL_BUTTON_HEIGHT - 6);
    button.background.fillStyle(trim, 1);
    button.background.fillRect(-TOOL_BUTTON_WIDTH / 2 + 4, -TOOL_BUTTON_HEIGHT / 2 + 4, TOOL_BUTTON_WIDTH - 8, 2);
    button.background.fillRect(-TOOL_BUTTON_WIDTH / 2 + 4, TOOL_BUTTON_HEIGHT / 2 - 6, TOOL_BUTTON_WIDTH - 8, 2);
    button.label.setColor(isActive || isHover ? "#ffe08a" : "#fff4d0");
  }

  refreshToolButtons() {
    this.toolButtons.forEach((button) => this.paintToolButton(button));
  }

  snapToGrid(value) {
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
  }

  isPointerInEditArea(pointer) {
    if (pointer.y < EDIT_AREA_TOP || pointer.y > EDIT_AREA_BOTTOM) {
      return false;
    }

    return true;
  }

  onEditorPointerDown(pointer) {
    if (this.selectedTool === "erase") {
      if (!this.isPointerInEditArea(pointer)) {
        return;
      }

      if (this.eraseAt(pointer.x, pointer.y)) {
        this.selectedEditorTarget = null;
        this.dragState = null;
        this.resizeState = null;
        this.markDirty("Removed object.");
        this.renderEditor();
      }
      return;
    }

    const resizeHandle = this.findResizeHandleAt(pointer.x, pointer.y);

    if (resizeHandle) {
      playSoundCue(this, "ui-click");
      this.resizeState = this.createResizeState(resizeHandle);
      this.dragState = null;
      this.showStatus("Resize selected object by dragging the corner.", COLORS.gold);
      return;
    }

    if (!this.isPointerInEditArea(pointer)) {
      return;
    }

    const target = this.findEditableTargetAt(pointer.x, pointer.y);

    if (target) {
      playSoundCue(this, "ui-click");
      this.selectedEditorTarget = target;
      this.dragState = this.createDragState(target, pointer.x, pointer.y);
      this.resizeState = null;
      this.showStatus(
        this.isSpikeTarget(target)
          ? "Selected spike. Drag it, or press R to flip."
          : "Selected object. Drag it around the grid.",
        COLORS.gold
      );
      this.renderEditor();
      return;
    }

    const x = this.snapToGrid(pointer.x);
    const y = this.snapToGrid(pointer.y);

    this.selectedEditorTarget = null;
    this.applyToolAt(x, y, pointer.x, pointer.y);
  }

  onEditorPointerMove(pointer) {
    if (this.resizeState && pointer.isDown) {
      if (this.resizeSelectedTarget(pointer.x, pointer.y)) {
        this.resizeState.moved = true;
        this.renderEditor();
      }
      return;
    }

    if (!this.dragState || !pointer.isDown) {
      return;
    }

    if (this.moveDragTarget(pointer.x, pointer.y)) {
      this.dragState.moved = true;
      this.renderEditor();
    }
  }

  onEditorPointerUp() {
    if (this.resizeState) {
      if (this.resizeState.moved) {
        this.markDirty("Resized object. Save when ready.");
        this.renderEditor();
      }

      this.resizeState = null;
      return;
    }

    if (!this.dragState) {
      return;
    }

    if (this.dragState.moved) {
      this.markDirty("Moved object. Save when ready.");
      this.renderEditor();
    }

    this.dragState = null;
  }

  isSpikeTarget(target) {
    return target?.kind === "hazard" && target.item?.type === "spike";
  }

  canResizeTarget(target = this.selectedEditorTarget) {
    return Boolean(target?.item && target.kind !== "start");
  }

  getSelectionRect(target = this.selectedEditorTarget) {
    if (!target?.item) {
      return null;
    }

    const item = target.item;

    if (target.kind === "start") {
      return {
        x: item.x - 16,
        y: item.y - 34,
        width: 32,
        height: 42
      };
    }

    return {
      x: item.x - 4,
      y: item.y - 4,
      width: item.width + 8,
      height: item.height + 8
    };
  }

  findResizeHandleAt(x, y) {
    if (!this.canResizeTarget()) {
      return null;
    }

    const rect = this.getSelectionRect();

    if (!rect) {
      return null;
    }

    const handles = [
      { corner: "nw", x: rect.x, y: rect.y },
      { corner: "ne", x: rect.x + rect.width, y: rect.y },
      { corner: "sw", x: rect.x, y: rect.y + rect.height },
      { corner: "se", x: rect.x + rect.width, y: rect.y + rect.height }
    ];

    return handles.find((handle) => (
      Math.abs(x - handle.x) <= RESIZE_HANDLE_RADIUS &&
      Math.abs(y - handle.y) <= RESIZE_HANDLE_RADIUS
    )) || null;
  }

  createResizeState(handle) {
    const target = this.selectedEditorTarget;
    const item = target.item;

    return {
      target,
      corner: handle.corner,
      startX: item.x,
      startY: item.y,
      startWidth: item.width,
      startHeight: item.height,
      startFromX: item.fromX,
      startToX: item.toX,
      startFromY: item.fromY,
      startToY: item.toY,
      moved: false
    };
  }

  getMinimumSizeForTarget(target) {
    if (target.kind === "hazard" && target.item.type === "spike") {
      return { width: 8, height: 8 };
    }

    if (target.item.type === "movingPlatform") {
      return { width: 24, height: 8 };
    }

    if (target.item.type === "block") {
      return { width: 12, height: 12 };
    }

    return { width: 16, height: 8 };
  }

  resizeSelectedTarget(pointerX, pointerY) {
    const { target, corner, startX, startY, startWidth, startHeight } = this.resizeState;
    const item = target.item;
    const minSize = this.getMinimumSizeForTarget(target);
    const originalRight = startX + startWidth;
    const originalBottom = startY + startHeight;
    let nextX = startX;
    let nextY = startY;
    let nextWidth = startWidth;
    let nextHeight = startHeight;
    const snappedX = this.snapToGrid(pointerX);
    const snappedY = this.snapToGrid(pointerY);

    if (corner.includes("w")) {
      nextX = Phaser.Math.Clamp(snappedX, 0, originalRight - minSize.width);
      nextWidth = originalRight - nextX;
    } else {
      const nextRight = Phaser.Math.Clamp(snappedX, startX + minSize.width, GAME_WIDTH);
      nextWidth = nextRight - startX;
    }

    if (corner.includes("n")) {
      nextY = Phaser.Math.Clamp(snappedY, EDIT_AREA_TOP, originalBottom - minSize.height);
      nextHeight = originalBottom - nextY;
    } else {
      const nextBottom = Phaser.Math.Clamp(snappedY, startY + minSize.height, EDIT_AREA_BOTTOM);
      nextHeight = nextBottom - startY;
    }

    if (
      item.x === nextX &&
      item.y === nextY &&
      item.width === nextWidth &&
      item.height === nextHeight
    ) {
      return false;
    }

    item.x = nextX;
    item.y = nextY;
    item.width = nextWidth;
    item.height = nextHeight;

    if (item.type === "movingPlatform") {
      const centerShiftX = nextX + nextWidth / 2 - (startX + startWidth / 2);
      const centerShiftY = nextY + nextHeight / 2 - (startY + startHeight / 2);
      const maxX = GAME_WIDTH - item.width;
      const maxY = EDIT_AREA_BOTTOM - item.height;

      item.fromX = Phaser.Math.Clamp((this.resizeState.startFromX ?? startX) + centerShiftX, 0, maxX);
      item.toX = Phaser.Math.Clamp((this.resizeState.startToX ?? startX) + centerShiftX, 0, maxX);
      item.fromY = Phaser.Math.Clamp((this.resizeState.startFromY ?? startY) + centerShiftY, EDIT_AREA_TOP, maxY);
      item.toY = Phaser.Math.Clamp((this.resizeState.startToY ?? startY) + centerShiftY, EDIT_AREA_TOP, maxY);
    }

    return true;
  }

  flipSelectedSpike() {
    if (!this.isSpikeTarget(this.selectedEditorTarget)) {
      this.showStatus("Select a spike first, then press R to flip it.", "#ffe08a");
      return;
    }

    const spike = this.selectedEditorTarget.item;

    spike.direction = spike.direction === "down" ? "up" : "down";
    this.markDirty(`Spike faces ${spike.direction}. Save when ready.`);
    this.renderEditor();
  }

  findEditableTargetAt(x, y) {
    const layout = this.level.layout;
    const contains = (item) => Boolean(
      item &&
      x >= item.x &&
      x <= item.x + item.width &&
      y >= item.y &&
      y <= item.y + item.height
    );
    const findLastHit = (items) => {
      for (let index = items.length - 1; index >= 0; index -= 1) {
        if (contains(items[index])) {
          return items[index];
        }
      }

      return null;
    };

    if (
      Math.abs(x - layout.playerStart.x) <= 16 &&
      Math.abs(y - layout.playerStart.y) <= 22
    ) {
      return { kind: "start", item: layout.playerStart };
    }

    const object = findLastHit(layout.objects);

    if (object) {
      return { kind: "object", item: object };
    }

    const hazard = findLastHit(layout.hazards);

    if (hazard) {
      return { kind: "hazard", item: hazard };
    }

    if (contains(layout.goal)) {
      return { kind: "goal", item: layout.goal };
    }

    const solid = findLastHit(layout.solids);

    if (solid) {
      return { kind: "solid", item: solid };
    }

    return null;
  }

  createDragState(target, pointerX, pointerY) {
    if (target.kind === "start") {
      return {
        target,
        offsetX: pointerX - target.item.x,
        offsetY: pointerY - target.item.y,
        moved: false
      };
    }

    return {
      target,
      offsetX: pointerX - target.item.x,
      offsetY: pointerY - target.item.y,
      moved: false
    };
  }

  moveDragTarget(pointerX, pointerY) {
    const { target, offsetX, offsetY } = this.dragState;

    if (target.kind === "start") {
      const nextX = Phaser.Math.Clamp(this.snapToGrid(pointerX - offsetX), 12, GAME_WIDTH - 12);
      const nextY = Phaser.Math.Clamp(this.snapToGrid(pointerY - offsetY), EDIT_AREA_TOP + 24, EDIT_AREA_BOTTOM);

      if (nextX === target.item.x && nextY === target.item.y) {
        return false;
      }

      target.item.x = nextX;
      target.item.y = nextY;
      return true;
    }

    const previousX = target.item.x;
    const previousY = target.item.y;
    const nextRect = clampRectToWorld(
      this.snapToGrid(pointerX - offsetX),
      this.snapToGrid(pointerY - offsetY),
      target.item.width,
      target.item.height
    );

    if (nextRect.x === previousX && nextRect.y === previousY) {
      return false;
    }

    target.item.x = nextRect.x;
    target.item.y = nextRect.y;

    if (target.item.type === "movingPlatform") {
      const deltaX = target.item.x - previousX;
      const deltaY = target.item.y - previousY;
      const maxX = GAME_WIDTH - target.item.width;
      const maxY = EDIT_AREA_BOTTOM - target.item.height;

      target.item.fromX = Phaser.Math.Clamp((target.item.fromX ?? previousX) + deltaX, 0, maxX);
      target.item.toX = Phaser.Math.Clamp((target.item.toX ?? previousX) + deltaX, 0, maxX);
      target.item.fromY = Phaser.Math.Clamp((target.item.fromY ?? previousY) + deltaY, EDIT_AREA_TOP, maxY);
      target.item.toY = Phaser.Math.Clamp((target.item.toY ?? previousY) + deltaY, EDIT_AREA_TOP, maxY);
    }

    return true;
  }

  applyToolAt(x, y, rawX, rawY) {
    const layout = this.level.layout;
    let placedObject = null;

    if (this.selectedTool === "floor") {
      placedObject = {
        id: makeEditorObjectId("solid"),
        type: "floor",
        style: "backgroundFloor",
        ...clampRectToWorld(x - 48, y - 12, 96, 32)
      };
      layout.solids.push(placedObject);
      this.selectedEditorTarget = { kind: "solid", item: placedObject };
    } else if (this.selectedTool === "ledge") {
      placedObject = {
        id: makeEditorObjectId("solid"),
        type: "ledge",
        style: "ruinLedge",
        ...clampRectToWorld(x - 40, y - 6, 80, 12)
      };
      layout.solids.push(placedObject);
      this.selectedEditorTarget = { kind: "solid", item: placedObject };
    } else if (this.selectedTool === "movingPlatform") {
      const platform = {
        id: makeEditorObjectId("object"),
        type: "movingPlatform",
        ...clampRectToWorld(x - 32, y - 5, 64, 10)
      };

      platform.fromX = Phaser.Math.Clamp(platform.x - 48, 0, GAME_WIDTH - platform.width);
      platform.toX = Phaser.Math.Clamp(platform.x + 48, 0, GAME_WIDTH - platform.width);
      platform.fromY = platform.y;
      platform.toY = platform.y;
      platform.duration = 2600;
      layout.objects.push(platform);
      this.selectedEditorTarget = { kind: "object", item: platform };
    } else if (this.selectedTool === "spike") {
      placedObject = {
        id: makeEditorObjectId("hazard"),
        type: "spike",
        direction: "up",
        ...clampRectToWorld(x - 8, y - 8, 16, 16)
      };
      layout.hazards.push(placedObject);
      this.selectedEditorTarget = { kind: "hazard", item: placedObject };
    } else if (this.selectedTool === "block") {
      placedObject = {
        id: makeEditorObjectId("object"),
        type: "block",
        ...clampRectToWorld(x - 10, y - 9, 20, 18)
      };
      layout.objects.push(placedObject);
      this.selectedEditorTarget = { kind: "object", item: placedObject };
    } else if (this.selectedTool === "goal") {
      layout.goal = {
        ...clampRectToWorld(x - 17, y - 24, 34, 48)
      };
      this.selectedEditorTarget = { kind: "goal", item: layout.goal };
    } else if (this.selectedTool === "start") {
      layout.playerStart = {
        x: Phaser.Math.Clamp(x, 12, GAME_WIDTH - 12),
        y: Phaser.Math.Clamp(y, EDIT_AREA_TOP + 24, EDIT_AREA_BOTTOM)
      };
      this.selectedEditorTarget = { kind: "start", item: layout.playerStart };
    }

    this.markDirty("Placed object. Save when ready.");
    this.renderEditor();
  }

  eraseAt(x, y) {
    const contains = (item) => (
      x >= item.x &&
      x <= item.x + item.width &&
      y >= item.y &&
      y <= item.y + item.height
    );
    const layout = this.level.layout;
    const groups = [layout.objects, layout.hazards, layout.solids];

    if (layout.goal && contains(layout.goal)) {
      layout.goal = null;
      return true;
    }

    if (
      Math.abs(x - layout.playerStart.x) <= 14 &&
      Math.abs(y - layout.playerStart.y) <= 18
    ) {
      layout.playerStart = { x: 42, y: 198 };
      return true;
    }

    for (const group of groups) {
      const index = group.findIndex(contains);

      if (index >= 0) {
        group.splice(index, 1);
        return true;
      }
    }

    return false;
  }

  markDirty(message) {
    this.isDirty = true;
    this.showStatus(message, "#ffe08a");
  }

  saveCurrentLevel(silent = false) {
    this.level = upsertUserLevel(this.level);
    this.isDirty = false;

    if (!silent) {
      this.showStatus("Saved custom level.", COLORS.gold);
    }
  }

  showStatus(message, color = "#fff4d0") {
    if (!this.statusText) {
      return;
    }

    this.statusText.setText(message).setColor(color);
  }

  clearBuildObjects() {
    this.buildObjects.forEach((object) => object.destroy());
    this.buildObjects = [];
  }

  trackBuild(object) {
    this.buildObjects.push(object);
    return object;
  }

  renderEditor() {
    this.clearBuildObjects();
    this.drawEditorGrid();
    this.level.layout.solids.forEach((solid) => this.drawSolidArt(solid));
    this.level.layout.objects.forEach((object) => this.drawEditorObject(object));
    this.level.layout.hazards.forEach((hazard) => this.drawHazardArt(hazard));
    this.drawGoalArt(this.level.layout.goal);
    this.drawPlayerStartMarker(this.level.layout.playerStart);
    this.drawSelectionHighlight();
  }

  drawSelectionHighlight() {
    if (!this.selectedEditorTarget?.item) {
      return;
    }

    const rect = this.getSelectionRect();

    if (!rect) {
      return;
    }

    const selection = this.trackBuild(this.add.graphics().setDepth(28));

    selection.lineStyle(2, COLOR_VALUES.gold, 0.95);
    selection.strokeRect(rect.x, rect.y, rect.width, rect.height);
    selection.fillStyle(0xffe08a, 0.82);
    selection.fillRect(rect.x - 2, rect.y - 2, 6, 6);
    selection.fillRect(rect.x + rect.width - 4, rect.y - 2, 6, 6);
    selection.fillRect(rect.x - 2, rect.y + rect.height - 4, 6, 6);
    selection.fillRect(rect.x + rect.width - 4, rect.y + rect.height - 4, 6, 6);
  }

  drawEditorGrid() {
    const grid = this.trackBuild(this.add.graphics().setDepth(1));

    grid.lineStyle(1, 0xf3d36b, 0.12);

    for (let x = 0; x <= GAME_WIDTH; x += GRID_SIZE) {
      grid.lineBetween(x, EDIT_AREA_TOP, x, EDIT_AREA_BOTTOM);
    }

    for (let y = EDIT_AREA_TOP; y <= EDIT_AREA_BOTTOM; y += GRID_SIZE) {
      grid.lineBetween(0, y, GAME_WIDTH, y);
    }
  }

  drawEditorObject(object) {
    if (object.type === "movingPlatform") {
      this.drawMovingPlatformTravel(object);
      this.drawMovingPlatformSample(object);
      return;
    }

    this.drawPushBlockArt(object);
  }

  drawMovingPlatformTravel(platform) {
    const travel = this.trackBuild(this.add.graphics().setDepth(4));
    const startX = (platform.fromX ?? platform.x) + platform.width / 2;
    const endX = (platform.toX ?? platform.x) + platform.width / 2;
    const y = platform.y + platform.height / 2;

    travel.lineStyle(1, COLOR_VALUES.gold, 0.65);
    travel.lineBetween(startX, y, endX, y);
    travel.fillStyle(COLOR_VALUES.gold, 0.86);
    travel.fillTriangle(startX, y, startX + 6, y - 4, startX + 6, y + 4);
    travel.fillTriangle(endX, y, endX - 6, y - 4, endX - 6, y + 4);
  }

  drawMovingPlatformSample(platform) {
    const art = this.trackBuild(this.add.graphics().setDepth(6));

    this.paintMovingPlatformArt(art, platform.x, platform.y, platform.width, platform.height);
  }

  drawSolidArt(rect) {
    if (rect.style === "backgroundFloor" || rect.type === "floor") {
      this.drawBackgroundFloor(rect);
      return;
    }

    this.drawRuinPlatform(rect);
  }

  drawBackgroundFloor(rect) {
    if (!this.textures.exists(PYRAMID_TILEGROUND_KEY)) {
      const graphics = this.trackBuild(this.add.graphics().setDepth(3));

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

        const floorTile = this.trackBuild(
          this.add
            .image(tileX, tileY, PYRAMID_TILEGROUND_KEY, frame)
            .setOrigin(0)
            .setDepth(3)
        );

        if (cropWidth < tileSize || cropHeight < tileSize) {
          floorTile.setCrop(0, 0, cropWidth, cropHeight);
        }
      }
    }
  }

  drawRuinPlatform(rect) {
    const platformGraphics = this.trackBuild(this.add.graphics().setDepth(4));
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

      this.trackBuild(
        this.add
          .image(rect.x + tileIndex * 16, rect.y, PYRAMID_TILEGROUND_KEY, frame)
          .setOrigin(0)
          .setDepth(5)
      );
    }
  }

  drawHazardArt(hazard) {
    if (hazard.type !== "spike") {
      return;
    }

    const spikes = this.trackBuild(this.add.graphics().setDepth(7));
    const pointsDown = hazard.direction === "down";
    const baseY = pointsDown ? hazard.y : hazard.y + hazard.height;
    const baseLineY = pointsDown ? baseY + 4 : baseY - 4;
    const tipY = pointsDown ? hazard.y + hazard.height : hazard.y;
    const centerX = hazard.x + hazard.width / 2;

    spikes.fillStyle(COLORS.bronzeDark, 1);
    spikes.fillRect(hazard.x, pointsDown ? baseY : baseY - 4, hazard.width, 4);
    spikes.fillStyle(COLORS.bronze, 1);
    spikes.fillTriangle(hazard.x, baseLineY, centerX, tipY, hazard.x + hazard.width, baseLineY);
    spikes.lineStyle(1, COLORS.bronzeDark, 0.72);
    spikes.strokeTriangle(hazard.x, baseLineY, centerX, tipY, hazard.x + hazard.width, baseLineY);
  }

  drawGoalArt(goal) {
    if (!goal) {
      return;
    }

    const graphics = this.trackBuild(this.add.graphics().setDepth(6));

    graphics.fillStyle(COLORS.wallDark, 1);
    graphics.fillRoundedRect(goal.x, goal.y, goal.width, goal.height, { tl: 12, tr: 12, bl: 0, br: 0 });
    graphics.lineStyle(2, COLORS.bronzeDark, 1);
    graphics.strokeRoundedRect(goal.x, goal.y, goal.width, goal.height, { tl: 12, tr: 12, bl: 0, br: 0 });
    graphics.fillStyle(COLORS.bronze, 0.72);
    graphics.fillRect(goal.x + 5, goal.y + 18, goal.width - 10, goal.height - 18);
    graphics.fillStyle(COLOR_VALUES.gold, 1);
    graphics.fillCircle(goal.x + goal.width / 2, goal.y + 28, 3);

    this.trackBuild(
      this.add
        .text(goal.x + goal.width / 2, goal.y - 8, "EXIT", {
          fontFamily: FONTS.ui,
          fontSize: "8px",
          color: COLORS.gold,
          stroke: "#120905",
          strokeThickness: 2
        })
        .setOrigin(0.5)
        .setDepth(8)
    );
  }

  drawPlayerStartMarker(playerStart) {
    const marker = this.trackBuild(this.add.graphics().setDepth(8));

    marker.fillStyle(0x120905, 0.75);
    marker.fillEllipse(playerStart.x, playerStart.y + 3, 32, 9);
    marker.lineStyle(2, COLOR_VALUES.gold, 0.94);
    marker.strokeCircle(playerStart.x, playerStart.y - 14, 10);
    marker.lineBetween(playerStart.x, playerStart.y - 4, playerStart.x, playerStart.y + 6);
    marker.lineBetween(playerStart.x - 7, playerStart.y - 14, playerStart.x + 7, playerStart.y - 14);

    if (this.textures.exists(CRAB_SPRITESHEET_KEY)) {
      this.trackBuild(
        this.add
          .sprite(playerStart.x, playerStart.y, CRAB_SPRITESHEET_KEY, CRAB_IDLE_FRAME)
          .setOrigin(0.5, 1)
          .setAlpha(0.82)
          .setDepth(9)
      );
    }
  }

  drawPushBlockArt(block) {
    const body = this.trackBuild(
      this.add
        .rectangle(block.x + block.width / 2, block.y + block.height / 2, block.width, block.height, COLORS.stone, 1)
        .setStrokeStyle(2, COLORS.wallDark, 0.95)
        .setDepth(7)
    );
    const markings = this.trackBuild(this.add.graphics().setDepth(8));

    this.paintPushBlockMarkings(markings, body.x, body.y, block.width, block.height);
  }

  paintPushBlockMarkings(markings, centerX, centerY, width, height) {
    const left = centerX - width / 2;
    const top = centerY - height / 2;

    markings.clear();
    markings.lineStyle(1, COLOR_VALUES.gold, 0.82);
    markings.strokeRect(left + 4, top + 4, width - 8, height - 8);
    markings.fillStyle(COLOR_VALUES.gold, 0.94);
    markings.fillEllipse(centerX, centerY, 8, 5);
    markings.fillRect(centerX - 1, top + 5, 2, height - 10);
    markings.lineStyle(1, COLORS.bronzeDark, 0.65);
    markings.lineBetween(left + 4, centerY, left + width - 4, centerY);
  }

  paintMovingPlatformArt(art, x, y, width, height) {
    art.clear();
    art.fillStyle(0x2c170b, 0.78);
    art.fillRect(x - 2, y + height - 1, width + 4, 6);
    art.fillStyle(COLORS.sandDark, 1);
    art.fillRoundedRect(x, y, width, height, 2);
    art.fillStyle(COLORS.sandLight, 0.9);
    art.fillRect(x + 3, y + 2, width - 6, 3);
    art.lineStyle(1, COLORS.bronzeDark, 0.9);
    art.strokeRoundedRect(x, y, width, height, 2);

    for (let grooveX = x + 10; grooveX < x + width - 4; grooveX += 14) {
      art.lineBetween(grooveX, y + 2, grooveX - 4, y + height - 2);
    }
  }

  startPlaytest() {
    this.drawPlayableLevelArt();
    this.createPlayer();
    this.createCollisionWorld();
    this.createMovingPlatforms();
    this.createPushBlocks();
    this.createGoalZone();
    this.updateMovingPlatforms(this.time.now, 16);
    this.updatePushBlocks();

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys("W,A,D,SPACE");
  }

  drawPlayableLevelArt() {
    this.level.layout.solids.forEach((solid) => this.drawSolidArt(solid));
    this.level.layout.hazards.forEach((hazard) => this.drawHazardArt(hazard));
    this.level.layout.objects.forEach((object) => {
      if (object.type === "movingPlatform") {
        this.drawMovingPlatformTravel(object);
      }
    });
    this.drawGoalArt(this.level.layout.goal);
  }

  createPlayer() {
    const { playerStart } = this.level.layout;

    this.player = this.physics.add.sprite(playerStart.x, playerStart.y, CRAB_SPRITESHEET_KEY, CRAB_IDLE_FRAME);
    this.player
      .setOrigin(0.5, 1)
      .setCollideWorldBounds(true)
      .setBounce(0)
      .setDragX(1200)
      .setMaxVelocity(120, 380)
      .setDepth(10);
    this.player.body.setSize(18, 12);
    this.player.body.setOffset(7, 20);
    this.player.anims.play("crab-idle");
  }

  createCollisionWorld() {
    this.level.layout.solids.forEach((solid) => {
      const body = this.add.zone(
        solid.x + solid.width / 2,
        solid.y + solid.height / 2,
        solid.width,
        solid.height
      );

      this.physics.add.existing(body, true);
      this.physics.add.collider(this.player, body);
      this.staticSolids.push(body);
    });
  }

  createMovingPlatforms() {
    this.level.layout.objects
      .filter((object) => object.type === "movingPlatform")
      .forEach((platformConfig) => {
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
        const art = this.add.graphics().setDepth(7);

        this.physics.add.existing(bodyObject);
        bodyObject.body.setAllowGravity(false);
        bodyObject.body.setImmovable(true);
        bodyObject.body.setSize(platformConfig.width, platformConfig.height);
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
      });
  }

  createPushBlocks() {
    this.level.layout.objects
      .filter((object) => object.type === "block")
      .forEach((blockConfig) => {
        const bodyObject = this.add
          .rectangle(
            blockConfig.x + blockConfig.width / 2,
            blockConfig.y + blockConfig.height / 2,
            blockConfig.width,
            blockConfig.height,
            COLORS.stone,
            1
          )
          .setStrokeStyle(2, COLORS.wallDark, 0.95)
          .setDepth(7);
        const markings = this.add.graphics().setDepth(8);

        this.physics.add.existing(bodyObject);
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
        this.movingPlatforms.forEach((platform) => {
          this.physics.add.collider(bodyObject, platform.bodyObject);
        });
        this.pushBlocks.forEach((otherBlock) => {
          this.physics.add.collider(bodyObject, otherBlock.bodyObject);
        });

        this.pushBlocks.push({
          ...blockConfig,
          startX: blockConfig.x + blockConfig.width / 2,
          startY: blockConfig.y + blockConfig.height / 2,
          bodyObject,
          markings
        });
      });
  }

  createGoalZone() {
    const { goal } = this.level.layout;

    if (!goal) {
      return;
    }

    this.goalZone = this.add.zone(
      goal.x + goal.width / 2,
      goal.y + goal.height / 2,
      goal.width,
      goal.height
    );
    this.physics.add.existing(this.goalZone, true);
    this.physics.add.overlap(this.player, this.goalZone, () => {
      this.handleGoalReached();
    });
  }

  updateMovingPlatforms(time, delta) {
    const safeDelta = Math.max(delta || 16, 1);

    this.movingPlatforms.forEach((platform) => {
      const {
        bodyObject,
        width,
        height,
        fromX = platform.x,
        toX = platform.x,
        fromY = platform.y,
        toY = platform.y,
        duration = 2600
      } = platform;
      const cycle = (time % duration) / duration;
      const travel = 0.5 - Math.cos(cycle * Math.PI * 2) * 0.5;
      const nextX = Phaser.Math.Linear(fromX + width / 2, toX + width / 2, travel);
      const nextY = Phaser.Math.Linear(fromY + height / 2, toY + height / 2, travel);
      const previousX = bodyObject.x;
      const previousY = bodyObject.y;
      const deltaX = nextX - previousX;
      const deltaY = nextY - previousY;
      const shouldCarryPlayer = this.isConfirmedPlatformRider(platform, previousX, previousY);

      bodyObject.setPosition(nextX, nextY);
      bodyObject.body.updateFromGameObject();
      bodyObject.body.setVelocity((deltaX * 1000) / safeDelta, (deltaY * 1000) / safeDelta);
      this.paintMovingPlatformArt(platform.art, nextX - width / 2, nextY - height / 2, width, height);

      if (shouldCarryPlayer && (Math.abs(deltaX) > 0 || Math.abs(deltaY) > 0)) {
        this.carryPlayerWithPlatform(platform, nextX, nextY, deltaX);
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

  isConfirmedPlatformRider(platform, platformCenterX, platformCenterY) {
    if (this.ridingMovingPlatform !== platform) {
      return false;
    }

    if (this.time.now - (platform.riderSeenAt || 0) > 160) {
      return false;
    }

    return this.isPlayerOverPlatform(platform, platformCenterX, platformCenterY);
  }

  isPlayerOverPlatform(platform, platformCenterX = platform.bodyObject.x, platformCenterY = platform.bodyObject.y) {
    if (!this.player?.body) {
      return false;
    }

    const body = this.player.body;
    const platformLeft = platformCenterX - platform.width / 2;
    const platformRight = platformCenterX + platform.width / 2;
    const platformTop = platformCenterY - platform.height / 2;
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

  carryPlayerWithPlatform(platform, nextPlatformX, nextPlatformY, deltaX) {
    const platformTop = nextPlatformY - platform.height / 2;
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

    this.player.setPosition(nextPlayerX, platformTop + (platform.riderOffsetY ?? 0));
    this.player.body.updateFromGameObject();
  }

  updatePushBlocks() {
    this.pushBlocks.forEach((block) => {
      this.paintPushBlockMarkings(
        block.markings,
        block.bodyObject.x,
        block.bodyObject.y,
        block.width,
        block.height
      );

      if (block.bodyObject.y > GAME_HEIGHT + 24) {
        block.bodyObject.setPosition(block.startX, block.startY);
        block.bodyObject.body.reset(block.startX, block.startY);
        block.bodyObject.body.setVelocity(0, 0);
      }
    });
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

  getPlayerHitbox() {
    const { x, y, width, height } = this.player.body;

    return new Phaser.Geom.Rectangle(x + 2, y + 2, width - 4, height - 2);
  }

  checkHazards() {
    const hitbox = this.getPlayerHitbox();

    for (const hazard of this.level.layout.hazards) {
      if (hazard.type !== "spike") {
        continue;
      }

      const hazardHitbox = new Phaser.Geom.Rectangle(
        hazard.x,
        hazard.y,
        hazard.width,
        hazard.height
      );

      if (Phaser.Geom.Intersects.RectangleToRectangle(hitbox, hazardHitbox)) {
        this.resetPlayer("Hit spikes. Resetting test.");
        return;
      }
    }
  }

  resetPlayer(message = "Reset player.") {
    const { playerStart } = this.level.layout;

    this.playtestWon = false;
    this.player.setPosition(playerStart.x, playerStart.y);
    this.player.body.reset(playerStart.x, playerStart.y);
    this.player.setVelocity(0, 0);
    this.showStatus(message, "#ffe08a");
  }

  handleGoalReached() {
    if (this.playtestWon) {
      return;
    }

    this.playtestWon = true;
    this.cameras.main.flash(180, 255, 236, 160);
    playSoundCue(this, "clear");
    this.showStatus("Exit reached. Custom level works!", COLORS.gold);
  }

  update(_, delta) {
    if (this.mode !== "play" || !this.player) {
      return;
    }

    this.updateMovingPlatforms(this.time.now, delta);
    this.updatePlayerMovement();
    this.updatePlayerAnimation(this.time.now);
    this.updatePushBlocks();
    this.checkHazards();

    if (this.player.y > GAME_HEIGHT + 24) {
      this.resetPlayer("Fell out. Resetting test.");
    }
  }
}
