# Changelog

## 2026-08-19

### 1) Remote publishing and repo wiring
- Diagnosed why updates were not appearing on GitHub.
- Found that the local repo had no remote configured.
- Added `origin` pointing to `https://github.com/training0826/skills-introduction-to-git.git`.
- Rebased local `main` onto remote `main` and pushed successfully.
- Verified `src/myscratchpad.md` existed in pushed history.

### 2) Game startup fix (blocks not appearing)
- Repaired broken UI wiring in `src/index.html`.
- Restored required preview elements:
  - `patternCanvas`
  - `patternName`
- Removed invalid/duplicate score markup and duplicate `id="score"` usage.
- Ensured all IDs referenced by `src/index.js` existed exactly once.

### 3) Completed line clearing
- Implemented row-clear logic in `src/index.js`:
  - Detect full rows.
  - Remove full rows.
  - Shift board down by unshifting empty rows.
- Hooked line clearing into both lock paths:
  - normal fall lock (`moveDown`)
  - hard drop lock (`hardDrop`)

### 4) Scoring update to classic line clears
- Replaced flat line scoring with classic-style values (scaled by level):
  - 1 line = 100
  - 2 lines = 300
  - 3 lines = 500
  - 4 lines = 800

### 5) Void block behavior change
- Changed former void blocks (value `8`) to normal playable blocks.
- Updated color for block `8` to white (`#ffffff`).
- Updated logic so block `8` counts as filled for:
  - line completion
  - pattern/occupancy checks at the time

### 6) Piece set expansion
- Added L-shaped blocks:
  - `L`
  - mirrored `L`
- Added additional classic tetrominoes:
  - `I`
  - `T`
  - `S`
  - `Z`

### 7) Gameplay direction change: remove target pattern mode
- Removed target-pattern gameplay flow from `src/index.js`:
  - removed pattern selection/matching/board-clear functions
  - removed pattern-check calls after piece lock
- Added next-piece queue and preview system:
  - `nextPiece` state
  - random piece factory
  - side-panel preview rendering for upcoming piece
- Updated leveling logic to progress by cleared lines:
  - level increases every 10 lines
  - drop speed accelerates with level

### 8) UI updates for next-piece mode
- Updated `src/index.html` side panel:
  - changed title from "Target Pattern" to "Next Piece"
  - changed preview caption to "Up Next"
  - updated subtitle to match line-clearing gameplay
- Removed unused `patterns.js` script include.

### 9) Validation performed during changes
- Repeatedly checked for syntax/runtime issues in edited files.
- Confirmed no reported errors in:
  - `src/index.js`
  - `src/index.html`
