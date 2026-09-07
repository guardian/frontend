# Game Page (Play/Scala side) — Implementation Plan

## Objective
Build new, isolated Play/Scala routes and a controller in `frontend` that serve individual
"Game Page" content — a generalization of today's crossword article page to ALL Guardian
puzzle/game types (sudoku, word games, trivia/quizzes, etc.) — by POSTing to a NEW `/GamePage`
endpoint on dotcom-rendering (DCR). This is entirely additive: it must not touch, modify, or
risk breaking any existing `/crosswords/*` route or controller.

> **Changelog:** these routes were originally gated behind this repo's server-side AB test
> framework (`game-page-experiment` / `variant`) so they'd be invisible to the public in
> production. That gate was **removed** at the user's explicit request, since the routes are
> expected to be mapped/exposed via a separate project instead, and the gate was only adding
> friction to local testing. See "Phase 1b" below.

## Context (condensed)
- Today, `/crosswords/{type}/{id}` is served by `CrosswordPageController.crossword` in
  `applications/app/controllers/CrosswordsController.scala`, which fetches CAPI content and remote
  renders via DCR's `/Article` endpoint (`DotcomRenderingService.getCrossword`).
- 12 real live puzzle/game slugs across 4 groups:
  - **Crosswords** (CAPI-backed, content type `crossword`): mini, quick, cryptic, quick-cryptic,
    sunday-quick, prize, everyman, azed, special, genius, speedy, weekend — modelled under ONE game
    slug `"crossword"`.
  - **Logic puzzles** (static AmuseLabs iframes, no CAPI): sudoku-easy, sudoku-medium, sudoku-hard,
    sudoku-killer, futoshiki, suguru.
  - **Word games** (AmuseLabs iframes + bespoke): word-wheel, codeword, wordiply.
  - **Quizzes and Trivia** (bespoke iframes): on-the-ball, film-reveal.
  - DCR owns all structural/rendering config (iframe URLs, flags) via its own static registry keyed
    by `slug`. Frontend only sends `slug` + best-effort `instance` data.

## Contract with DCR (fixed, do not deviate)
`POST /GamePage` with body:
```
{
  id, slug, webTitle, config, nav, pageFooter, canonicalUrl, editionId,
  instance: {
    title, puzzleType?, setterName?, date?, specialInstructions?,
    discussionId?, crosswordData?, moreFromPuzzlesAndGames?: []
  }
}
```
`crosswordData`/`discussionId` only populated when `slug == "crossword"`.

## Plan (multi-phase)

### Phase 1 — this session (frontend/Play repo, THIS PHASE ONLY)
1. `docs/puzzles-game-page-plan.md` (this file, committed to the repo) — objective/context/plan/
   progress tracker, kept up to date, with exact manual validation steps as the final update.
2. `DotcomRenderingService.getGamePage(ws, json)(implicit request): Future[Result]` — mirrors
   `getPuzzlesPage` exactly (POST to `articleBaseURL + "/GamePage"`, `CacheTime.Default`). Existing
   `getArticle`/`getCrossword`/`getPuzzlesPage` methods untouched.
3. `common/app/model/dotcomrendering/DotcomGamePageRenderingDataModel.scala` — new case classes
   (`DotcomGamePageRenderingDataModel`, `GamePageInstance`, `MoreFromPuzzlesAndGamesItem`) reusing
   existing `Nav`, `PageFooter`, `DotcomRenderingConfig`, `CanonicalLink`, `CrosswordData` (already
   has a `Writes`) — mirrors `DotcomPuzzlesPageRenderingDataModel.scala` conventions.
4. `applications/app/controllers/GamePageController.scala` — new controller with
   `renderGame(slug: String)`:
   - `slug == "crossword"`: reuses `CrosswordController.withCrossword`-style CAPI fetch (via a small
     shared/reused helper, NOT by modifying `CrosswordsController`) to get a real example crossword,
     populates `instance.crosswordData` (from `CrosswordData.fromCrossword`) and `discussionId`.
   - other 11 slugs: static reasonable `instance.title` (e.g. "Sudoku (easy)"), no CAPI fetch.
   - Calls `remoteRenderer.getGamePage(...)` and returns its result.
5. New routes block in `applications/conf/routes`, clearly separated/commented, physically apart
   from the `/crosswords/*` block; no existing route lines touched, reordered, or renumbered.
   `GET /puzzles/:slug` (+ `.json` debug variant).
6. Tests mirroring `PuzzlesPageControllerTest.scala` / `PuzzlesRoutesTest.scala` conventions +
   registration in `applications/test/package.scala`'s `ApplicationsTestSuite`. Run targeted sbt
   tests for the changed files only.
7. Explicitly NOT modified: `CrosswordsController.scala` (any class within it), any existing
   `/crosswords/*` route, `CrosswordSearchController`, `CrosswordEditionsController`,
   `IndexController`/catch-all route.
8. Final step: update this doc with exact manual validation steps (local dev server, DCR pointer,
   URLs to hit, expected behaviour).

### Phase 1b — this session, follow-up (frontend/Play repo)
Several fixes/adjustments made after initial local validation surfaced issues:
1. **scalafmt**: reformatted the files touched in phase 1 per the repo's scalafmt config (pre-push
   hook failure).
2. **Pre-existing, unrelated compile bug fixed**: `container.scala.html:30` had a ~10-year-old
   fruitless type test (`case _: model.MostPopular if isPaidFront => {}`, referencing the wrong
   `MostPopular`) that blocked all local `sbt compile`. Fixed to `case MostPopular if isPaidFront =>
   {}` in its own isolated commit, unrelated to the Game Page work. Confirmed present on `main` too.
3. **Query-param → path-segment fix**: the "crossword" slug originally took `crosswordType`/`id` as
   query params, which `DevParametersHttpRequestHandler` rejects outright in local dev (crash). Moved
   to dedicated path-segment routes/actions, mirroring the existing `/crosswords/{type}/{id}`
   convention: `GET /puzzles/crossword/:crosswordType/:id(.json)` → `renderCrossword`/
   `renderCrosswordJson`. `renderGame`/`renderGameJson(slug)` now only serve the 11 iframe slugs.
4. **dev-build routes mirror**: this repo's documented local dev workflow uses `project dev-build`,
   which has its own separate routes file (`dev-build/conf/routes`) that mirrors
   `applications/conf/routes` for existing crossword/puzzles routes - the new Game Page routes were
   only added to the latter. Mirrored the identical routes block into `dev-build/conf/routes` too (no
   DI changes needed, `dev-build` already mixes in `ApplicationsControllers`).
5. **AB-test gate removed** (this update): removed the `game-page-experiment` AB gate entirely from
   `GamePageController` (all four actions), deleted `common/app/ab/GamePageExperiment.scala`, and
   simplified tests/docs accordingly. No request header is needed for any Game Page route any more -
   `renderGame`/`renderGameJson`/`renderCrossword`/`renderCrosswordJson` always proceed to render for
   recognised slugs/crosswords. This was done at the user's explicit request: the routes are expected
   to be mapped/exposed via a separate project instead of via this repo's AB-test mechanism, and the
   gate was only adding friction (a manual header requirement) to local testing.

### Phase 2 — parallel session (dotcom-rendering repo, NOT this session's responsibility)
Implement `POST /GamePage` in DCR: static per-slug registry (iframe URLs, structural flags,
render mode selection), rendering component(s) for the crossword-real-content case and the
iframe-based cases, consuming the JSON contract above.

### Phase 3 — later (not this session)
Wire these routes into whatever separate project/mechanism will map/expose them, and do a full
prod-like validation pass before considering any public exposure. (No AB-test wiring needed any more
- see "Phase 1b" above.)

## Progress tracker
- [x] Confirmed on branch `afs/puzzles-game-page`, working tree was clean before starting.
- [x] `docs/puzzles-game-page-plan.md` committed.
- [x] `DotcomRenderingService.getGamePage` added.
- [x] `DotcomGamePageRenderingDataModel` added.
- [x] `GamePageController` added (crossword CAPI fetch + 11 static slugs).
- [x] Routes added in isolated, clearly-commented section (both `applications/conf/routes` and
      `dev-build/conf/routes`).
- [x] Tests added/passing (152/152 green via `applications/testOnly test.ApplicationsTestSuite`).
- [x] Existing crossword code/routes verified untouched (`git diff` review - only additive changes).
- [x] Pre-existing, unrelated compile bug fixed in its own isolated commit.
- [x] AB-test gate removed per explicit user request (Phase 1b, item 5).
- [x] Manual validation steps written up below.
- [x] Committed incrementally; reported back to creator session; STOP (no further phases).

## Manual validation steps

These assume you have this repo (`frontend`) and a checkout of `dotcom-rendering` (with its `/GamePage`
endpoint implemented by the parallel session) locally.

### 1. Point frontend's DCR calls at your local dotcom-rendering dev server

1. Start the DCR dev server from the `dotcom-rendering/dotcom-rendering` package as usual (see
   https://github.com/guardian/dotcom-rendering). By convention (same as for crosswords today) it serves
   on `http://localhost:3030`.
2. In `~/.gu/frontend.conf`, add/confirm a `devOverrides` block pointing frontend's article renderer at it
   (see `docs/03-dev-howtos/14-override-default-configuration.md` for the general mechanism):

   ```
   devOverrides {
     article-rendering.baseURL="http://localhost:3030"
   }
   ```

### 2. Start frontend's local dev server

1. In one terminal, run `sbt` then, at the sbt prompt, `project dev-build` and `run` (or `~run` to
   auto-reload). Per this repo's own install docs (`docs/01-start-here/01-installation-steps.md`), `dev-build`
   is the documented, complete local dev setup that emulates the whole site (as opposed to `project
   applications` on its own, which uses a separate, narrower `applications/conf/routes` file) - this phase's
   new Game Page routes are added to `dev-build/conf/routes` for that reason, mirrored identically from
   `applications/conf/routes`. This serves on `http://localhost:9000` as usual.
2. Confirm normal existing pages still work unaffected, e.g. `http://localhost:9000/crosswords/quick/17578`
   or `http://localhost:9000/crosswords/cryptic/26697` (real, known-good ids - a small/made-up id like `1`
   will correctly 404 since it doesn't exist in CAPI, which is not a regression) - this phase must not have
   changed this behaviour.

### 3. URLs to try

No special request header is needed any more (see the "Changelog" note at the top of this doc -
the previous `game-page-experiment` AB gate was removed):
- `http://localhost:9000/puzzles/crossword/cryptic/26697` - fetches a real example crossword from CAPI
  (`crosswordType`/`id` are path segments, exactly like the existing `/crosswords/{type}/{id}` routes -
  this id is already used by existing crossword tests, so it's known-good) and POSTs a `/GamePage` payload
  to DCR with `slug: "crossword"` and a populated `instance.crosswordData`/`instance.discussionId`. Expect
  DCR's rendered page (once its `/GamePage` handler exists).
- `http://localhost:9000/puzzles/sudoku-easy` - no CAPI fetch; POSTs a `/GamePage` payload with
  `slug: "sudoku-easy"` and only `instance.title = "Sudoku (easy)"`. Expect DCR's rendered iframe page.
- `http://localhost:9000/puzzles/crossword` (the bare slug, with no path segments) - expect `404`: the
  "crossword" slug is only served via the dedicated `renderCrossword`/`renderCrosswordJson` path-based
  actions above, not via `renderGame`.
- `http://localhost:9000/puzzles/not-a-real-slug` - expect `404` (unrecognised slug).
- Add `.json` to any of the above (e.g. `/puzzles/sudoku-easy.json`, `/puzzles/crossword/cryptic/26697.json`)
  to see the raw JSON payload frontend would send to DCR, without needing DCR itself to be running.

**Note:** `crosswordType`/`id` are deliberately path segments, not query params: in local dev,
`DevParametersHttpRequestHandler` (`common/app/dev/DevParametersHttpRequestHandler.scala`) hard-rejects any
query param name not on its allowlist with a `RuntimeException`, so `?crosswordType=...&id=...` would crash
locally (and wouldn't survive the CDN in prod either) - this mirrors exactly how the existing, untouched
`/crosswords/{type}/{id}` routes already take these as path segments.

### 4. Confirm existing crossword pages are unaffected

- `http://localhost:9000/crosswords/quick/17578` or `http://localhost:9000/crosswords/cryptic/26697` (no
  special header needed, as always) should behave exactly as before - this phase's routes are physically
  separate in `applications/conf/routes`/`dev-build/conf/routes` and `CrosswordsController.scala`/
  `CrosswordPageController` were not modified.
