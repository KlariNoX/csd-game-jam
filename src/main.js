import Phaser from "phaser";

const GAME_WIDTH = 480;
const GAME_HEIGHT = 270;

const COLORS = {
  sandDark: 0x7a5326,
  sandMid: 0xc48a42,
  sandLight: 0xe6c98a,
  skyTop: 0x1b1f4b,
  skyBottom: 0xf2b661,
  stone: 0x6f5a49,
  water: 0x2f98c7,
  waterDeep: 0x165c89,
  crab: 0xd95f43,
  white: "#fff8de",
  ink: "#2c170b",
  gold: "#f3d36b",
  green: "#8bcf7a",
  red: "#e9716a"
};

const BUTTON_STYLE = {
  fontFamily: "Verdana",
  fontSize: "14px",
  color: COLORS.white,
  backgroundColor: "#4b2f1c",
  padding: { x: 14, y: 8 }
};

const LABEL_STYLE = {
  fontFamily: "Verdana",
  fontSize: "14px",
  color: COLORS.white
};

const sharedState = {
  musicOn: true,
  soundOn: true
};

function drawSky(scene) {
  const graphics = scene.add.graphics();

  graphics.fillGradientStyle(
    COLORS.skyTop,
    COLORS.skyTop,
    COLORS.skyBottom,
    COLORS.skyBottom,
    1
  );
  graphics.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  return graphics;
}

function drawDesert(scene) {
  const graphics = scene.add.graphics();

  graphics.fillStyle(COLORS.sandLight, 1);
  graphics.fillRect(0, 160, GAME_WIDTH, 110);

  graphics.fillStyle(COLORS.sandMid, 1);
  graphics.fillTriangle(0, 210, 100, 160, 200, 210);
  graphics.fillTriangle(140, 220, 260, 165, 380, 220);
  graphics.fillTriangle(260, 230, 370, 175, 480, 230);

  return graphics;
}

function drawPyramids(scene) {
  const graphics = scene.add.graphics();

  graphics.fillStyle(COLORS.sandLight, 1);
  graphics.fillTriangle(40, 190, 120, 85, 200, 190);
  graphics.fillTriangle(180, 195, 275, 70, 370, 195);
  graphics.fillTriangle(320, 205, 395, 105, 470, 205);

  graphics.fillStyle(COLORS.sandDark, 0.45);
  graphics.fillTriangle(120, 85, 200, 190, 120, 190);
  graphics.fillTriangle(275, 70, 370, 195, 275, 195);
  graphics.fillTriangle(395, 105, 470, 205, 395, 205);

  graphics.fillStyle(COLORS.sandMid, 1);
  graphics.fillRect(0, 205, GAME_WIDTH, 65);

  return graphics;
}

function drawStars(scene) {
  for (let i = 0; i < 28; i += 1) {
    scene.add.rectangle(
      12 + (i * 37) % GAME_WIDTH,
      14 + (i * 23) % 110,
      i % 3 === 0 ? 2 : 1,
      i % 3 === 0 ? 2 : 1,
      0xfff4c7
    );
  }
}

function createPanel(scene, x, y, width, height) {
  const panel = scene.add.graphics();

  panel.fillStyle(0x2c170b, 0.82);
  panel.fillRoundedRect(x, y, width, height, 10);
  panel.lineStyle(2, COLORS.gold, 1);
  panel.strokeRoundedRect(x, y, width, height, 10);

  return panel;
}

function createTextButton(scene, x, y, label, onClick, width = 140) {
  const button = scene.add
    .text(x, y, label, BUTTON_STYLE)
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });

  button.setFixedSize(width, 34);
  button.setAlign("center");
  button.setPadding(0, 8, 0, 0);

  button
    .on("pointerover", () => {
      button.setStyle({ backgroundColor: "#6f472c", color: "#fff3b4" });
    })
    .on("pointerout", () => {
      button.setStyle({
        backgroundColor: BUTTON_STYLE.backgroundColor,
        color: BUTTON_STYLE.color
      });
    })
    .on("pointerdown", () => {
      onClick();
    });

  return button;
}

function addSceneTitle(scene, title, subtitle = "") {
  scene.add
    .text(GAME_WIDTH / 2, 36, title, {
      fontFamily: "Georgia",
      fontSize: "28px",
      color: COLORS.gold,
      stroke: "#2c170b",
      strokeThickness: 6
    })
    .setOrigin(0.5);

  if (subtitle) {
    scene.add
      .text(GAME_WIDTH / 2, 62, subtitle, {
        ...LABEL_STYLE,
        fontSize: "12px"
      })
      .setOrigin(0.5);
  }
}

function addMenuBackground(scene) {
  drawSky(scene);
  drawStars(scene);
  drawPyramids(scene);

  scene.add.ellipse(60, 38, 26, 26, 0xfaf0ae, 0.85);
}

class MainMenuScene extends Phaser.Scene {
  constructor() {
    super("MainMenuScene");
  }

  create() {
    addMenuBackground(this);
    createPanel(this, 118, 78, 244, 150);

    addSceneTitle(this, "Crab Out of Nile", "Tiny jam build");

    this.add
      .text(
        GAME_WIDTH / 2,
        110,
        "A crab escaped the tomb.\nNow it wants the Nile.",
        {
          ...LABEL_STYLE,
          align: "center"
        }
      )
      .setOrigin(0.5);

    createTextButton(this, GAME_WIDTH / 2, 160, "Play", () => {
      this.scene.start("LevelSelectScene");
    });

    createTextButton(this, GAME_WIDTH / 2, 204, "Settings", () => {
      this.scene.start("SettingsScene");
    });
  }
}

class SettingsScene extends Phaser.Scene {
  constructor() {
    super("SettingsScene");
  }

  create() {
    drawSky(this);
    drawDesert(this);
    createPanel(this, 110, 46, 260, 176);
    addSceneTitle(this, "Settings");

    this.musicText = this.add
      .text(140, 100, "", LABEL_STYLE)
      .setOrigin(0, 0.5);

    this.soundText = this.add
      .text(140, 140, "", LABEL_STYLE)
      .setOrigin(0, 0.5);

    this.refreshLabels();

    createTextButton(this, 303, 100, "Toggle", () => {
      sharedState.musicOn = !sharedState.musicOn;
      this.refreshLabels();
    }, 100);

    createTextButton(this, 303, 140, "Toggle", () => {
      sharedState.soundOn = !sharedState.soundOn;
      this.refreshLabels();
    }, 100);

    createTextButton(this, GAME_WIDTH / 2, 184, "Quit", () => {
      this.scene.start("MainMenuScene");
    }, 110);

    createTextButton(this, GAME_WIDTH / 2, 222, "Back", () => {
      this.scene.start("MainMenuScene");
    }, 110);
  }

  refreshLabels() {
    this.musicText.setText(`Music: ${sharedState.musicOn ? "On" : "Off"}`);
    this.soundText.setText(`Sound: ${sharedState.soundOn ? "On" : "Off"}`);
  }
}

class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super("LevelSelectScene");
  }

  create() {
    drawSky(this);
    drawDesert(this);
    createPanel(this, 100, 56, 280, 160);
    addSceneTitle(this, "Level Select", "One level is enough for a jam");

    this.add
      .text(GAME_WIDTH / 2, 108, "Level 1: Tomb to River", {
        ...LABEL_STYLE,
        fontSize: "16px"
      })
      .setOrigin(0.5);

    createTextButton(this, GAME_WIDTH / 2, 152, "Start Level", () => {
      this.scene.start("ReportScene");
    });

    createTextButton(this, GAME_WIDTH / 2, 196, "Main Menu", () => {
      this.scene.start("MainMenuScene");
    });
  }
}

class ReportScene extends Phaser.Scene {
  constructor() {
    super("ReportScene");
  }

  create() {
    drawSky(this);
    drawDesert(this);
    createPanel(this, 60, 40, 360, 190);
    addSceneTitle(this, "Field Report");

    this.add
      .text(
        GAME_WIDTH / 2,
        120,
        "Report:\nA suspicious crab was last seen\ninside a pyramid and heading east.\nEscort it to the Nile.\n\nMove: Arrow keys or WASD",
        {
          ...LABEL_STYLE,
          align: "center"
        }
      )
      .setOrigin(0.5);

    createTextButton(this, GAME_WIDTH / 2, 198, "Begin", () => {
      this.scene.start("GameScene");
    });
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  create() {
    this.cameras.main.setBackgroundColor("#10172e");
    drawSky(this);
    this.drawLevel();
    addSceneTitle(this, "Escape to the Nile", "Reach the blue water");

    this.player = this.add.container(48, 198);
    this.createCrab(this.player);

    this.goalZone = this.add.rectangle(430, 196, 70, 90, COLORS.water, 0);

    this.controlsText = this.add.text(
      10,
      GAME_HEIGHT - 18,
      "Arrows / WASD to move",
      {
        ...LABEL_STYLE,
        fontSize: "12px"
      }
    );

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys("W,A,S,D");
  }

  createCrab(container) {
    const body = this.add.graphics();

    body.fillStyle(COLORS.crab, 1);
    body.fillEllipse(0, 0, 24, 14);
    body.fillEllipse(-10, -1, 8, 8);
    body.fillEllipse(10, -1, 8, 8);

    body.lineStyle(2, 0x7e2715, 1);
    body.beginPath();
    body.moveTo(-5, 2);
    body.lineTo(-13, 7);
    body.moveTo(5, 2);
    body.lineTo(13, 7);
    body.moveTo(-8, -4);
    body.lineTo(-13, -9);
    body.moveTo(8, -4);
    body.lineTo(13, -9);
    body.strokePath();

    const eyes = this.add.graphics();
    eyes.fillStyle(0xffffff, 1);
    eyes.fillCircle(-4, -8, 2);
    eyes.fillCircle(4, -8, 2);
    eyes.fillStyle(0x000000, 1);
    eyes.fillCircle(-4, -8, 1);
    eyes.fillCircle(4, -8, 1);

    container.add([body, eyes]);
  }

  drawLevel() {
    const graphics = this.add.graphics();

    graphics.fillStyle(COLORS.sandLight, 1);
    graphics.fillRect(0, 150, GAME_WIDTH, 120);

    graphics.fillStyle(COLORS.stone, 1);
    graphics.fillRect(28, 170, 92, 56);
    graphics.fillRect(20, 226, 110, 12);

    graphics.fillStyle(COLORS.sandMid, 1);
    graphics.fillRect(120, 188, 180, 26);
    graphics.fillRect(305, 172, 70, 18);

    graphics.fillStyle(COLORS.waterDeep, 1);
    graphics.fillRect(395, 145, 85, 125);
    graphics.fillStyle(COLORS.water, 1);
    graphics.fillRect(403, 145, 77, 125);

    // A few simple stones give the path some shape without needing assets.
    graphics.fillStyle(0x8f744f, 1);
    graphics.fillCircle(165, 220, 8);
    graphics.fillCircle(214, 175, 6);
    graphics.fillCircle(272, 220, 7);
    graphics.fillCircle(332, 200, 9);

    this.add
      .text(60, 184, "TOMB", {
        fontFamily: "Verdana",
        fontSize: "12px",
        color: COLORS.white
      })
      .setOrigin(0.5);

    this.add
      .text(438, 156, "NILE", {
        fontFamily: "Verdana",
        fontSize: "12px",
        color: COLORS.white
      })
      .setOrigin(0.5);
  }

  update() {
    const speed = 1.6;
    let moveX = 0;
    let moveY = 0;

    if (this.cursors.left.isDown || this.keys.A.isDown) {
      moveX -= speed;
    }
    if (this.cursors.right.isDown || this.keys.D.isDown) {
      moveX += speed;
    }
    if (this.cursors.up.isDown || this.keys.W.isDown) {
      moveY -= speed;
    }
    if (this.cursors.down.isDown || this.keys.S.isDown) {
      moveY += speed;
    }

    this.player.x = Phaser.Math.Clamp(this.player.x + moveX, 14, GAME_WIDTH - 14);
    this.player.y = Phaser.Math.Clamp(this.player.y + moveY, 88, GAME_HEIGHT - 12);

    const reachedGoal = Phaser.Geom.Rectangle.Contains(
      this.goalZone.getBounds(),
      this.player.x,
      this.player.y
    );

    if (reachedGoal) {
      this.scene.start("WinScene");
    }
  }
}

class WinScene extends Phaser.Scene {
  constructor() {
    super("WinScene");
  }

  create() {
    drawSky(this);
    drawStars(this);

    const river = this.add.graphics();
    river.fillStyle(COLORS.waterDeep, 1);
    river.fillRect(0, 178, GAME_WIDTH, 92);
    river.fillStyle(COLORS.water, 1);
    river.fillRect(0, 178, GAME_WIDTH, 84);

    this.add.ellipse(96, 150, 40, 16, COLORS.crab, 1);
    this.add.rectangle(340, 154, 34, 70, 0xd6c394, 1);
    this.add.triangle(340, 118, 322, 152, 358, 152, 340, 96, 0xb59a67, 1);

    createPanel(this, 48, 40, 384, 116);
    addSceneTitle(this, "You Win");

    this.add
      .text(
        GAME_WIDTH / 2,
        110,
        "The crab reached the Nile.\nSomewhere, a mummy is still very confused in the ocean.",
        {
          ...LABEL_STYLE,
          align: "center"
        }
      )
      .setOrigin(0.5);

    createTextButton(this, GAME_WIDTH / 2, 214, "Main Menu", () => {
      this.scene.start("MainMenuScene");
    });
  }
}

const config = {
  type: Phaser.AUTO,
  parent: "game",
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: "#120d07",
  pixelArt: true,
  roundPixels: true,
  antialias: false,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT
  },
  scene: [
    MainMenuScene,
    SettingsScene,
    LevelSelectScene,
    ReportScene,
    GameScene,
    WinScene
  ]
};

new Phaser.Game(config);
