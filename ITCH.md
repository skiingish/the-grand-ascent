# itch.io Release Kit — The Grand Ascent

Everything to fill in at itch.io → Dashboard → Create new project.

---

## Project settings

| Field | Value |
|---|---|
| Title | **The Grand Ascent** |
| Project URL | `grand-ascent` (i.e. skiingish.itch.io/grand-ascent) |
| Short description / tagline | *You are the lift. The lift is you. A 1920s hotel lift-operator arcade game.* |
| Classification | Game |
| Kind of project | **HTML** |
| Release status | Released (or "In development" if you want feedback framing) |
| Pricing | **$0 or donate** — best discovery for a first release; you can add a suggested $2 |
| Uploads | `dist/grand-ascent.zip` — tick **"This file will be played in the browser"** |
| Embed options | Viewport **1010 × 720**, tick **Mobile friendly OFF** (keyboard needed for MANUAL), tick **Fullscreen button ON**, **Automatically start on page load** is fine |
| Genre | Action |
| Tags (max 10) | `arcade`, `pixel-art`, `retro`, `1920s`, `score-attack`, `management`, `difficult`, `2d`, `singleplayer`, `mouse-only` (AUTO mode justifies it) |
| Input methods | Keyboard, Mouse |
| Average session | A few minutes |
| Multiplayer | No |
| Community | Comments enabled |

## Art assets you need to capture

- **Cover image (required): 630 × 500** — strongest candidate: the building cross-section
  at dusk with a busy lobby queue and the brass dial visible, title lettering over the top.
  Capture at 2× and crop. (The title screen also works but gameplay covers convert better.)
- **Screenshots (3–5), any size, PNG:**
  1. Mid-run chaos: full car, grumpy queue, steam coming off someone's head
  2. The upgrade draft screen (shows the roguelite hook)
  3. The Blind Tiger speakeasy with a queue outside (shows the underworld)
  4. A celebrity arrival (Gloria's sparkles / the Duchess with Bijou)
  5. Title screen (shows the modes)
- **GIF (optional but high-converting):** 10–15 s of driving the lift, nailing a Silk Stop,
  gate slam, coin ding. Use ScreenToGif (free, Windows) at the game's native crispness.
- Tip: press **F11** in the browser + use the DEV level (you know the word) to stage
  perfect screenshots — spawn wacky guests with M, set upgrades with U.

---

## Page description (paste into itch's rich-text editor)

**THE GRAND ASCENT**

*New York, 1926. The Hotel Meridian needs a lift operator. The last one walked out. You'll find out why.*

You work the brass lever of a hotel lift with real momentum — ease it flush with the
floor, throw the gate, and get the guests where they're going before they boil over.
Three walk-outs and the management lets you go.

**THE LIFT IS THE GAME**
- Real momentum: accelerate, coast, brake. Overshoot and you'll fumble the stop while
  the queue steams.
- A perfect first-touch stop is a **SILK STOP** — faster boarding, bigger tips.
- Work the gate yourself. Slam it in someone's face if you must. They'll remember.

**THE TOWER GROWS**
- Every eight deliveries opens a new floor — and the manager offers you one of two
  improvements: a faster winch, a wider car, a gramophone to soothe the passengers,
  a floor magnet, a lobby bellboy...
- The taller the tower, the stranger the guests: flappers, aviatrixes, séance mediums
  bound for floor 13, bootleggers with suspiciously heavy crates, and the occasional
  moving-picture star with a tip to match.
- Sometimes, something opens *below* the street. The laundry down there is a front.
  Basement fares pay hush money.

**TWO WAYS TO PLAY**
- **MANUAL** — arrows or scroll wheel drive the lever, Space works the gate. The purist's game.
- **AUTO** — click a floor, the car drives itself. Pure routing. Mouse only.

**1920s tips in good honest coin.** A nickel from a sour guest. A quarter from a
delighted one. A crisp dollar from a star. How much can you earn before your shift ends?

*One HTML file. No installs. Keyboard + mouse, or mouse alone.*

---

## Launch checklist

- [ ] Play a full run on the GitHub Pages build (same artifact itch serves)
- [ ] Re-zip if any last fixes: `Compress-Archive -Force -Path index.html -DestinationPath dist/grand-ascent.zip`
- [ ] Capture cover 630×500 + 3–5 screenshots (+ GIF if possible)
- [ ] Create project with settings table above, upload zip, tick browser-play
- [ ] Test the itch embed in an incognito window (fonts, scaling, scroll wheel not
      scrolling the page — the game preventDefaults, but verify inside the iframe)
- [ ] Set price $0-or-donate, publish as Public
- [ ] Add the itch link to the GitHub repo homepage/README
- [ ] Optional first devlog post: "How a bot played 4,000 shifts to tune the difficulty"
      (PLAYTEST.md is basically already this post)
