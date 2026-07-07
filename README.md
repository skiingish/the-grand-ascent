# The Grand Ascent

*You are the lift. The lift is you.* A 1920s Art-Deco lift-operator arcade game —
one self-contained HTML file, no build step, no dependencies.

Deliver guests before they boil over. Three walk-outs and the management lets you go.
Happy guests tip in good honest coin; deliveries open new floors, each adding one
improvement of your choosing. The taller the tower, the stranger the guests — and
sometimes something opens *below* the street.

## Play

Open `index.html` in a browser, or serve it: `node tools/serve.js` (prints local + LAN URLs).

- **MANUAL**: arrow keys or scroll wheel drive the lever (momentum is the game), Space works the gate
- **AUTO**: click a floor — the car does the driving; pure routing
- Esc pauses. Every menu is clickable.

## Development

Enable the guard hook once per clone: `git config core.hooksPath tools` — it
blocks commits where `index.html` is stale or the smoke suite fails.

| File | What |
|---|---|
| `src/` | Game source: `template.html` + `js/*.js` modules (edit these) |
| `index.html` | GENERATED single-file build — `node tools/build.js` (see ARCHITECTURE.md) |
| `DESIGN.md` | Locked game design |
| `TUNING.md` | Every balance lever, targets, and the test loop |
| `CHARACTERS.md` | The 16-character cast design |
| `PLAYTEST.md` | Bot playtest findings that shaped the difficulty |
| `ROADMAP.md` | Parked work and ideas backlog |
| `tools/smoke.js` | logic regression suite (`node tools/smoke.js`) |
| `tools/playtest.js` | Human-like bot plays 4 skill levels (`node tools/playtest.js`) |
| `tools/serve.js` | Zero-dependency LAN server |

There is a hidden dev level for testing assets: type a certain three-letter word at
the title screen. N/M spawn guests, U edits upgrades, strikes are harmless.

## Releasing to itch.io

The game is a single file. Package it:

```powershell
Compress-Archive -Force -Path index.html -DestinationPath dist/grand-ascent.zip
```

Upload `dist/grand-ascent.zip` on itch.io as an HTML game, set `index.html` as the
entry point, viewport 1000×720 or "click to launch fullscreen". Fonts load from
Google Fonts when online and fall back gracefully offline.
