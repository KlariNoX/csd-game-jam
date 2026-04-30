// Shared game constants, palette values, and asset cache keys live here.
export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 270;
export const TOTAL_LEVELS = 5;
export const PROGRESS_STORAGE_KEY = "crab-out-of-nile-progress";
export const MAIN_MENU_BACKGROUND_KEY = "main-menu-background";
export const LEVEL_SELECT_BACKGROUND_KEY = "level-select-background";
export const ENDING_SCENE_BACKGROUND_KEY = "ending-scene-background";
export const CRAB_SPRITESHEET_KEY = "crab-sheet";
export const PYRAMID_TILEGROUND_KEY = "pyramid-tileground";
export const CRAB_FRAME_SIZE = 32;
export const CRAB_IDLE_FRAME = 0;
export const CRAB_MENU_IDLE_FRAMES = [0, 1, 2, 1];
export const CRAB_SCUTTLE_FRAMES = [0, 1, 2, 3];
export const CRAB_JUMP_FRAME = 13;

export const COLORS = {
  sandDark: 0x7a5326,
  sandMid: 0xc48a42,
  sandLight: 0xe6c98a,
  skyTop: 0x1b1f4b,
  skyBottom: 0xf2b661,
  stone: 0x6f5a49,
  wallDark: 0x24150c,
  wallMid: 0x5d4127,
  wallLight: 0xa68152,
  wallLine: 0x7b5b39,
  locked: 0x443224,
  water: 0x2f98c7,
  waterDeep: 0x165c89,
  lava: 0xd64d22,
  lavaBright: 0xffb24c,
  bronze: 0xb5782c,
  bronzeDark: 0x6d4416,
  metal: 0xc2ced7,
  metalDark: 0x58656d,
  danger: 0xff8d58,
  crab: 0xd95f43,
  white: "#fff8de",
  gold: "#f3d36b"
};

export const COLOR_VALUES = {
  gold: 0xf3d36b
};

export const FONTS = {
  ui: '"Trebuchet MS", Verdana, sans-serif',
  title: 'Georgia, "Times New Roman", serif'
};

export const BUTTON_STYLE = {
  fontFamily: FONTS.ui,
  fontSize: "14px",
  color: COLORS.white,
  backgroundColor: "#5c3820",
  padding: { x: 14, y: 8 }
};

export const LABEL_STYLE = {
  fontFamily: FONTS.ui,
  fontSize: "14px",
  color: COLORS.white
};

export const RUIN_PLATFORM_FRAMES = {
  left: 61,
  middle: 62,
  right: 63
};

