# Nik's Z-Scatter

**Nik's Z-Scatter** (`niks-z-scatter`) is a Foundry Virtual Tabletop module that automatically disperses overlapping tokens so they don't block each other from view or selection.

Tokens are visually offset using a physics-inspired radial separation model while preserving their exact logical coordinates on the grid. Vision, line-of-sight, ruler measurements, and system rules remain 100% accurate.

---

## Features

- **Non-Destructive PIXI Offsetting**: Shifts token sprites, hitboxes, selection borders, nameplates, status effect icons, and resource bars visually without changing the underlying `TokenDocument` coordinates.
- **Complete Overlap Filter (New & Enabled by Default)**: Only scatters tokens when they overlap completely across all of their grid squares (e.g., tokens stacked directly on top of each other in the same square/space), avoiding unwanted dispersal when large tokens merely graze or partially overlap each other.
- **Dynamic Physics Relaxation**: Clustered tokens push away from the cluster center and each other with area-weighted resistance—smaller tokens yield while larger tokens hold their ground.
- **Square & Hexagonal Grid Support**: Full collision and cell detection for square grids as well as all four hexagonal grid orientations (`HEXODDR`, `HEXEVENR`, `HEXODDQ`, `HEXEVENQ`).
- **Interactive HitArea Sync**: Token hitboxes shift along with the sprite, allowing clicking, hovering, dragging, and targeting to work naturally on the visually offset position.
- **Animation Aware**: Pauses scattering while tokens are actively animating along movement paths to avoid jitter.
- **Scene Controls Toolbar Button**: Adds a quick toggle button (`sizeSnap`) to the Token Controls layer for GMs (and optionally players).
- **Foundry V13 & V14 Compatible**: Built and verified for modern Foundry VTT architectures.

---

## Settings

| Setting | Scope | Default | Description |
|---|---|---|---|
| **Complete Overlap Only** (`completeOverlap`) | World | `true` | When enabled, tokens only scatter if they overlap completely in all of their grid squares. Partial overlaps (e.g., 2×2 or 3×3 creatures sharing only 1 or 2 squares) will not trigger scattering. |
| **Ignore Special Cases** (`ignoreDead`) | World | `true` | Tokens marked as dead, dying, or unconscious will not be scattered and will not push other tokens. |
| **Ignore Misaligned Tokens** (`ignoreMisaligned`) | World | `true` | Tokens placed intentionally off-grid (via Shift-drag) are ignored by the scattering system. |
| **Ignore Token Elevation** (`ignoreElevation`) | World | `false` | When `false`, tokens at different elevations do not collide or scatter. When `true`, tokens scatter regardless of elevation differences. |
| **Collide Different Token Sizes** (`collideDifferentSizes`) | World | `true` | Allows tokens of different dimensions to collide and scatter together (subject to overlap settings). |
| **Scattering** (`scatter`) | World | `0.30` | Distance multiplier determining how far tokens disperse from the cluster center (0.01 to 1.0). |
| **Hide Button** (`hideBtn`) | World | `false` | Hides the size snap toggle button from the token controls toolbar. |
| **Show Button to Players** (`playersBtn`) | World | `false` | Shows the size snap toggle button to players, allowing per-client visual preferences. |

---

## Compatibility

- **Foundry VTT**: Minimum Version 13, Verified Version 14.
- **Systems**: System-agnostic (DnD5e, Pathfinder 2e, etc.).
