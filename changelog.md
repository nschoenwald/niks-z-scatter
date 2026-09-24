# Changelog

All notable changes to **Nik's Z-Scatter** are documented in this file.

## [2.3.0]

### Added
- **Complete Overlap Setting (`completeOverlap`)**:
  - Added new setting (enabled by default) that requires tokens to overlap completely across all of their grid squares before scattering.
  - Prevents unwanted scattering when large tokens (such as 2×2 or 3×3 creatures) merely touch or partially overlap on the grid.
  - Full support for both square grids (`rectsOverlapCompletely`) and hexagonal grid systems (checking exact match of occupied hex cell sets).
- **Direct Scene Refresh on Setting Changes**:
  - Exported `refreshScatter()` to recalculate layout immediately whenever settings or toolbar toggles change.
  - Added responsive `onChange` handlers for `scatter` and `ignoreDead`.
- **ActiveEffect & Actor Status Hooks**:
  - Automatically refreshes token scattering layout when status conditions (e.g. defeated, dead, unconscious) are applied or removed via ActiveEffects.
- **Combatant Defeat Integration**:
  - Evaluates `token.combatant?.defeated` and `CONFIG.specialStatusEffects.DEFEATED` in addition to status effect strings.
- **Foundry V13/V14 Mesh & UI Offsets**:
  - Anchors `token.mesh` positioning to `token.center` for flawless alignment across all grid configurations (including non-square hex grids).
  - Synchronizes `token.turnMarker` (combat turn ring) and `token.levelIndicator` with the scattered token sprite.
- **Documentation & Types**:
  - Created `readme.md`, `changelog.md`, and JSDoc typedefs in `types.js`.
  - Added full Japanese localizations for all settings.

### Fixed
- **Settings & Toolbar Toggle Inactivity**:
  - Fixed an issue where clicking the size snap toolbar button or changing settings had no immediate effect on existing tokens until manually moved or resized.
- **Crash Prevention on Optional Token Overlays**:
  - Added null-guards for `token.nameplate` and `token.tooltip` during `applyVisualOffset`.
- **Hexagonal Grid Mesh Offset**:
  - Fixed misaligned mesh sprite rendering on hexagonal column and row grids.
- **Lifecycle Registration**:
  - Moved settings registration to `Hooks.once('init')` for early availability.
  - Added `canvasReady` hook listener to ensure layout recalculates smoothly upon scene loading and switching.

### Changed
- **Module Rebranding**:
  - Renamed module title to **Nik's Z-Scatter**.
  - Updated module ID to `niks-z-scatter`.
- **Foundry V14 Scene Controls Compatibility**:
  - Deferred `getSceneControlButtons` hook registration into `Hooks.once('init')` to ensure proper execution ordering.
  - Enhanced control layer and tool resolution to support both V13 Array structures and V14 Record/Map structures seamlessly.
