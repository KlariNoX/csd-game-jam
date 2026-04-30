// URL imports are isolated so Phaser preload code can stay focused on loading behavior.
export const MAIN_MENU_BACKGROUND_URL = new URL(
  "../../assets/main_menu_background.png",
  import.meta.url
).href;
export const LEVEL_SELECT_BACKGROUND_URL = new URL(
  "../../assets/level_selector_background.png",
  import.meta.url
).href;
export const ENDING_SCENE_BACKGROUND_URL = new URL(
  "../../assets/Ending_Scene_Background.png",
  import.meta.url
).href;
export const CRAB_SPRITESHEET_URL = new URL(
  "../../assets/Crab Sprite Sheet.png",
  import.meta.url
).href;
export const PYRAMID_TILEGROUND_URL = new URL(
  "../../assets/Pyramid Ruins/PR_TileGround 16x16.png",
  import.meta.url
).href;
export const BG_MUSIC_URL = new URL("../../assets/bg-music.mp3", import.meta.url).href;
export const TRACK_URLS = [
  new URL("../../assets/Track 1.mp3", import.meta.url).href,
  new URL("../../assets/Track 2.mp3", import.meta.url).href,
  new URL("../../assets/Track 3.mp3", import.meta.url).href,
  new URL("../../assets/Track 4.mp3", import.meta.url).href,
  new URL("../../assets/Track 5.mp3", import.meta.url).href
];
export const LEVEL_BACKGROUNDS = [
  {
    key: "level-1-background",
    url: new URL("../../assets/Level01_Background.png", import.meta.url).href
  },
  {
    key: "level-2-background",
    url: new URL("../../assets/Level02_Background.png", import.meta.url).href
  },
  {
    key: "level-3-background",
    url: new URL("../../assets/Level03_Background.png", import.meta.url).href
  },
  {
    key: "level-4-background",
    url: new URL("../../assets/Level04_Background.png", import.meta.url).href
  },
  {
    key: "level-5-background",
    url: new URL("../../assets/Level05_Background.png", import.meta.url).href
  }
];
export const STORYBOARD_FRAMES = [
  {
    key: "storyboard-opening-1",
    url: new URL("../../assets/Storyboard01/Opening Frame 1.png", import.meta.url).href
  },
  {
    key: "storyboard-opening-2",
    url: new URL("../../assets/Storyboard01/Opening_Frame_2.png", import.meta.url).href
  },
  {
    key: "storyboard-opening-3",
    url: new URL("../../assets/Storyboard01/Opening_Frame_3.png", import.meta.url).href
  },
  {
    key: "storyboard-opening-4",
    url: new URL("../../assets/Storyboard01/Opening_Frame_4.png", import.meta.url).href
  },
  {
    key: "storyboard-opening-5",
    url: new URL("../../assets/Storyboard02/Opening_Frame_5.png", import.meta.url).href
  },
  {
    key: "storyboard-opening-6",
    url: new URL("../../assets/Storyboard02/Opening_Frame_6.png", import.meta.url).href
  },
  {
    key: "storyboard-opening-7",
    url: new URL("../../assets/Storyboard02/Opening_Frame_7.png", import.meta.url).href
  },
  {
    key: "storyboard-opening-8",
    url: new URL("../../assets/Storyboard02/Opening_Frame_8.png", import.meta.url).href
  }
];
export const ENDING_STORYBOARD_FRAMES = [
  {
    key: "storyboard-ending-9",
    url: new URL("../../assets/Storyboard03/Opening_Frame_9.png", import.meta.url).href
  },
  {
    key: "storyboard-ending-10",
    url: new URL("../../assets/Storyboard03/Opening_Frame_10.png", import.meta.url).href
  },
  {
    key: "storyboard-ending-11",
    url: new URL("../../assets/Storyboard03/Opening_Frame_11.png", import.meta.url).href
  },
  {
    key: "storyboard-ending-12",
    url: new URL("../../assets/Storyboard03/Opening_Frame_12.png", import.meta.url).href
  },
  {
    key: "storyboard-ending-13",
    url: new URL("../../assets/Storyboard03/Opening_Frame_13.png", import.meta.url).href
  },
  {
    key: "storyboard-ending-14",
    url: new URL("../../assets/Storyboard03/Opening_Frame_14.png", import.meta.url).href
  },
  {
    key: "storyboard-ending-15",
    url: new URL("../../assets/Storyboard03/Opening_Frame_15.png", import.meta.url).href
  },
  {
    key: "storyboard-ending-16",
    url: new URL("../../assets/Storyboard03/Opening_Frame_16.png", import.meta.url).href
  },
  {
    key: "storyboard-ending-17",
    url: new URL("../../assets/Storyboard03/Opening_Frame_17.png", import.meta.url).href
  },
  {
    key: "storyboard-ending-18",
    url: new URL("../../assets/Storyboard03/Opening_Frame_18.png", import.meta.url).href
  }
];

