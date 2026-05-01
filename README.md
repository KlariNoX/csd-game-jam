# Untitled Crab Game

Untitled Crab Game is a short 2D puzzle-platformer built with Phaser 3 for the 1-day CSD UOC game jam. You guide a stranded crab through ancient chambers, wake seal plates, dodge blades and crushers, manage a drying-out timer, and push toward the Nile through five handcrafted levels.

The project has grown past a simple jam prototype. It now includes a modular scene structure, persistent progression, a sandbox mode, in-game field guide popups, and the first foundation for user-created levels.

## Team

- Christos Polimatidis
- Ioannis Tsintzas

## What The Game Includes

- 5 campaign levels with distinct room layouts and puzzle beats
- Intro and ending storyboard sequences outside Phaser for full-screen presentation
- Main menu, settings, level select, report, gameplay, sandbox, and win scenes
- Pressure plate puzzles, pushable stone blocks, moving platforms, spikes, blades, crushers, and lava hazards
- A wetness system that acts as a time/resource mechanic
- Persistent unlock progress stored in `localStorage`
- Pixel-styled UI with Phaser-built popups and overlays
- Sandbox mode for movement practice
- A `My Levels` flow with create/delete scaffolding for future level-editor work

## Controls

- Move: `A` / `D` or `Left` / `Right`
- Jump: `W`, `Up`, or `Space`
- Pause during gameplay: `Esc`
- Advance storyboard panels: `Space`
- Skip storyboard: `Esc`

## Gameplay Loop

Each level is data-driven. A level definition provides collision solids, hazards, puzzle switches, boxes, moving platforms, spawn points, and goal data. The gameplay scene reads that data, draws the chamber, creates physics bodies, and runs the puzzle state.

To clear a level, the crab must:

- survive hazards
- keep enough wetness to avoid drying out
- activate the required seals when the exit is locked
- reach the chamber exit

Unlocked levels stay available from the level select screen and can be replayed at any time.

## Sandbox And Custom Levels

The sandbox scene currently supports two directions:

- `Practice`: launches a no-progress room for movement, jumping, box pushing, and moving-platform behavior
- `My Levels`: opens a management popup for locally saved user levels

Current user-level support is intentionally early-stage:

- levels are stored in `localStorage`
- the player can create a new level entry with a name and one of the five campaign backgrounds
- saved levels appear dynamically in the `My Levels` popup
- entries can be deleted
- `Open` is still a placeholder until the actual level editor / loader is implemented

This means the repository already contains the storage and UI groundwork for a future custom level engine, but not the editor itself yet.

## Tech Stack

- JavaScript
- Phaser 3
- Vite
- HTML5 Canvas
- npm

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
|   |   |-- LevelSelectScene.js
|   |   |-- MainMenuScene.js
|   |   |-- ReportScene.js
|   |   |-- SandboxScene.js
|   |   |-- SettingsScene.js
|   |   `-- WinScene.js
|   |-- state/
|   |   `-- progress.js
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

## Scene Flow

The high-level flow is:

`Opening storyboard -> Main Menu -> Level Select -> Report -> Game -> Level Select / Win`

Other branches:

- `Main Menu -> Sandbox`
- `Main Menu -> Settings`
- `Sandbox -> Practice`
- `Sandbox -> My Levels -> Create Level`

## Data And Persistence

The project uses browser `localStorage` for lightweight persistence.

Storage keys currently in use:

- `crab-out-of-nile-progress`: highest unlocked campaign level
- `crab-out-of-nile-user-levels`: saved custom level metadata and placeholder layout data

Progress is also mirrored into the Phaser registry during runtime so scenes can share state cleanly.

## Audio

The game mixes two kinds of audio:

- imported music tracks for menus and campaign levels
- generated UI and gameplay sound cues created through the Web Audio API

Music and sound toggles are exposed in both:

- the main `Settings` scene
- the in-level pause menu

## Visual And Input Notes

- Phaser runs at a fixed internal resolution of `480x270`
- scaling uses `Phaser.Scale.FIT`
- `pixelArt: true`, `roundPixels: true`, and `antialias: false` are enabled
- storyboard panels are rendered as DOM overlays rather than Phaser scenes

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

## Deploy To itch.io

1. Run `npm run build`.
2. Zip the contents of the generated `dist` folder.
3. Upload the zip to itch.io as an `HTML5` game.
4. Set itch.io to launch `index.html`.

## Working On The Codebase

Helpful starting points:

- [src/main.js](/c:/Users/User/Documents/GitHub/csd-game-jam/src/main.js): Phaser bootstrapping and scene registration
- [src/data/levels.js](/c:/Users/User/Documents/GitHub/csd-game-jam/src/data/levels.js): campaign level definitions
- [src/scenes/GameScene.js](/c:/Users/User/Documents/GitHub/csd-game-jam/src/scenes/GameScene.js): core gameplay, hazards, puzzle flow, HUD, pause menu
- [src/scenes/SandboxScene.js](/c:/Users/User/Documents/GitHub/csd-game-jam/src/scenes/SandboxScene.js): practice room plus user-level popup flow
- [src/state/progress.js](/c:/Users/User/Documents/GitHub/csd-game-jam/src/state/progress.js): unlock persistence and selected-level state
- [src/storyboard.js](/c:/Users/User/Documents/GitHub/csd-game-jam/src/storyboard.js): intro and ending comic-panel overlays

## Asset Overview

The repository includes:

- 5 campaign chamber backgrounds
- 18 storyboard frames across opening and ending sequences
- a crab sprite sheet
- Pyramid Ruins tileset art
- menu / ending backgrounds
- 1 menu music track and 5 chamber music tracks

## Current Gaps

The project is playable, but a few areas are still clearly in-progress:

- no automated tests
- no full level editor yet
- saved custom levels are metadata-first and not yet playable
- README-level asset attribution is still broad rather than source-by-source

## License

This project is free to use. You may play, share, modify, and reuse the code and included assets freely.
