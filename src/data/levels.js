import { GAME_WIDTH } from '../config/constants.js';

// Level definitions are data-only: layout, hazards, puzzles, and report text.
// Coordinate origin is the top-left corner of the 480x270 game canvas.
//
// Common level fields:
// - solids: static collision rectangles, also used by GameScene for platform art.
// - spikes/blades/crushers/lavaPools: hazards checked every frame.
// - puzzle.switches: pressure plates; use activation: "box" when only push boxes can trigger them.
// - boxes/movingPlatforms: optional physics helpers for puzzle levels.
export const LEVELS = [
  {
    name: "Burial Gate",
    report:
      "Ancient Engineer Report #1:\nThe gate is complete, except someone misplaced the first lock gear.\nI have wired two glyph plates around the room until it turns up.",
    startX: 34,
    startY: 198,
    goal: { x: 438, y: 124, width: 34, height: 83, kind: "door", label: "EXIT" },
    puzzle: {
      requiredSwitchCount: 2,
      switches: [
        { id: "lower-glyph", x: 106, y: 183, width: 28, height: 8 },
        { id: "upper-scarab", x: 250, y: 139, width: 30, height: 8 }
      ]
    },
    decorations: [
      // This upper shelf is intentionally above jump height. It frames the room
      // with an unreachable hanging trap without becoming part of the route.
      { type: "ceilingLedge", x: 52, y: 90, width: 88, height: 12 }
    ],
    solids: [
      // Reachable route: low seal, climb to the high seal, then descend toward the locked exit.
      { x: 0, y: 207, width: 72, height: 52, style: "backgroundFloor" },
      { x: 92, y: 190, width: 54, height: 12, style: "ruinLedge" },
      { x: 164, y: 174, width: 44, height: 12, style: "ruinLedge" },
      { x: 232, y: 146, width: 66, height: 12, style: "ruinLedge" },
      { x: 312, y: 166, width: 46, height: 12, style: "ruinLedge" },
      { x: 378, y: 188, width: 50, height: 12, style: "ruinLedge" },
      { x: 428, y: 207, width: 52, height: 52, style: "backgroundFloor" }
    ],
    spikes: [
      // Downward spikes hang from the unreachable shelf for atmosphere and danger readability.
      { x: 68, y: 102, width: 58, direction: "down" },
      { x: 72, y: 207, width: 20 },
      { x: 146, y: 207, width: 18 },
      { x: 208, y: 207, width: 24 },
      { x: 296, y: 207, width: 28 },
      { x: 354, y: 207, width: 22 },
      // A small edge trap makes the exit approach more deliberate without requiring a perfect jump.
      { x: 338, y: 166, width: 16 }
    ]
  },
  {
    name: "Sand Hall",
    report:
      "Ancient Engineer Report #2:\nNow the sun relay crystal is missing. Naturally.\nI placed two seals and a sand lift here, because apparently I must rebuild the temple with puzzles.",
    startX: 36,
    startY: 193,
    goal: { x: 430, y: 119, width: 34, height: 83, kind: "door", label: "EXIT" },
    puzzle: {
      requiredSwitchCount: 1,
      switches: [
        { id: "low-sun-seal", x: 0, y: 42, width: 30, height: 8 },
      ]
    },
    solids: [
      { x: 0, y: 202, width: 130, height: 58, style: "backgroundFloor" },
      { x: 104, y: 142, width: 58, height: 12, style: "ruinLedge" },
      { x: 0, y: 102, width: 58, height: 12, style: "ruinLedge" },
      { x: 0, y: 50, width: 25, height: 12, style: "ruinLedge" },
      { x: 224, y: 202, width: 140, height: 58, style: "ruinLedge" },
      { x: 430, y: 202, width: 50, height: 58, style: "backgroundFloor" },
    ],
    spikes: [
      { x: 84, y: 202, width: 40 },
    ],
    blades: [
      { x1: 194, y1: 54, x2: 194, y2: 194, radius: 10, duration: 1700, phase: 180, broken: false },
      { x1: 0, y1: 86, x2: 58, y2: 86, radius: 10, duration: 1700, phase: 180, broken: false },

      // Horizontal blade pressuring the upper route near the second seal.
      { x1: 224, y1: 184, x2: 224+140, y2: 184, radius: 10, duration: 1900, phase: 520, broken: false }
    ]
  },
  {
    name: "Stone Trial",
    report:
      "Ancient Engineer Report #3:\nThe pressure counterweight has vanished from its own labeled shelf.\nUse the stone blocks on the seals while I consider inventing a lock for the storage room.",
    startX: 36,
    startY: 193,
    goal: { x: 0, y: 19, width: 34, height: 83, kind: "door", label: "EXIT" },
    puzzle: {
      requiredSwitchCount: 1,
      switches: [
        // // Box-only seal: the first stone block must be pushed onto this plate.
        { id: "box-floor-seal", x: GAME_WIDTH - 32, y: 194, width: 32, height: 8, activation: "box" },
        // // Upper seal: the second box creates a beginner-friendly step up to this platform.
        // { id: "upper-scarab-seal", x: 314, y: 125, width: 30, height: 8 }
      ]
    },
    decorations: [
      // { type: "sandPit", x: 168, y: 202, width: 28, height: 68 },
      // { type: "sandPit", x: 364, y: 202, width: 34, height: 68 },
      // // The upper broken shelf is visual danger only; it hints at deeper tomb traps.
      // { type: "ceilingLedge", x: 42, y: 92, width: 86, height: 12 }
    ],
    solids: [
      // Two box puzzle yards sit on the background floor, with an upper route unlocked by stacking movement.
      { x: 0, y: 202, width: GAME_WIDTH, height: 68, style: "backgroundFloor" }, // FLOOR
      { x: 0, y: 102, width: 58, height: 12, style: "ruinLedge" }, // DOOR PLATFORM
      { x: 80, y: 52, width: 58, height: 12, style: "ruinLedge" },
      { x: 150, y: 102, width: 240, height: 12, style: "ruinLedge" }, // wide platform
      // { x: 196, y: 184, width: 52, height: 12, style: "ruinLedge" },
      // { x: 226, y: 202, width: 118, height: 38, style: "backgroundFloor" },
      // { x: 300, y: 132, width: 58, height: 12, style: "ruinLedge" },
      // { x: 356, y: 166, width: 42, height: 12, style: "ruinLedge" },
      // { x: 398, y: 202, width: 82, height: 38, style: "backgroundFloor" }
    ],
    boxes: [
      // Plate box: fenced to the left puzzle yard so it cannot be lost behind the spike gap.
      { id: "plate-box", x: 58, y: 184, width: 20, height: 18, bounds: { minX: 20, maxX: GAME_WIDTH - 20 } },
      // Step box: used as a portable stair to reach the higher scarab seal.
      // { id: "step-box", x: 238, y: 184, width: 20, height: 18, bounds: { minX: 226, maxX: 344 } }
    ],
    spikes: [
      // // The first gap is the teaching hazard: cross it with a jump, not by rushing the box.
      { x: 150, y: 102, width: 10 },
      { x: 220, y: 102, width: 15 },
      { x: 300, y: 102, width: 20 },
      // { x: 58, y: 104, width: 58, direction: "down" }
    ],
    blades: [
      { x1: 150, y1: 112, x2: 150, y2: 200, radius: 10, duration: 850, phase: 180, broken: false },
      { x1: 250, y1: 200, x2: 250, y2: 112, radius: 10, duration: 850, phase: 180, broken: false },
      { x1: 350, y1: 112, x2: 350, y2: 200, radius: 10, duration: 850, phase: 180, broken: false },
    ],
    movingPlatforms: [
      { x: 234, y: 169, width: 46, height: 10, fromX: GAME_WIDTH - 46, toX: GAME_WIDTH - 46, fromY: 169, toY: 100, duration: 2600 }
    ],
  },
      {
    name: "Moon Shaft",
    report:
      "Ancient Engineer Report #4:\nThe lunar stabilizer is gone, and the crushers are behaving smugly about it.\nI added two moon seals to keep the shaft from collapsing. Please do not touch the crushers.",
    startX: 36,
    startY: 220,
    goal: { x: 430, y: 60, width: 54, height: 60, kind: "door", label: "EXIT" },
    puzzle: {
      requiredSwitchCount: 2,
      switches: [
        { id: "left-moon-seal", x: 70, y: 167, width: 30, height: 8 },
        { id: "right-moon-seal", x: 350, y: 224, width: 30, height: 8 }
      ]
    },
    decorations: [
      // No extra left ceiling ledge here. That was causing the doubled-up ruin look.
      //{ type: "ceilingLedge", x: 210, y: 72, width: 70, height: 12 }
    ],
    solids: [
      // Same original collision positions.
      { x: 0, y: 232, width: 480, height: 38, style: "backgroundFloor" },

      // Same pillar collision positions, but now rendered using actual Pyramid Ruins assets.
      { x: 102, y: 78, width: 16, height: 154, style: "assetPillar" },

      // This small left platform stays, but the far-left overlapped platform is now invisible.
      { x: 52 + 20, y: 175, width: 30, height: 10, style: "ruinLedge" },
      { x: 0, y: 120, width: 38, height: 10, style: "ruinLedge" },

      // This small right platform stays, but the far-right overlapped platform is now invisible.
      { x: 395, y: 175, width: 35, height: 10, style: "ruinLedge" },
      { x: 433, y: 120, width: 35, height: 10, style: "ruinLedge" },

      { x: 196, y: 118, width: 16, height: 114, style: "assetPillar" },
      { x: 290, y: 118, width: 16, height: 114, style: "assetPillar" },
      { x: 384, y: 118, width: 16, height: 100, style: "assetPillar" }
    ],
    crushers: [
      { x: 156, topY: 86, width: 56, height: 24, drop: 116, period: 1800, phase: 0, fake: false },

      // This crusher still exists for collision/timing, but its art is hidden.
      { x: 250, topY: 86, width: 56, height: 24, drop: 116, period: 1800, phase: 720, fake: false, invisibleArt: true },

      { x: 344, topY: 86, width: 56, height: 24, drop: 116, period: 1800, phase: 0, fake: true }
    ],
    spikes: [
      { x: 69, y: 187, width: 34, direction: "down" }
    ]
  },
    {
    name: "River Mouth",
    report:
      "Ancient Engineer Report #5:\nThe final scarab core is missing. Of course it is. Why would the final chamber have its final part?\nI set the seals, blocks, and blades myself. If this fails, I am blaming procurement.",
    startX: 34,
    startY: 181,
    goal: {
      x: 430,
      y: 119,
      width: 34,
      height: 83,
      kind: "door",
      label: "EXIT"
    },
    puzzle: {
      requiredSwitchCount: 2,
      switches: [
        // First seal must be held by the left box.
        { id: "lower-box-seal", x: 108, y: 200, width: 32, height: 8, activation: "box" },

        // Second seal is reached through the upper blade route.
        { id: "upper-seal", x: 326, y: 114, width: 30, height: 8 }
      ]
    },
    decorations: [
      { type: "sandPit", x: 150, y: 190, width: 26, height: 80 },
      { type: "sandPit", x: 258, y: 190, width: 28, height: 80 },
      { type: "sandPit", x: 366, y: 190, width: 30, height: 80 },

      // Atmosphere only
      { type: "ceilingLedge", x: 48, y: 48, width: 84, height: 12 }
    ],
    solids: [
      // Raised floor segments so the level plays higher on the screen.
      { x: 0, y: 215, width: 150, height: 50, style: "backgroundFloor" },
      { x: 176, y: 215, width: 82, height: 50, style: "backgroundFloor" },
      { x: 286, y: 215, width: 80, height: 50, style: "backgroundFloor" },
      { x: 396, y: 215, width: 84, height: 50, style: "backgroundFloor" },

      // Custom-asset platforms
      { x: 286, y: 42, width: 86, height: 12, style: "ruinLedge" },
      { x: 186, y: 64, width: 35, height: 12, style: "ruinLedge" },
      { x: 56, y: 148, width: 80, height: 12, style: "ruinLedge" },
      { x: 206, y: 152, width: 48, height: 12, style: "ruinLedge" },
      { x: 268, y: 136, width: 46, height: 12, style: "ruinLedge" },
      { x: 318, y: 122, width: 46, height: 12, style: "ruinLedge" },
      { x: 378, y: 156, width: 40, height: 12, style: "ruinLedge" }
    ],
    boxes: [
      // Used for the lower box-only seal.
      { id: "seal-box", x: 54, y: 172, width: 20, height: 18, bounds: { minX: 20, maxX: 146 } },

      // Used as a climbing step in the center section.
      { id: "step-box", x: 196, y: 172, width: 20, height: 18, bounds: { minX: 176, maxX: 256 } }
    ],
    spikes: [
      // Lower route hazards
      { x: 151, y: 190, width: 24 },
      { x: 261, y: 190, width: 24 },
      { x: 369, y: 190, width: 24 },

      // Small upper-route punishers
      { x: 302, y: 136, width: 12 },
      { x: 350, y: 122, width: 12 },

      // Decorative unreachable ceiling spikes
      //{ x: 62, y: 160, width: 58, direction: "down" },
      { x: 190, y: 75, width: 35, direction: "down" }
    ],
    blades: [
      // Vertical blade guarding the first jump out of the left puzzle yard.
      { x1: 164, y1: 154, x2: 164, y2: 196, radius: 10, duration: 1700, phase: 180, broken: false },

      // Horizontal blade pressuring the upper route near the second seal.
      { x1: 286, y1: 108, x2: 346, y2: 108, radius: 10, duration: 1900, phase: 520, broken: false }
    ]
  }
];

