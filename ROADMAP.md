# Roadmap / Parked Work

## PARKED: Character cast (pick up later)
Full design ready in `CHARACTERS.md` — 16 characters in tiers keyed to tower
height (regulars 9+, eccentrics 13+, legends 17+, rare celebrities 15+), with
palettes and drawing notes that slot into `drawPerson()`, and v1-ready quirks
using only existing mechanics (patience/tip multipliers, destination patterns).

**Pick-up steps when resumed:**
1. Add a spawn table that rolls named characters by current `G.floors` tier
2. Extend `drawPerson()` with per-character prop rects (instrument, goggles, etc.)
3. Wire quirk fields (`patMul`, `tipMul`, `spawnRule`) into the patience/tip/spawn code
4. Celebrity flourish: `glow()` sparkle + `say()` announcement + fanfare, max one alive
5. Start with 3 characters (Bellhop, Flapper, Madame Zora) to validate the pipeline

## IN PROGRESS: Gameplay tuning (from PLAYTEST.md)
- Start at 3 floors; upgrade draft (pick 1 of 2) each time a floor opens
- Boarding relief, trip-scaled rider patience, floor-based difficulty,
  ribbon-cutting grace, Silk Stop, commendations

## IDEAS BACKLOG (unscheduled)
- Rush-hour waves (morning down-rush to lobby, evening up-rush)
- Daily-seed challenge run (same spawn sequence for everyone, shareable score)
- Silk Stop streak combo (consecutive silk stops multiply tips)
- Gate-jam event: gate sticks, mash Space to free it (guests watch, meters tick)
- Regulars: recurring guests who remember you (tip more if never failed them)
- Shift mode with graded report card (the v2 structure from DESIGN.md)
- Touch/mobile controls; music (ragtime loop)
