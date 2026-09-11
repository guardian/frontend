# Puzzle Page

## What is implemented

Puzzle Page is a generic page template for iframe-based Guardian puzzle types (sudoku and word
games), rendered by dotcom-rendering (DCR). This repo (`frontend`) assembles a small amount of
per-instance data (currently just a title and a puzzle date) and POSTs it to DCR's `/PuzzlePage`
endpoint; DCR owns all layout, styling, and structural/rendering behaviour, including the
third-party iframe URL for each puzzle.

**Crosswords are not part of Puzzle Page.** They remain entirely on their own, separate
`/crosswords/*` routes and controllers (`CrosswordsController.scala`, `CrosswordPageController`,
etc.), untouched by any of this. This is a deliberate product decision.

### Public URL structure: top-level, mirroring crosswords

Per confirmed direction, the individual puzzle-page URLs are **top-level** (no `/puzzles-and-games`
prefix), mirroring exactly how crosswords already work (`/crosswords/{type}/{id}`, also unprefixed).
Rationale: crosswords can't be restructured, so the other puzzle types follow the same top-level,
nested-by-type convention for consistency, anticipating what the business will likely confirm
formally later. **Only the hub page itself stays at `/puzzles-and-games`** - the individual
single-instance puzzle pages do not live under it:

- Hub (unchanged): `https://www.theguardian.com/puzzles-and-games/`
- Sudoku (nested - puzzle type + variant): `https://www.theguardian.com/sudoku/easy`,
  `.../sudoku/medium`, `.../sudoku/hard`, `.../sudoku/killer`
- Word wheel (flat): `https://www.theguardian.com/word-wheel`
- Wordiply (flat): `https://www.theguardian.com/wordiply`

There is deliberately **no group prefix** either (no `/logic-puzzles` or `/word-games` segment
before the puzzle name) - confirmed by explicit user decision. Crosswords keep their existing,
separate `/crosswords/...` URLs, unaffected by any of this.

Because the public URL for Sudoku is nested, this repo's internal naming matches that shape too -
Sudoku is represented as a puzzle type + variant pair throughout (`PuzzlesPageController.renderSudoku`/
`renderSudokuJson`, taking a `variant` parameter), not as a single flattened `"sudoku-easy"`-style
slug used only for internal bookkeeping. Only the `slug` value actually sent to DCR is flattened back
to `sudoku-<variant>` (e.g. `"sudoku-easy"`), since that's the key DCR's own registry still expects.

Word wheel and wordiply, being flat/single-segment puzzles, each get their own explicit, dedicated,
no-argument actions (`renderWordWheel`/`renderWordWheelJson`, `renderWordiply`/`renderWordiplyJson`)
rather than being served through one shared, generic "any slug" action - mirroring how the crossword
controller handles each crossword type explicitly via its own constrained route, rather than a single
generic slug action. Play routing isn't well suited to a single generic action once URLs diverge
structurally by game, exactly the same reason crosswords use a constrained `$crosswordType<...>`
pattern instead of a generic type parameter.

### Current scope (V0): 6 puzzles

Matching DCR's own V0 registry:

| Public URL | Controller action | `slug` sent to DCR | Title sent to DCR |
|---|---|---|---|
| `/sudoku/easy` | `renderSudoku("easy")` | `sudoku-easy` | Sudoku (easy) |
| `/sudoku/medium` | `renderSudoku("medium")` | `sudoku-medium` | Sudoku (medium) |
| `/sudoku/hard` | `renderSudoku("hard")` | `sudoku-hard` | Sudoku (hard) |
| `/sudoku/killer` | `renderSudoku("killer")` | `sudoku-killer` | Killer sudoku |
| `/word-wheel` | `renderWordWheel()` | `word-wheel` | Word wheel |
| `/wordiply` | `renderWordiply()` | `wordiply` | Wordiply |

For all six, this repo sends **only a static placeholder title** (plus the puzzle date - see
below) - there is no real per-instance content sourcing on the frontend side for any of these,
since the iframe itself always shows "today's" puzzle according to the third party's own logic.
Whatever DCR renders is driven entirely by its own static per-slug config (see "DCR's
`PuzzleConfig` registry" below) plus that placeholder title.

### Code

- `applications/app/controllers/PuzzlesPageController.scala`:
  - `renderSudoku(variant)`/`renderSudokuJson(variant)` - the nested Sudoku actions, backed by
    `sudokuVariantTitles` (variant -> title map).
  - `renderWordWheel()`/`renderWordWheelJson()` - dedicated word wheel actions, hardcoding
    `WordWheelSlug`/`WordWheelTitle` internally.
  - `renderWordiply()`/`renderWordiplyJson()` - dedicated wordiply actions, hardcoding
    `WordiplySlug`/`WordiplyTitle` internally.
  - All six are deliberately named distinctly from this controller's other, pre-existing
    `renderPuzzles()`/`renderPuzzlesJson()` actions, which serve the unrelated Puzzles Hub/listing
    page.
- `common/app/model/dotcomrendering/DotcomPuzzlePageRenderingDataModel.scala` -
  `DotcomPuzzlePageRenderingDataModel`/`PuzzlePageInstance`, the JSON contract sent to DCR (see field
  reference below).
- `common/app/renderers/DotcomRenderingService.scala` - `getPuzzlePage` POSTs to
  `<articleBaseURL>/PuzzlePage`.
- `common/app/staticpages/StaticPages.scala` - `dcrSimplePuzzlePage` builds the minimal `SimplePage`
  metadata used for each instance.
- Routes (identical in `applications/conf/routes` and `dev-build/conf/routes`, under the
  `# Puzzle Page` comment, positioned right after the crossword routes and well ahead of the
  generic `IndexController` catch-all further down the file - Play resolves routes in file order,
  so this positioning is required for these paths to not fall through to the tag/section catch-all,
  exactly like `/crosswords/*` already relies on):
  ```
  GET /sudoku/:variant       -> PuzzlesPageController.renderSudoku       (variant constrained to easy|medium|hard|killer)
  GET /sudoku/:variant.json  -> PuzzlesPageController.renderSudokuJson
  GET /word-wheel            -> PuzzlesPageController.renderWordWheel
  GET /word-wheel.json       -> PuzzlesPageController.renderWordWheelJson
  GET /wordiply              -> PuzzlesPageController.renderWordiply
  GET /wordiply.json         -> PuzzlesPageController.renderWordiplyJson
  ```

### Access gate: reuses the existing Puzzles Hub AB test

All six Puzzle Page actions are gated behind `ab.PuzzlesHubExperiment` ("puzzles-new-hub"), the
same server-side AB test already used by this controller's `renderPuzzles`/`renderPuzzlesJson` hub
actions - no new/separate experiment was introduced for V0. Requests return `404` unless the request
carries the `X-GU-Server-AB-Tests: puzzles-new-hub:variant` header (via this repo's normal server-side
AB test framework, `common/app/ab/ABTests.scala`).

### The `?date=` parameter (prep for V1 calendar navigation)

All six Puzzle Page actions accept an optional `?date=YYYY-MM-DD` query parameter, defaulting to
today's date (ISO 8601) when absent. This is forwarded to DCR as `instance.puzzleDate`. For V0 this
is pure plumbing: no calendar UI exists yet, and DCR does not act on this value - it's preparation
for a V1 feature where users navigate from a calendar to a specific past date's puzzle rather than
always seeing "today's". The query param is intentionally *not* a path segment, so it doesn't
disrupt the URL shapes above.

**Note:** `"date"` was added to `common/app/dev/DevParametersHttpRequestHandler`'s allowlist purely
so this query param doesn't trip the local-dev illegal-parameter guard - actual CDN/Fastly passthrough
for this parameter in production is a separate, not-yet-done follow-up.

### How to configure/add a new puzzle type

All per-slug *structural* configuration (iframe URL, render mode, which UI chrome is enabled) lives
in DCR's `PuzzleConfig` registry, not in this repo - this repo does not duplicate that data. To onboard
a new **flat** (single-segment) iframe-based puzzle (like word-wheel/wordiply) on the **frontend
side**:

1. Add a dedicated, no-argument action pair (`renderX`/`renderXJson`) to `PuzzlesPageController`,
   hardcoding the new puzzle's slug and title as constants (mirroring `renderWordWheel`/
   `renderWordiply`) - do not add it to a shared generic map/action, since Play routing (and this
   repo's convention here) treats each top-level puzzle as its own explicit route/action, exactly
   like each crossword type.
2. Add the corresponding route(s) to both `applications/conf/routes` and `dev-build/conf/routes`,
   in the same position as the existing Puzzle Page routes (before the generic catch-all).
3. Coordinate with the DCR side to add a matching entry to DCR's `PuzzleConfig` registry for the same
   slug - this repo's change alone does nothing without a corresponding DCR-side registry entry.

A new **nested** puzzle type (like Sudoku's variants) would instead need its own dedicated action(s)
taking the appropriate path segment(s), mirroring `renderSudoku`/`renderSudokuJson` - this repo's
internal naming/routes should always match the public URL shape, not be flattened internally just
because that's simpler.

Puzzle Page is scoped to iframe-based puzzles with no real per-instance content by design - a puzzle
type that needs real per-instance content fetched from somewhere is a larger change to discuss and
design explicitly, not something to bolt onto this flow unilaterally.

### Local testing

Both servers must be running to see real HTML: DCR locally on `http://localhost:3030` (`make dev` in
the `dotcom-rendering` repo), and this repo on `http://localhost:9000` via `sbt` -> `project
dev-build` -> `run`, with `article-rendering.baseURL` pointed at `http://localhost:3030` (see
`docs/03-dev-howtos/14-override-default-configuration.md` for the `devOverrides` mechanism, and
`docs/01-start-here/01-installation-steps.md` for the `dev-build` local dev setup).

**The AB-test header is required** (see "Access gate" above) - without
`X-GU-Server-AB-Tests: puzzles-new-hub:variant`, every URL below 404s. Set it via a browser extension
(e.g. ModHeader) or `curl -H "X-GU-Server-AB-Tests: puzzles-new-hub:variant" ...`.

The `.json` route variant returns the exact JSON payload this repo would send to DCR, without
needing DCR itself to be reachable.

| Puzzle | URL |
|---|---|
| Sudoku (easy) | `http://localhost:9000/sudoku/easy` |
| Sudoku (medium) | `http://localhost:9000/sudoku/medium` |
| Sudoku (hard) | `http://localhost:9000/sudoku/hard` |
| Killer sudoku | `http://localhost:9000/sudoku/killer` |
| Word wheel | `http://localhost:9000/word-wheel` |
| Wordiply | `http://localhost:9000/wordiply` |

The hub itself: `http://localhost:9000/puzzles-and-games`.

Append `?date=2024-01-15` (or similar) to any of the puzzle URLs above to see a non-default
`puzzleDate` value in the JSON payload.

### The DCR endpoint contract

This repo POSTs the following to DCR's `/PuzzlePage` endpoint:

| Field | Type | Meaning |
|---|---|---|
| `id` | string | The page's canonical content id. Not Puzzle-Page-specific. |
| `slug` | string | The puzzle type identifier DCR uses to look up its own `PuzzleConfig` entry (e.g. `"sudoku-easy"`, `"word-wheel"`). Always the flattened form, even for Sudoku. |
| `webTitle` | string | The page's `<title>`/web title. |
| `config` | object | The same shared config JSON object sent to every other DCR endpoint this repo calls. Not Puzzle-Page-specific. |
| `nav` | object | The same shared navigation structure sent to other DCR endpoints. Not Puzzle-Page-specific. |
| `pageFooter` | object | The same shared footer links structure sent to other DCR endpoints. Not Puzzle-Page-specific. |
| `canonicalUrl` | string | The canonical URL for this page (e.g. `https://www.theguardian.com/sudoku/easy`, `https://www.theguardian.com/word-wheel`). |
| `editionId` | string | The edition (e.g. `UK`, `US`, `AU`) resolved from the request. |
| `instance` | object | Per-instance data - see below. |

`instance` fields (`PuzzlePageInstance`):

| Field | Type | Meaning |
|---|---|---|
| `title` | string | Display title for the instance (e.g. `"Sudoku (easy)"`). |
| `puzzleDate` | string, optional | An ISO-8601 (`yyyy-MM-dd`) date string - which day's puzzle this instance is for. Always populated (defaults to today via the `?date=` query param handling described above); modelled as optional for JSON forwards/backwards compatibility. Not yet acted on by DCR - V0 plumbing only. |
| `moreFromPuzzlesAndGames` | array | Best-effort "more like this" recommendations. Currently always an empty array - not populated anywhere yet. |

The crossword-flavoured fields that previously existed on this type (`puzzleType`, `setterName`,
`date`, `specialInstructions`, `discussionId`, `crosswordData`) have been removed entirely, as a
coordinated contract change with DCR's equivalent removal - they were never populated once Puzzle
Page's iframe-only scope was confirmed.

## Open questions / known limitations

- **Iframe-only by design.** Puzzle Page covers iframe-based puzzles only; crosswords are out of
  scope on product direction, not a gap to fill later.
- **No real per-instance content for any puzzle.** All 6 puzzles get a static placeholder title
  only.
- **`?date=` is plumbing only.** The value is accepted, defaulted, and forwarded to DCR, but nothing
  - on either side - actually uses it to fetch a different day's puzzle yet. No calendar UI exists.
  CDN/Fastly passthrough for this query param in production also hasn't been set up yet.
- **Top-level URL structure is not yet formally confirmed by the business.** It mirrors crosswords'
  existing, unchangeable URL shape for consistency and to anticipate the likely eventual decision -
  if the business decides differently, these routes/URLs will need to move again.
- **Deeper technical open items (AmuseLabs archive URLs, the user-id/postMessage mechanism, etc.)
  are tracked on the DCR side**, in that repo's own equivalent consolidated Puzzle Page doc, not
  duplicated here - check the `dotcom-rendering` repo for the current location of that document.
