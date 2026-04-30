# Crab Out of Nile

Crab Out of Nile is a short 2D puzzle-platformer made for the 1-day game jam at CSD UOC. A crab escapes through ancient pyramid chambers, solves seal puzzles, avoids traps, and tries to reach the Nile. The ending reveals that reaching the river was only part of the problem.

## Team

- Christos Polimatidis
- Ioannis Tsintzas

## Controls And Instructions

- Move: `A` / `D` or left / right arrow keys
- Jump: `W`, up arrow, or `Space`
- Advance storyboard panels: `Space`
- Skip storyboard: `Esc` or the Skip button
- Pause: `Esc` during gameplay

Activate the required seals in each level, avoid spikes, blades, crushers, and pits, and reach the exit door. Some seals must be activated by pushing stone blocks onto them. Progress is saved in `localStorage`, and unlocked levels can be replayed from the level selector.

## Tools Used

- JavaScript
- Phaser 3
- Vite
- HTML5 Canvas
- npm

## Assets Used

### Game Images

- `assets/main_menu_background.png`
- `assets/level_selector_background.png`
- `assets/Ending_Scene_Background.png`
- `assets/Level01_Background.png`
- `assets/Level02_Background.png`
- `assets/Level03_Background.png`
- `assets/Level04_Background.png`
- `assets/Level05_Background.png`
- `assets/Crab Sprite Sheet.png`

### Pyramid Ruins Tiles

- `assets/Pyramid Ruins/PR_BackGround 16x16.png`
- `assets/Pyramid Ruins/PR_Objects 16x16.png`
- `assets/Pyramid Ruins/PR_TileGround 16x16.png`
- `assets/Pyramid Ruins/PR_TileSet 16x16.png`

### Storyboard Images

- `assets/Storyboard01/Opening Frame 1.png`
- `assets/Storyboard01/Opening_Frame_2.png`
- `assets/Storyboard01/Opening_Frame_3.png`
- `assets/Storyboard01/Opening_Frame_4.png`
- `assets/Storyboard02/Opening_Frame_5.png`
- `assets/Storyboard02/Opening_Frame_6.png`
- `assets/Storyboard02/Opening_Frame_7.png`
- `assets/Storyboard02/Opening_Frame_8.png`
- `assets/Storyboard03/Opening_Frame_9.png`
- `assets/Storyboard03/Opening_Frame_10.png`
- `assets/Storyboard03/Opening_Frame_11.png`
- `assets/Storyboard03/Opening_Frame_12.png`
- `assets/Storyboard03/Opening_Frame_13.png`
- `assets/Storyboard03/Opening_Frame_14.png`
- `assets/Storyboard03/Opening_Frame_15.png`
- `assets/Storyboard03/Opening_Frame_16.png`
- `assets/Storyboard03/Opening_Frame_17.png`
- `assets/Storyboard03/Opening_Frame_18.png`

### Audio

- `assets/bg-music.mp3`
- `assets/Track 1.mp3`
- `assets/Track 2.mp3`
- `assets/Track 3.mp3`
- `assets/Track 4.mp3`
- `assets/Track 5.mp3`

## Run Locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open the local URL printed by Vite in your browser.

## Build For Release

```bash
npm run build
```

The production build is created in the `dist` folder.

## Upload To itch.io

1. Run `npm run build`.
2. Zip the contents of the generated `dist` folder.
3. Upload that zip to itch.io as an `HTML5` game.
4. Set itch.io to launch `index.html`.

## License

This project is free to use. You may play, share, modify, and reuse the code and included assets freely.
