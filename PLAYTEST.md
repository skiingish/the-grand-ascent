# Playtest Report #1 — four rounds of simulated human play (2026-07-06)

Method: a headless bot plays the real game code at 60 Hz with human-like flaws —
reaction latency, noisy brake-point estimation, imperfect greedy routing — tuned
to four skill levels representing a player learning across four sessions.
Rig: `tools/playtest.js`.

## Results

| Round | Skill | Survived | Tower | Reached | Delivered | Tips | Died to |
|---|---|---|---|---|---|---|---|
| 1 | sloppy (0.30s react, ±40% brake) | 5.1 min | 11 fl | FL 8 | 46 | $125 | 2 hall + 1 car storm |
| 2 | learning (0.24s, ±28%) | 5.6 min | 12 fl | FL 8 | 51 | $137 | 2 hall + 1 car |
| 3 | competent (0.20s, ±16%) | 4.8 min | 11 fl | FL 9 | 40 | $110 | 1 hall + 2 car |
| 4 | skilled (0.16s, ±8%) | 5.8 min | 13 fl | FL 11 | 57 | $172 | 0 hall + **3 car** |

Alignment skill clearly shows in the data (denied gate-opens 5→1, approach-to-doors
1.48s→0.83s) — but it buys almost nothing: **4× better play = 42 seconds more life.**

## Finding 1: the game punishes skill (the 5-minute wall)

Spawn rate and patience-decay difficulty both scale with `delivered`. A better
player delivers faster, so the game gets harder *per minute* at exactly the rate
the player improves. Everyone hits the wall at ~5 min regardless of skill. Death
feels like math catching up, not like a mistake.

**Fix:** scale difficulty by *floors opened* (the visible milestone), not raw
deliveries, and plateau the spawn interval well above single-lift throughput
(min interval ~2.6 s ≈ 23 guests/min vs. a physical ceiling of ~13 deliveries/min).

## Finding 2: tall towers break rider patience (the real killer)

The death cause flips with skill: sloppy players lose waiters in the hall; skilled
players lose *riders in the car*. Rider patience (85 s base, shrunk by the
difficulty multiplier) is fixed, but trip lengths grow with the tower. By floor
12+, a lobby-to-penthouse run plus two courtesy stops exceeds a rider's fuse.
The best round died to three car-storms in the final minute.

**Fixes:**
- **Patience scales with trip distance** — a guest bound for FL 14 knows it's far;
  give them fuse proportional to expected trip.
- **Boarding relief** — being picked up should *calm* people (e.g. −0.2 grump on
  boarding). Currently rescue changes nothing; the meter just keeps climbing.

## Finding 3: skill has nowhere to cash in (flat skill ceiling)

Perfect stops save ~0.5 s/stop; dwell (0.45 s/passenger) and travel time dominate.
The binding constraint is *throughput*, and precision doesn't buy throughput.

**Fixes (skill → throughput converters):**
- **Silk Stop**: first-try flush inside a tight tolerance ⇒ passengers swap at
  double speed + small tip bonus + a satisfying chime. Precision now buys time.
- **Lift upgrades bought with tips** between floor-openings (faster winch, quicker
  gate, +1 capacity): the operator's mastery compounds, letting experts push into
  floors casuals never see.

## Finding 4: long runs need strike forgiveness

3 lifetime strikes with no recovery means even a 1%-per-guest error rate caps runs
at ~100 deliveries. High floors are mathematically unreachable however good you are.

**Fix:** a **commendation** wipes one strike after N flawless deliveries (say 20–25).
Keeps the dread of 2 strikes, makes 15-minute master runs possible.

## Finding 5: floor openings should be a breather, not a spike

Deaths cluster immediately after floors 10–13 open: each opening lengthens trips
AND spawns keep accelerating. The reward moment is the most dangerous moment.

**Fix:** a short "ribbon-cutting" grace period after each floor opens (spawns pause
~8 s, meters tick at half rate) — celebrate, breathe, then escalate.

## What already works (don't touch)

- The momentum lever + flush-zone gate feel is real skill and shows in the metrics.
- The full-car snub and hall/car patience asymmetry create the right dread.
- The tower-growth reward loop reads clearly; deliveries → floors is motivating.

## RESULTS AFTER TUNING (same 4 bot rounds, post-fix)

All five fixes implemented (plus the upgrade-draft system replacing auto capacity):

| Round | Before | After | Floors before → after |
|---|---|---|---|
| 1 sloppy | 5.1 min | 12.5 min | FL 8 → FL 14 |
| 2 learning | 5.6 min | 12.4 min | FL 8 → FL 14 |
| 3 competent | 4.8 min | **22.8 min** | FL 9 → **FL 30** |
| 4 skilled | 5.8 min | **29.1 min** | FL 11 → **FL 41** |

Skill now buys 2.3× survival and 3× tower height — the wall is gone and the
curve is steepest exactly where mastery kicks in. Car-storm deaths dropped to
zero (trip-scaled patience + boarding relief worked); all deaths are now hall
storms in deep late game, i.e. genuine throughput saturation — the correct
way to die. Watch for: whether ~12 min is too long before a casual player's
first death, and whether late-game (30+ floors) needs a soft difficulty
escalation so runs still end.

**Follow-up (same day):** after Counterweight/Bellboy/Favor joined the pool,
skilled bots hit the 30-min cap without dying, so the late-game escalation
came due: difficulty cap raised 1.8 → 2.4 and spawn plateau 3.4 s → 2.9 s.
Post-tune curve: 11.9 min / FL 13 (sloppy) → ~22 min / FL 27–28 (skilled).
All runs end; skill ≈ 2× survival.

## Recommended tuning order

1. Boarding relief + trip-scaled rider patience (kills the unfair deaths)
2. Difficulty by floors with plateau + ribbon-cutting grace (fixes the wall)
3. Silk Stop (rewards the core skill)
4. Commendations (enables long mastery runs)
5. Tip-funded upgrades (long-term progression, needs a small shop UI)
