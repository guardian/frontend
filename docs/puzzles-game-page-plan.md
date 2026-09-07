# Game Page (Play/Scala side) — Implementation Plan

## Objective
Build new, isolated Play/Scala routes and a controller in `frontend` that serve individual
"Game Page" content — a generalization of today's crossword article page to ALL Guardian
puzzle/game types (sudoku, word games, trivia/quizzes, etc.) — by POSTing to a NEW `/GamePage`
endpoint on dotcom-rendering (DCR). This is entirely additive: it must not touch, modify, or
risk breaking any existing `/crosswords/*` route or controller. The new pages are gated behind
this repo's existing server-side AB test framework (`game-page-experiment` / `variant`) so they
are invisible to the public in production.

## Context (condensed)
- Today, `/crosswords/{type}/{id}` is served by `CrosswordPageController.crossword` in
  `applications/app/controllers/CrosswordsController.scala`, which fetches CAPI content and remote
  renders via DCR's `/Article` endpoint (`DotcomRenderingService.getCrossword`).
- This repo has a real production server-side AB test framework: `common/app/ab/ABTests.scala`
  (`ABTests.getParticipations`, `ABTests.isUserInTestGroup`), fed by the `X-GU-Server-AB-Tests`
  request header. `PuzzlesHubExperiment` (`common/app/ab/PuzzlesHubExperiment.scala`) and
  `PuzzlesPageController` (`applications/app/controllers/PuzzlesPageController.scala`) already show
  the exact pattern to mirror: gate an action behind `ABTests.isUserInTestGroup(name, "variant")`,
  return 404 if not participating, otherwise assemble a JSON data model and POST it to DCR via a new
  `DotcomRenderingService` method (`getPuzzlesPage` → mirrored here as `getGamePage`).
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
   - 404 immediately (no rendering attempted) unless
     `ABTests.isUserInTestGroup("game-page-experiment", "variant")(request)`.
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
   AB test header, URLs to hit, expected behaviour with/without the header).

### Phase 2 — parallel session (dotcom-rendering repo, NOT this session's responsibility)
Implement `POST /GamePage` in DCR: static per-slug registry (iframe URLs, structural flags,
render mode selection), rendering component(s) for the crossword-real-content case and the
iframe-based cases, consuming the JSON contract above.

### Phase 3 — later (not this session)
Wire the real `game-page-experiment` AB test into whatever mechanism assigns real users/edge rules
(Fastly), remove any temporary local-only conveniences, and do a full prod-like validation pass
before considering any public exposure.

## Progress tracker
- [x] Confirmed on branch `afs/puzzles-game-page`, working tree was clean before starting.
- [x] `docs/puzzles-game-page-plan.md` committed.
- [x] `DotcomRenderingService.getGamePage` added.
- [x] `DotcomGamePageRenderingDataModel` added.
- [x] `GamePageController` added (AB-gated, crossword CAPI fetch + 11 static slugs).
- [x] Routes added in isolated, clearly-commented section.
- [x] Tests added/passing (148/148 green via `applications/testOnly test.ApplicationsTestSuite`).
- [x] Existing crossword code/routes verified untouched (`git diff` review - only additive changes).
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

1. In one terminal, run `sbt` then, at the sbt prompt, `project applications` and `run` (or `~run` to
   auto-reload). This serves on `http://localhost:9000` as usual.
2. Confirm normal existing pages still work unaffected, e.g. `http://localhost:9000/crosswords/quick/1` -
   this phase must not have changed this behaviour.

### 3. Satisfy the AB test gate

Without the header below, every `/puzzles/:slug` URL introduced in this phase returns `404 Not Found`
before any CAPI fetch or DCR call is attempted - this is the "invisible to the public" mechanism. To pass
the gate locally, add the request header:

```
X-GU-Server-AB-Tests: game-page-experiment:variant
```

- **curl**: `curl -H "X-GU-Server-AB-Tests: game-page-experiment:variant" http://localhost:9000/puzzles/sudoku-easy`
- **Browser**: use an extension that lets you set a static request header for `localhost:9000` (e.g.
  "ModHeader" or similar), set `X-GU-Server-AB-Tests` to `game-page-experiment:variant`, then browse
  normally.

### 4. URLs to try

With the header present:
- `http://localhost:9000/puzzles/crossword?crosswordType=cryptic&id=26697` - fetches a real example
  crossword from CAPI (this id is already used by existing crossword tests, so it's known-good) and POSTs
  a `/GamePage` payload to DCR with `slug: "crossword"` and a populated `instance.crosswordData`/
  `instance.discussionId`. Expect DCR's rendered page (once its `/GamePage` handler exists).
- `http://localhost:9000/puzzles/sudoku-easy` - no CAPI fetch; POSTs a `/GamePage` payload with
  `slug: "sudoku-easy"` and only `instance.title = "Sudoku (easy)"`. Expect DCR's rendered iframe page.
- `http://localhost:9000/puzzles/crossword` (no `crosswordType`/`id` query params) - expect `404`, since
  this phase requires an explicit crossword to fetch (see `GamePageController.renderCrosswordGamePage`).
- `http://localhost:9000/puzzles/not-a-real-slug` - expect `404` (unrecognised slug).
- Add `.json` to any of the above (e.g. `/puzzles/sudoku-easy.json`) to see the raw JSON payload frontend
  would send to DCR, without needing DCR itself to be running.

Without the header (or with an unrelated/absent AB test participation):
- Every one of the URLs above returns `404 Not Found`, and neither CAPI nor DCR is called (verified by the
  `GamePageControllerTest` gating cases, which assert `verifyNoInteractions` on a mocked
  `DotcomRenderingService`).

### 5. Confirm existing crossword pages are unaffected

- `http://localhost:9000/crosswords/quick/1` (no special header needed) should behave exactly as before -
  this phase's routes are physically separate in `applications/conf/routes` and
  `CrosswordsController.scala`/`CrosswordPageController` were not modified.
