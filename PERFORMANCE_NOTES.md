# Gridiron Gauntlet Performance Pass

This build is an internal performance cleanup only. The goal was to keep the current design, pages, scoring, perk rules, roster rules, random rolls, and gameplay behavior unchanged while removing repeated work and reducing the runtime data payload.

## What was optimized

- Compacted the generated NFL runtime database to fields the live game actually reads.
- Preserved all 9,117 player-seasons and all 88,503 weekly records.
- Added lazy indexes for season, position, player history, and historical franchise lookups.
- Cached immutable player metadata used repeatedly during scoring and roster operations.
- Reused playable-week lists instead of rebuilding them during lineup generation.
- Reduced repeated full-database scans in Time Travel and Division Rival.
- Reduced repeated sorting/filtering when generating Booster Packs.
- Reused CPU player-strength calculations while building an opponent roster.
- Short-circuited legality checks once a valid replacement is found.
- Reused the small permutation sets used by Trade Market offers.
- Avoided re-looking up canonical NFL player objects inside PlayerCard.
- Memoized stable arena/avatar presentation components.
- Updated the NFL data generator so future generated runtime files remain compact.

## Runtime data validation

The compact database was compared against the original database using the fields read by the live game and UI.

- Player-seasons checked: 9,117
- Weekly records checked: 88,503
- Semantic mismatches: 0

Zero-valued weekly numeric statistics may be omitted in the compact file because the existing game helpers already treat missing numeric values as zero. Single-team `teams` arrays may also be omitted because the existing helper falls back to `team`.

## Data module benchmark in this workspace

- Original `nflPlayers.js`: 62,150,211 bytes
- Optimized `nflPlayers.js`: 10,194,168 bytes
- Original Node import: about 2.00 seconds, about 499,696 KB peak RSS
- Optimized Node import: about 0.37 seconds, about 175,020 KB peak RSS

These numbers measure loading the data module in this workspace, not browser FPS, but they show the largest startup payload and memory bottleneck was substantially reduced.

## Deliberately unchanged

- `src/styles/app.css`
- `src/styles/layout.css`
- `src/components/PerkCard.css`
- `src/components/PlayerCard.css`
- Legal page content and layout
- Page structure and navigation
- Fantasy scoring rules
- Perk behavior and odds
- Draft/roster legality rules
- Round progression
- Best Ball behavior
- Blind Week / Film Study behavior

## Build validation note

The uploaded `node_modules` contains Windows-native Rolldown/Oxlint binaries, while this workspace runs Linux, so a complete Vite build cannot be executed here with that copied dependency folder. Plain JavaScript modules were syntax-checked and the data was semantically verified.

After extracting on Windows, run:

```bash
npm install
npm run lint
npm run build
```

`npm install` ensures native optional dependencies match the local Windows/Node environment.
