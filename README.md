# Crab Out of Nile

A small Phaser HTML5 game about a determined crab escaping a pyramid and reaching the Nile.

## Run locally

1. `npm install`
2. `npm run dev`

Vite will print a local URL you can open in your browser.

## Build for release

1. `npm install`
2. `npm run build`

This creates a production build in the `dist` folder.

## Upload to itch.io

1. Run `npm run build`
2. Open the generated `dist` folder
3. Zip the contents of `dist`
4. Upload that zip to itch.io as an `HTML5` game
5. Make sure itch.io is set to launch `index.html`

## Notes

- Progress is saved in `localStorage`
- The game is built with Phaser and Vite
