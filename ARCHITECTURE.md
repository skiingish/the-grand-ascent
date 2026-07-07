# Architecture

## The shape of the project

```
src/
  template.html     page shell: CSS, header, canvas — with an /*INJECT:JS*/ marker
  js/NN-name.js     game source, concatenated in filename order
tools/
  build.js          src -> index.html   (node tools/build.js; --check verifies freshness)
  smoke.js          logic regression suite, runs against the BUILT index.html
  playtest.js       human-like bot, 4 skill rounds, also runs against the build
  serve.js          zero-dep LAN server
  build-mgr.js      generates the manager portrait grid (mirror + lighting passes)
  render-mgr.js     renders the portrait grid to PNG for review
index.html          GENERATED build artifact — committed on purpose (see below)
dist/               itch.io zip (gitignored)
```

**Edit `src/`, then `node tools/build.js`, then `node tools/smoke.js`.**
Never edit `index.html` directly — the banner at the top says the same.

## Why not Vite / a bundler?

Considered and rejected, deliberately:

1. **The deliverable is a single self-contained HTML file** (itch.io upload, GitHub
   Pages, "double-click to play"). A bundler's main outputs — module graphs, chunk
   splitting, HMR — all get flattened away by a single-file plugin anyway.
2. **Zero dependencies is a feature.** Every tool in this repo runs with bare Node.
   No node_modules, no lockfile churn, no supply chain, nothing to `npm install`
   before contributing.
3. **The globals-in-one-scope model fits the game.** Modules share state (G, ctx,
   palettes) by design; converting to ES module imports/exports would add ceremony
   without adding safety at this scale (~1,500 lines).
4. **Tests target the artifact.** smoke.js and playtest.js eval the built file —
   exactly what ships is exactly what's tested.

**When to revisit:** if the game ever needs an npm dependency, TypeScript, or more
than ~5k lines, migrate `src/js` to real ES modules under Vite +
`vite-plugin-singlefile`. The current split already matches module boundaries, so
that migration is mostly adding import/export lines.

## Why is the build artifact committed?

GitHub Pages serves the repo root with zero configuration, the itch zip is built
from it, and the test harnesses read it. Committing it keeps all three consumers
build-free. The cost (generated diffs in PRs) is controlled by
`node tools/build.js --check`, which fails if `index.html` is stale relative to src.

## Module order matters

Files concatenate in filename order into one script scope. Earlier files must not
call later ones at top level (function declarations hoist; `const` tables do not).
The numbering leaves gaps for insertion. Current order:

boot → palette → audio → state → upgrades → dev → passengers →
input+update → draw helpers → people → floors → shaft → backdrop → hud →
screens (title/intro/manager/pick/dev-menu) → loop
