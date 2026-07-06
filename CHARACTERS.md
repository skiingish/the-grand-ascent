# The Grand Ascent — Passenger Cast (1926)

> **Design rule: the taller the tower, the stranger the guests.**
> The building grows a floor every 8 deliveries. Character *tiers* unlock by `G.floors`,
> so a long run literally fills the lobby with more interesting people. Early game stays
> readable and calm; late game becomes a parade.
>
> All specs target the existing `drawPerson()` (~14×27 px, rect-based, 3-tone coat
> `[cA, cB, cC]`, `lady`/`hat`/`bag` flags, grump face). Every character is a passenger
> object with a few extra fields — no new render pipeline, just extra `px()` calls keyed
> off a `p.arch` (archetype) string.

---

## How tiers unlock

| Tier | Unlock (`G.floors`) | Who | Share of spawns once unlocked |
|---|---|---|---|
| 0 — Ordinary Guests | 6 (start) | procedural guests, as today | always the baseline |
| 1 — Colorful Regulars | 9 | Bellhop, Flapper, Salesman, Chef | ~25% of spawns |
| 2 — Eccentrics | 13 | Aviatrix, Medium, Detective, Bootlegger, Professor | ~20% of spawns |
| 3 — Legends | 17 | Opera Diva, Jazz Bandleader, Oil Baroness, The Colonel | ~12% of spawns |
| ★ — Celebrities | 15+ | Screen Star, Escape Artist, The Duchess & Pomeranian | rare: ~1 per 25 spawns, max 1 alive |

Implementation sketch (v1-ready): in `spawnPassenger()`, roll a tier from the unlocked
set with the weights above, then pick a character from that tier. Named characters carry:

```js
{ arch:'aviatrix', patMul:1.0, tipMul:1.5, spawnRule:'topdown', ... }
```

- `patMul` multiplies grump gain (`p.grump += dt/40*diff*patMul`) — <1 = saintly, >1 = impatient.
- `tipMul` multiplies the delivered tip.
- `spawnRule` overrides the from/dest roll (see each entry).

---

## Tier 0 — Ordinary Guests (floors 6–8, and forever after)

Today's procedural guests. Keep them as the calm baseline — the named cast reads as
special *because* these stay plain. Variety should scale gently (see
[Ordinary-guest variety scaling](#ordinary-guest-variety-scaling) at the bottom).

---

## Tier 1 — Colorful Regulars (unlock at 9 floors)

### 1. Freddie the Bellhop
- **Archetype:** hotel bellhop, forever running errands for guests.
- **Palette:** pillbox red `#a63d2f` / `#7d2e23` / `#c25a4a` coat (reuses `P.rust` family), brass buttons `#c9a227`, pillbox hat `#8a3227` with `#c9a227` band.
- **Silhouette / drawing:** standard male body, no fedora — instead a 6×3 flat pillbox: `px(x+4,hy-3,6,3,'#8a3227')` + 1px brass band. Two 1px brass buttons down the coat front replacing the tie.
- **Quirk (v1-ready):** *Never off the clock.* `spawnRule:'cross'` — always cross-traffic (random floor → random other floor, never lobby-biased). `patMul:0.8` (he's staff, he understands). `tipMul:0.6` (bellhops don't tip much). Higher spawn weight than other named regulars — he's the tier's workhorse and teaches players cross-traffic.
- **v2:** exits instantly (0.1 s transfer instead of 0.45) — he hustles.

### 2. Dot Whitmore, Flapper
- **Archetype:** bright young thing, always headed to wherever the party is.
- **Palette:** peacock dress `#1f7a8c` / `#155e6d` / `#3aa0b5`, sequin sparkle `#f0d68a`, headband `#f4e8cf` with jade feather `#4a9a83`.
- **Silhouette / drawing:** `lady:true` body; add a fringe hem — 1px dashes of `#3aa0b5` along the skirt bottom that alternate with `step` so the fringe swings when she walks. Headband: replace cloche rows with `px(x+3,hy-1,8,1,'#f4e8cf')` + 2px feather above.
- **Quirk (v1-ready):** *Party homing.* `spawnRule:'top2'` — destination is always one of the two **highest** floors (that's where the fun is tonight). `patMul:1.15` (fashionably impatient), `tipMul:1.3`.
- **v2:** while she rides, other riders' grump ticks 20% slower — charm is contagious.

### 3. Herb Gundy, Traveling Salesman
- **Archetype:** vacuum-cleaner salesman with an enormous sample case.
- **Palette:** loud check coat `#8a7440` / `#6e5c33` / `#a48f5c` (existing COATS[4]) with `#a63d2f` 1px lapel stripe; straw boater `#d9c98a`, band `#7a3b30`.
- **Silhouette / drawing:** male body + oversized case: enlarge the `bag` rect to 6×7 `#4a3120` with a 1px `#c9a227` clasp — it should visibly stick out past his silhouette. Boater = flat 8×2 `#d9c98a` brim + 6×2 crown.
- **Quirk (v1-ready):** *Door-to-door.* `spawnRule:'nextfloor'` — destination is always exactly one floor above or below where he boards. Cheap, short rides: `tipMul:0.7`, but a very forgiving `patMul:0.7` — easy filler passenger and a nice combo-brain teaser.
- **v2:** the case takes 2 capacity slots.

### 4. Chef Aubertin
- **Archetype:** the hotel's volcanic French chef, shuttling between kitchen and banquet floors.
- **Palette:** whites `#f4e8cf` / `#d8cbb0` / `#ffffff`, neckerchief `#a63d2f`, toque `#ffffff`.
- **Silhouette / drawing:** male body in cream 3-tone; the toque is the silhouette hook — a tall 6×6 white stack above the head (`px(x+4,hy-6,6,6,'#fff')` + `#d8cbb0` shading column), making him the tallest sprite so far. Red 2×2 neckerchief where the tie goes.
- **Quirk (v1-ready):** *Soufflé timer.* `spawnRule:'lobbykitchen'` — always travels between floor 1 (kitchen) and a random upper floor. `patMul:1.5` — grumps fast, storms theatrically — but `tipMul:1.6` if you get him there happy. Risk/reward regular.
- **v2:** his storm-off shakes the screen and briefly speeds every waiter's grump by 10% for 3 s — kitchen tantrum.

---

## Tier 2 — Eccentrics (unlock at 13 floors)

### 5. Amelia "Skylark" Vane, Aviatrix
- **Archetype:** record-chasing pilot who keeps a suite on the top floor.
- **Palette:** leather flight coat `#6b4a2c` / `#523821` / `#8a6540`, white silk scarf `#f4e8cf`, goggles lens `#4a9a83` on strap `#2a2018`.
- **Silhouette / drawing:** `lady:true` but with the *male* trouser legs (she wears breeches — set a `pants` flag). Goggles: 2px `#2a2018` band across the brow with two 2×2 `#4a9a83` lenses pushed up on the forehead. 1px cream scarf tail trailing off one shoulder that flips with `step`.
- **Quirk (v1-ready):** *Altitude only.* `spawnRule:'roof'` — from the lobby, destination is always the **current top floor**, no exceptions. `patMul:0.85` (pilots are patient with machinery), `tipMul:1.5`. She's a long-haul express fare — the game's reward for confident full-shaft runs.
- **v2:** if delivered with the car having hit max speed during her ride, tip doubles — she loves a fast climb.

### 6. Madame Zora, Séance Medium
- **Archetype:** velvet-draped spiritualist holding séances on floor 13.
- **Palette:** midnight violet `#3d2b52` / `#2c1f3d` / `#584175`, moon-silver jewelry `#c8c8d8`, turban `#584175` with brooch `#c9a227`.
- **Silhouette / drawing:** `lady:true`, dress extended 2px wider at the hem (floor-length — omit the leg rects entirely, dress runs to y-2). Turban: 8×4 rounded stack of `#584175` with a single 1×2 brass brooch pixel. Optional: 1 semi-transparent `rgba(200,200,216,.25)` pixel drifting above her head on a sine — ectoplasm.
- **Quirk (v1-ready):** *The spirits insist on thirteen.* `spawnRule:'floor13'` — destination is **always floor 13** while it exists (before floor 13 opens she cannot spawn — a free bit of foreshadowing when she first appears). `patMul:0.6` — eerily, serenely patient. `tipMul:1.2`. Low spawn weight.
- **v2:** her speech bubble occasionally shows the destination of the *next* passenger to spawn — she has foreseen it.

### 7. Sam Flint, Hotel Detective
- **Archetype:** house detective in a rumpled trench coat, watching everyone.
- **Palette:** trench `#4a453c` / `#3a362f` / `#5d574c`, fedora `#2e2a24` with `#1d1814` band, ember of a toothpick `#e0a83c` at the mouth.
- **Silhouette / drawing:** male body; wider-brim hat — extend the brim row to 12px (`px(x+1,hy,12,1,...)`). Coat collar popped: two 2×2 `#5d574c` blocks flanking the head base. Eyes drawn 1px narrower (single pixels, no brow gap) — permanently squinting.
- **Quirk (v1-ready):** *Tailing a suspect.* `spawnRule:'shadow'` — on spawn, copy the `from`/`dest` of the most recent still-waiting passenger (fallback: normal roll). He literally follows people around. `patMul:0.75`, `tipMul:1.0`, modest spawn weight. Players will notice the pattern and grin.
- **v2:** if he rides in the same car as a Bootlegger, the Bootlegger's tip is confiscated (0×) and Flint's triples. Cat and mouse.

### 8. "Lucky" Lou Marchetti, Bootlegger
- **Archetype:** cheerful gentleman with a suspicious crate of "maple syrup".
- **Palette:** pinstripe charcoal `#33383f` / `#262a30` / `#4a515c` with 1px `#f4e8cf` pinstripes (two vertical 1px cream lines on the coat), white spats `#f4e8cf` over black shoes, fedora `#33383f`.
- **Silhouette / drawing:** male body; pinstripes = two `px(x+4,ty+1,1,8)` / `px(x+7,ty+1,1,8)` cream columns. Spats: overwrite the top 1px of each shoe rect with cream. Always `bag:true`, but the bag is a wooden crate `#8a6540` with `#523821` slats, carried low.
- **Quirk (v1-ready):** *Deliveries after dark.* `spawnRule:'basementrun'` — always boards on floor 2 (the "cellar stairs" floor) heading to a random high floor. `patMul:1.3` (nervous!), `tipMul:2.0` — the best per-ride money in the game, if you're quick. Low spawn weight.
- **v2:** crate takes 2 capacity slots; see Detective synergy above.

### 9. Professor Thistlewood, Absent-Minded Academic
- **Archetype:** lepidopterist who booked the wrong hotel and stayed anyway.
- **Palette:** mossy tweed `#5c5a3e` / `#4a4832` / `#757352`, cream shirt, spectacles `#c9a227` wire, wild white hair `#e8e4da`.
- **Silhouette / drawing:** male body, **no hat** — instead a 3-row shock of `#e8e4da` hair with 1px tufts sticking out both sides beyond the head rect. Spectacles: two 1px `#c9a227` circles (single pixels) over the eyes with a 1px bridge. A 2×3 `#7a3b30` book tucked under one arm (replaces bag).
- **Quirk (v1-ready):** *Wrong floor again.* `spawnRule:'reroll'` — his bubble destination silently **rerolls once** 10 seconds after spawning if he's still waiting ("oh dear, it was the *ninth* floor"). Very forgiving `patMul:0.55`, `tipMul:1.1`. He's a soft-comedy passenger who punishes nobody but rewards attentive players who recheck bubbles.
- **v2:** small chance he exits at the wrong floor by himself, then re-queues there — no penalty, pure vaudeville.

---

## Tier 3 — Legends (unlock at 17 floors)

### 10. La Farfalla, Opera Diva
- **Archetype:** touring soprano; the hotel exists, as far as she is concerned, for her.
- **Palette:** scarlet gown `#8c1f2e` / `#6d1723` / `#b03a4a`, gold trim `#f0d68a`, fur stole `#e8e4da` / `#c8c2b6`, jeweled aigrette `#4a9a83`.
- **Silhouette / drawing:** `lady:true`, hem widened to 12px and floor-length (skip legs). Fur stole: a 12×2 cream band across the shoulders overlapping the arms. Aigrette: 1×3 jade plume rising from the hair. She should read as the widest, richest sprite in the game.
- **Quirk (v1-ready):** *Prima donna.* `patMul:2.0` — grumps twice normal speed; `tipMul:3.0` when happy. `spawnRule:'lobbytop3'` (lobby ↔ one of the top three floors). Rare spawn. She is the game's late-run skill check: a siren song of tips that can hand you a strike.
- **v2:** while she waits, all other waiters on her floor grump 25% faster — she complains loudly.

### 11. King Oliver Boone & his Trombone, Jazz Bandleader
- **Archetype:** bandleader playing the rooftop garden every night.
- **Palette:** cream tuxedo `#f4e8cf` / `#d8cbb0` / `#ffffff` with black satin lapels `#1d1814`, skin from existing `SKINS[1]`, brass trombone `#c9a227` / `#f0d68a`.
- **Silhouette / drawing:** male body in cream 3-tone, 2×2 black lapel blocks, black bow tie (2×1) instead of the rust tie. Trombone: a 1×8 brass diagonal approximated by 3 stepped rects along his side ending in a 3×3 bell — carried like the bag but tall. No hat; short black hair.
- **Quirk (v1-ready):** *Showtime.* `spawnRule:'gigclock'` — spawns in the lobby, destination always the top floor; but on a *second* pattern, later spawns of him start at the top going down (after the set). `patMul:0.7` (musicians run late themselves), `tipMul:1.8`. When he boards, play the existing `S.fanfare()` — free flourish, no new audio.
- **v2:** while he rides, every rider's grump *decreases* slowly — he practices in the car.

### 12. Henrietta Van Der Rill, Oil Baroness
- **Archetype:** widowed tycoon inspecting the hotel she may or may not buy.
- **Palette:** ink-black tailored coat `#1d1814` / `#12100d` / `#33302a`, pearl rope `#f4e8cf` (3 spaced 1px dots down the front), silver-fox collar `#c8c2b6`, lorgnette `#c9a227`.
- **Silhouette / drawing:** `lady:true` in near-black 3-tone (highest contrast against every wall theme), 12×2 grey fur collar band, three cream pearl pixels. Lorgnette: 1px brass stick to a 2×1 brass rect held at eye height on one arm.
- **Quirk (v1-ready):** *The inspection.* `spawnRule:'audit'` — her destination is always the floor with the **most waiting passengers** (she goes where the trouble is). `patMul:1.2`, `tipMul:2.2`. Delivering her *to* a crowded floor naturally positions you to serve that crowd — the game quietly teaches routing.
- **v2:** tip pays double if no passenger stormed off during her ride — she rewards a well-run house.

### 13. The Colonel (ret.), Big-Game Raconteur
- **Archetype:** monocled ex-officer who has one more story about the tiger.
- **Palette:** khaki `#9a8a5c` / `#7e7049` / `#b5a677`, crimson sash `#8c1f2e`, white walrus mustache `#e8e4da`, pith helmet `#d9c98a`.
- **Silhouette / drawing:** male body; pith helmet = 8×2 dome `#d9c98a` + 12×1 brim. Mustache: 6×2 cream block under the eyes, overlapping the face bottom. Sash: 1px crimson diagonal across the torso (3 stepped pixels). Monocle: 1px brass over one eye.
- **Quirk (v1-ready):** *Settled in for the evening.* `patMul:0.4` — the most patient guest in the game; he *never* practically storms. But `tipMul` scales the other way: base 1.0. `spawnRule:'longhaul'` — always spawns at least 6 floors from his destination. He's the "hold him for later" passenger you can safely park while triaging divas.
- **v2:** takes 1.5 s to board/exit instead of 0.45 s — old campaign wound, and one more story.

---

## ★ Celebrities — rare spawns with a visible flourish

Unlock at 15 floors. Roughly 1 in 25 spawns; never more than one alive at a time; each
arrives with a screen `say()` announcement (reuse `S.fanfare()`).

### C1. Gloria Delacroix, Moving-Picture Star
- **Palette:** silver-screen white gown `#ffffff` / `#dcdcdc` / `#f4e8cf`, platinum hair `#e8e4da`, diamond choker `#c8c8d8`.
- **Flourish:** twinkling sparkles — 2–3 `rgba(255,255,255,.7)` single pixels orbiting her sprite on `Math.sin(G.t*4+i)` offsets, plus a soft `glow()` at her feet (both helpers already exist). Announcement: `say("GLORIA DELACROIX HAS ARRIVED",3)`.
- **Quirk (v1-ready):** `patMul:1.6`, `tipMul:4.0`, `spawnRule:'penthouse'` (lobby → top floor only). The single richest fare in the game and a genuine event.
- **v2:** two ordinary guests spawn with her as autograph-hunters sharing her exact from/dest — an instant 3-person express run (entourage).

### C2. Il Magnifico, Escape Artist
- **Palette:** black tailcoat `#1d1814` / `#12100d` / `#2e2a24` with crimson-lined cape `#8c1f2e` (2px red columns inside the coat edges), top hat `#1d1814` 6×5 with `#8c1f2e` band, waxed mustache 4×1.
- **Flourish:** he does not walk on — he **appears** in a 6-frame puff: draw 3 expanding `rgba(244,232,207,.4)` rects at his spawn point before the sprite pops in. Announcement bubble: `"?"` for the first 2 seconds before revealing his destination.
- **Quirk (v1-ready):** *The vanishing.* If his grump maxes he doesn't strike — `struck:true` is pre-set; instead he simply *vanishes* (same puff, `state:'gone'`, `say("HE'S GONE! ...HOW?")`). You lose the fare but never the strike. `patMul:1.4`, `tipMul:2.5`, `spawnRule:'cross'`. The only forgiving high-roller — pure delight, zero punishment.
- **v2:** 10% chance that on delivery he is somehow *already standing on the destination floor* waving as the doors open — double tip for the trick.

### C3. The Duchess of Marlow & "Bijou" the Pomeranian
- **Palette:** dove-grey traveling suit `#8a8578` / `#6f6b60` / `#a5a094`, amethyst brooch `#584175`, Bijou: 5×4 apricot pom `#e0a83c` / `#c9922e` with 1px `#1d1814` eye and `#8c1f2e` ribbon bow.
- **Flourish:** Bijou is a second mini-sprite drawn 8px ahead of her, bobbing on its own 2-frame trot, connected by a 1px `#c9a227` leash line (`ctx` line or 3 stepped pixels). The dog rides too — draw it at her feet in the car. Yips: reuse `S.coin()` pitched down, or skip audio for v1.
- **Quirk (v1-ready):** `patMul:0.9`, `tipMul:2.0`, `spawnRule:'promenade'` — she only ever travels 2–3 floors at a time (taking Bijou on his rounds), then may respawn later on the floor she was delivered to, continuing upward. A recurring mini-story across one run.
- **v2:** Bijou occupies a capacity slot (the Duchess insists).

---

## Ordinary-guest variety scaling

The baseline crowd should also drift richer as the tower grows — cosmetics first
(v1-ready), mechanics second (v2).

**v1-ready (pure spawn-table / palette changes):**
- **More coats with height:** append to `COATS` as floors unlock — at 9 floors add plum `['#5a3a5e','#472e4a','#735079']` and forest `['#3a5a3e','#2d4630','#4e7253']`; at 13 add mustard `['#a3852e','#836a24','#bd9f4a']` and powder blue `['#5a7a9a','#47617b','#7495b3']`; at 17 add cream-evening `['#d8cbb0','#b5a98f','#f4e8cf']` and jet `['#26221e','#1a1714','#38332d']`. Early floors stay muted; the late tower dresses for dinner.
- **Evening-wear ratio:** past 13 floors, raise `hat` chance to 0.75 and give ladies a 25% chance of a `#f0d68a` necklace pixel and long gloves (recolor forearm rects cream). No logic changes — draw flags only.
- **Kids (cosmetic v1):** past 9 floors, 12% of guests spawn `small:true` — drawPerson with legs 2px shorter, head 1px lower, no hat, sailor collar (2 white pixels). Same mechanics as adults; they just make the crowd read alive. Pair each kid's from/dest with the previously spawned adult so they visually travel together (still two normal passengers — v1-safe).
- **Grump personalities:** give ordinary guests a hidden `patMul` drawn from 0.85–1.15 so identical-looking crowds stop feeling identical. Cheap, invisible, effective.

**v2 (needs new mechanics):**
- **Elderly guests:** cane pixel + `#e8e4da` hair, board/exit at 1.0 s instead of 0.45 s, but `patMul:0.5` — slow but serene. Needs per-passenger transfer time.
- **Kids, mechanically:** two kids share one capacity slot. Needs fractional capacity.
- **Porters with luggage carts:** take 2 slots, tip 2×. Needs multi-slot capacity (shares machinery with Salesman/Bootlegger v2 hooks).

---

## Tuning appendix (suggested starting numbers)

| Character | patMul | tipMul | spawnRule | relative weight in tier |
|---|---|---|---|---|
| Freddie the Bellhop | 0.8 | 0.6 | cross | 3 |
| Dot Whitmore | 1.15 | 1.3 | top2 | 2 |
| Herb Gundy | 0.7 | 0.7 | nextfloor | 2 |
| Chef Aubertin | 1.5 | 1.6 | floor1↔upper | 2 |
| Amelia Vane | 0.85 | 1.5 | lobby→top | 2 |
| Madame Zora | 0.6 | 1.2 | →floor 13 | 1 |
| Sam Flint | 0.75 | 1.0 | shadow last waiter | 2 |
| Lou Marchetti | 1.3 | 2.0 | floor2→high | 1 |
| Prof. Thistlewood | 0.55 | 1.1 | reroll @10s | 2 |
| La Farfalla | 2.0 | 3.0 | lobby↔top3 | 2 |
| King Oliver Boone | 0.7 | 1.8 | gig clock | 2 |
| Henrietta Van Der Rill | 1.2 | 2.2 | busiest floor | 2 |
| The Colonel | 0.4 | 1.0 | ≥6-floor haul | 2 |
| ★ Gloria Delacroix | 1.6 | 4.0 | lobby→top | rare |
| ★ Il Magnifico | 1.4 | 2.5 | cross, no-strike | rare |
| ★ The Duchess & Bijou | 0.9 | 2.0 | 2–3 floor hops | rare |

Design intent per tier: Tier 1 teaches patterns, Tier 2 bends the routing rules,
Tier 3 raises the stakes, Celebrities are jackpots. Net expected tips rise with tower
height — matching the existing difficulty curve (`diff` grows with deliveries) so the
late game gets harder *and* more lucrative *and* better dressed, all at once.
