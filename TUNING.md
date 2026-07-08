# Tuning Levers — where every knob lives and how to pull it

All gameplay constants live in `src/js/` (physics + patience in `45-update.js`,
spawn + tips in `35-passengers.js`, upgrades in `25-upgrades.js`, cast in
`35-passengers.js`). After ANY change: `node tools/build.js`, then run:

```
node tools/smoke.js       # logic regression suite, must be all green
node tools/playtest.js    # 4 simulated skill levels; run 2-3 samples (RNG variance is real)
```

**Balance targets** (what "tuned" means):
- Sloppy bot dies ~7 min → real beginners die ~5 min (bots never overshoot; humans do)
- Skilled bot: 15–25 min, floors 20–35 — long but ALWAYS ends (never hits the 30-min cap)
- Curve roughly monotonic across the four rounds (accept wobble; RNG matters)
- Deaths should be hall storm-offs (throughput saturation), not car storms (unfair)
- First named character sighted by ~3 min of beginner play

## Pacing levers

| Lever | Location (search in src/js/) | Current | Effect |
|---|---|---|---|
| Spawn curve | `base=Math.max(3.05,7.2-0.32*G.floors)` | 7.2s intercept, 3.05s plateau | Lower intercept = hotter early game; lower plateau = harsher late game |
| Difficulty curve | `diff=Math.min(2.4,1+(G.floors-2)*0.05)` | ×1.15 at start, cap ×2.4 | Multiplies ALL patience decay |
| Wait patience | `dt/(p.arch?52:42)` | 42s fuse; named guests 52s | Hall storm-off speed |
| Ride patience | `dt/((p.arch?100:88)*(1+0.12*trip))` | 88s (100 named) + 12%/floor | Car storm-off speed; trip scaling is why long hauls are fair |
| Boarding relief | `p.grump=Math.max(0,p.grump-0.2)` | −0.2 | How much being rescued calms a guest |
| Grace period | `G.graceT=8` | 8s | Breather after each floor opens (no spawns, half decay) |
| Start size | `floors:5, cap:3` in `reset()` | 5 floors, cap 3 | Bigger start = livelier + slightly harder opening |
| Growth pace | `G.nextFloorAt+=8` | 8 deliveries/floor | Upgrade + difficulty cadence |

## Skill-expression levers

| Lever | Location | Current | Effect |
|---|---|---|---|
| Lift physics | `ACC=3.4..., MAX=2.7..., DRAG=0.85` | — | The feel. Change with extreme care |
| Flush tolerance | `flushTol()` in 25-upgrades.js | ±0.085 floors | How forgiving stopping is |
| Silk Stop window | `Math.abs(G.pos-f)<0.035` | ±0.035 | Perfect-stop reward threshold |
| Silk bonus | `tip*=1.25` and `0.24` transfer | +25% tips, ~2× boarding | What precision pays |
| Transfer time | `xferTime()` | 0.45s base | Dwell cost per passenger |
| Strikes | `maxStrikes()` = 3 + favor | 3 | Lives |
| Commendation | `G.flawless>=20` | 20 flawless | Strike-recovery pace |

## Upgrade magnitudes (all in `UPGRADES` table + call sites)

speed +10% ACC/+12% MAX per lv · gate ×0.88 transfer + faster doors · magnet
(see flush tol; also auto-settle strength `dt*1.3*lv` inside range 0.09/vel 0.22) ·
music ×0.75 ride decay · clerk ×0.85 hall decay · tipjar +15% · favor +1 strike ·
counter +15% speed × load fraction · bellboy ×0.78 lobby transfers

## Character-cast levers (see CHARACTERS.md)

| Lever | Current | Effect |
|---|---|---|
| Tier unlocks `TIER_UNLOCK` | T1@7, T2@12, T3@17 floors, celebs@15 | When the parade starts (T1@7 ⇒ first wacky ~2-3 min) |
| Tier spawn shares | T1 18%, T2 15%, T3 10%, celeb 1/25 | Density of named guests |
| Per-character `pat`/`tip`/`w` | `ARCH` table | Individual risk/reward |

## Process notes
- The bot's round-1 skill ≈ a decent second-session human. True first-timers are worse.
- One playtest sample is noise; two agreeing samples are a signal.
- tools/playtest.js prints strike causes (hall vs car) — car storms mean patience is
  mis-tuned, hall storms mean throughput pressure (intended).
