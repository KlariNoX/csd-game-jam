# Untitled Crab Game

**Untitled Crab Game** is a short 2D retro puzzle-platformer built with **Phaser 3** for the **1-day CSD UoC Game Jam**.

You play as a stranded crab who is very much out of place, trapped inside ancient Egyptian chambers filled with seal plates, traps, moving platforms, crushers, spikes, lava, and puzzles. Your goal is to survive, stay wet, activate the required mechanisms, and push toward the Nile through five handcrafted levels.

The game was built around the theme **“Out of Place”**: a crab from the sea thrown into a world of sand, ruins, pyramids, and ancient machinery.

---

## Team

Created by:

- **Christos Polimatidis**
- **Ioannis Tsintzas**

---

## Features

- 5 handcrafted campaign levels
- Retro pixel-art Egyptian ruin environments
- A cute crab protagonist
- Pressure plate puzzles
- Pushable stone blocks
- Moving platforms
- Spikes, blades, crushers, and lava hazards
- A wetness system that acts as a timer/resource mechanic
- Intro and ending storyboard sequences
- Main menu, settings, level select, report, gameplay, sandbox, and win scenes
- Persistent campaign progression using `localStorage`
- Pixel-styled UI with Phaser-built popups and overlays
- Sandbox mode for movement practice
- First-version custom level flow with create, open, save, delete, and play-test support

---

## Controls

- **Move:** `A` / `D` or `Left` / `Right`
- **Jump:** `W`, `Up`, or `Space`
- **Pause during gameplay:** `Esc`
- **Advance storyboard panels:** `Space`
- **Skip storyboard:** `Esc`

---

## Gameplay Loop

Each level is data-driven. A level definition provides collision solids, hazards, puzzle switches, boxes, moving platforms, spawn points, and goal data.

To clear a level, the crab must:

- Survive hazards
- Keep enough wetness to avoid drying out
- Activate the required seal plates when the exit is locked
- Reach the chamber exit

Unlocked levels stay available from the level select screen and can be replayed at any time.

---

## Sandbox And Custom Levels

The sandbox scene currently supports two directions:

- **Practice:** launches a no-progress room for movement, jumping, box pushing, and moving-platform behavior
- **My Levels:** opens a management popup for locally saved user levels

Current user-level support is a first playable editor version:

- Levels are stored in `localStorage`
- The player can create a new level entry with a name and one of the five campaign backgrounds
- Saved levels appear dynamically in the `My Levels` popup
- `Create` opens the new level directly in the editor
- `Open` loads an existing saved level in the editor
- The editor can place floors, ledges, moving platforms, spikes, blocks, an exit, and the crab start point
- Custom levels can be saved and play-tested with Arcade Physics
- Entries can be deleted

This is still intentionally a first version. It gives the project a working custom-level engine foundation, while deeper editor features can be built on top of the saved layout format.

---

## Tech Stack

- JavaScript
- Phaser 3
- Vite
- HTML5 Canvas
- npm

---

## Project Structure

```text
.
|-- assets/
|-- src/
|   |-- config/
|   |   |-- assets.js
|   |   `-- constants.js
|   |-- data/
|   |   |-- levelMap.js
|   |   `-- levels.js
|   |-- scenes/
|   |   |-- GameScene.js
|   |   |-- LevelEditorScene.js
|   |   |-- LevelSelectScene.js
|   |   |-- MainMenuScene.js
|   |   |-- ReportScene.js
|   |   |-- SandboxScene.js
|   |   |-- SettingsScene.js
|   |   `-- WinScene.js
|   |-- state/
|   |   |-- progress.js
|   |   `-- userLevels.js
|   |-- systems/
|   |   `-- audio.js
|   |-- ui/
|   |   |-- backgrounds.js
|   |   |-- buttons.js
|   |   `-- levelSelectMap.js
|   |-- main.js
|   `-- storyboard.js
|-- index.html
|-- package.json
`-- vite.config.js
```

---

## Scene Flow

The high-level flow is:

```text
Opening storyboard -> Main Menu -> Level Select -> Report -> Game -> Level Select / Win
```

Other branches:

- `Main Menu -> Sandbox`
- `Main Menu -> Settings`
- `Sandbox -> Practice`
- `Sandbox -> My Levels -> Create Level -> Level Editor`
- `Sandbox -> My Levels -> Open -> Level Editor`

---

## Data And Persistence

The project uses browser `localStorage` for lightweight persistence.

Storage keys currently in use:

- `crab-out-of-nile-progress`: highest unlocked campaign level
- `crab-out-of-nile-user-levels`: saved custom level metadata and placeholder layout data

Progress is also mirrored into the Phaser registry during runtime so scenes can share state cleanly.

---

## Audio

The game mixes two kinds of audio:

- Imported music tracks for menus and campaign levels
- Generated UI and gameplay sound cues created through the Web Audio API

Music and sound toggles are exposed in both:

- The main `Settings` scene
- The in-level pause menu

---

## Visual And Input Notes

- Phaser runs at a fixed internal resolution of `480x270`
- Scaling uses `Phaser.Scale.FIT`
- `pixelArt: true`, `roundPixels: true`, and `antialias: false` are enabled
- Storyboard panels are rendered as DOM overlays rather than Phaser scenes

---

## Run Locally

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Vite will print a local URL. Open that URL in the browser.

---

## Production Build

Create the production bundle:

```bash
npm run build
```

Preview the built game locally:

```bash
npm run preview
```

The release output is generated in `dist/`.

---

## Deploy To itch.io

1. Run:

```bash
npm run build
```

2. Zip the contents of the generated `dist` folder.
3. Upload the zip to itch.io as an **HTML5** game.
4. Set itch.io to launch `index.html`.

---

## Credits

### Game

**Untitled Crab Game** was created for the **CSD UoC Game Jam** by:

- **Christos Polimatidis**
- **Ioannis Tsintzas**

---

### Art Assets

Some graphics used in this project come from external asset creators.

- **Pyramid Ruins** by **NicoPardo**  
  https://nicopardo.itch.io/pyramid-ruins

- **2D Pixel Art Crab Sprites** by **Elthen’s Pixel Art Shop**  
  https://elthen.itch.io/2d-pixel-art-crab-sprites

These assets belong to their respective creators.

If you want to use, reuse, modify, redistribute, or include any of these assets in your own project, you must first check the original asset pages and contact the asset owner, creator, or group responsible for the asset. Permission to use this repository does not automatically give permission to use third-party assets.

---

### Music / Soundtrack

Some music used in the game is based on or sourced from:

- **“The Egyptians (Die Ägypter) - 8bit/chiptune music, mobile/java game 2008”**  
  https://youtu.be/iUAmIwr8Ieg?si=rtwMWfxqiy7vumhH

- **Track 5**  
  Written by my uncle, **Achilleas**, some decades ago.  
  The level using this track is dedicated to him.

Music belongs to its respective creators and owners.

If you want to use any of the music or audio assets from this project, you must first contact the original creator, owner, or rights holder and receive permission.

---

## Asset Usage Notice

This repository may contain third-party assets, including but not limited to:

- Pixel art
- Sprites
- Backgrounds
- Tilesets
- Music
- Sound effects
- Storyboard images

These assets are not automatically covered by the same permissions as the source code.

Before using any asset from this repository, you must:

1. Identify who owns the asset
2. Check the original asset page or source
3. Contact the owner, creator, or rights holder
4. Receive permission before using it in your own project

Do not assume that an asset is free to use just because it appears in this repository.

---

## Current Gaps

The project is playable, but a few areas are still clearly in progress:

- No automated tests
- Custom levels are local-only and not part of campaign progression yet
- Asset attribution may still need to be expanded source-by-source

---

## License And Usage Terms

This project is made available for **non-commercial use only**.

You may:

- Play the game
- Share the project
- Study the source code
- Modify the source code for personal, educational, or non-commercial purposes
- Use the project as a reference for learning game development

You may not:

- Use this project, its code, or its assets for commercial purposes
- Sell this project or modified versions of it
- Include this project or modified versions of it in a paid product
- Redistribute the included assets without permission from their owners
- Claim the project, code, assets, music, or art as your own
- Use this project, its code, or its assets to train, fine-tune, evaluate, or improve any machine learning model, AI model, large language model, code generation model, or similar system

---

## AI / LLM Training Restriction

The code, assets, text, music, and any other material in this repository may not be used for training, fine-tuning, evaluating, improving, or developing AI systems, including but not limited to:

- Large language models
- Code generation models
- Image generation models
- Music generation models
- Game generation systems
- Dataset creation for machine learning

This restriction applies to both commercial and non-commercial AI training or dataset usage.

---

## Important Note

This README is intended to clearly state the project authors’ wishes and usage rules.

Third-party assets included in or referenced by this project may have their own licenses, permissions, and restrictions. Those terms must be checked separately with the original creators or rights holders.
