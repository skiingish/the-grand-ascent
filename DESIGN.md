# Lift Operator — Design Doc (locked 2026-07-06)

## Pitch
You are a 1920s grand-hotel lift operator. Drive the lift with a lever, work the gate by hand,
and don't keep anyone waiting too long.

## Platform
Single HTML file, plain JS + Canvas, no build step. Open the file, play the game.

## Controls
- **↑ / ↓** — the lever. Momentum-based: hold to accelerate, release to coast, counter-hold to brake.
- **Space** — open/close the accordion gate. Hard interlock: can't move while open.
- Doors only open when the car is **flush** with a floor (small tolerance). Fumbling the stop burns
  time, and time is grumpiness.

## Passengers
- Spawn lobby-weighted: most arrive in the lobby going up, or on upper floors going down to the lobby;
  occasional cross-traffic. Weights drift toward chaos as the tower grows.
- Destination always visible (speech bubble; lit panel while riding).
- Auto-board up to capacity, one at a time (~0.5 s each).
- **Grumpy meter** per passenger: ticks faster while waiting than riding; spike if a full car
  stops and snubs them. Maxed = storm off + 1 strike. **3 strikes = run over.**

## Progression (endless)
- Start: 3 floors, capacity 3.
- Every 8 deliveries a new floor opens and the game pauses for an **upgrade draft**:
  two options drawn from the pool, pick one (←/→ + Enter, or 1/2).
  Pool: Wider Car (+1 capacity), New Winch (+speed), Oiled Gate (faster doors/boarding),
  Floor Magnet (settles the last inch once you've nearly stopped), Gramophone (riders calm),
  Desk Clerk (hall calm), Brass Tip Jar (+tips), Manager's Favor (+1 strike slot),
  Counterweight (fuller car moves faster), Lobby Bellboy (faster boarding at lobby).
  Each has a max level.
- After each opening: 8 s "ribbon-cutting" grace (no spawns, half-rate meters).
- Difficulty (spawn rate, patience decay) scales with floors opened, plateauing above
  single-lift throughput. Rider patience scales with trip distance; boarding calms guests (−0.2).
- **Silk Stop**: first-touch flush within a tight tolerance = faster boarding + 25% tip bonus.
- **Commendations**: every 20 flawless deliveries withdraws a strike (or pays $5 if clean).
- Camera follows the car; minimap strip shows the whole shaft with waiting passengers colored by mood.

## Scoring
- Tips scaled by remaining patience at delivery.
- End screen: **highest floor reached** + **tips earned**. High score in localStorage.

## Look & feel
- 1920s Art-Deco grand hotel, chunky pixel art, drawn programmatically (no external assets —
  research found no suitable free packs; cohesion by construction).
- Brass half-moon floor dial above the door = diegetic position/alignment instrument.
- Minimal sound: door clunk, tip ding, grumpy huff (WebAudio, synthesized).

## Build order
1. Lift physics + dial (driving must be fun alone)
2. Passengers + grumpiness + strikes
3. Growth + tips + end screen
4. Art & sound pass

## Parked for v2
Shift/level mode, special passengers (VIP, foreman, luggage), combo multipliers, music, touch controls.

## Reference
- *Operator* (Steam, 2020) — same loop, minimalist look, 90% positive. We differentiate on the
  tactile doorman fantasy (lever + gate) and period charm.
