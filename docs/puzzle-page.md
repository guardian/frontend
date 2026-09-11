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

### Public URL structure: `/puzzles-and-games`

Per the client's confirmed content-mapping decision, the public URLs are:

- Hub: `https://www.theguardian.com/puzzles-and-games/`
- Sudoku (nested - puzzle type + variant): `https://www.theguardian.com/puzzles-and-games/sudoku/easy`,
  `.../sudoku/medium`, `.../sudoku/hard`, `.../sudoku/killer`
- Word wheel (flat): `https://www.theguardian.com/puzzles-and-games/word-wheel`
- Wordiply (flat): `https://www.theguardian.com/puzzles-and-games/wordiply`

There is deliberately **no group prefix** (no `/logic-puzzles` or `/word-games` segment before the
puzzle name) - confirmed by explicit user decision. Crosswords keep their existing, separate
`/crosswords/...` URLs, unaffected by this structure.

Because the public URL for Sudoku is nested, this repo's internal naming matches that shape too -
Sudoku is represented as a puzzle type + variant pair throughout (`PuzzlesPageController.renderSudoku`/
`renderSudokuJson`, taking a `variant` parameter), not as a single flattened `"sudoku-easy"`-style
slug used only for internal bookkeeping. Only the `slug` value actually sent to DCR is flattened back
to `sudoku-<variant>` (e.g. `"sudoku-easy"`), since that's the key DCR's own registry still expects.

### Current scope (V0): 6 puzzles

Matching DCR's own V0 registry:

| Public URL | Internal representation | `slug` sent to DCR | Title sent to DCR |
|---|---|---|---|
| `/puzzles-and-games/sudoku/easy` | `renderSudoku("easy")` | `sudoku-easy` | Sudoku (easy) |
| `/puzzles-and-games/sudoku/medium` | `renderSudoku("medium")` | `sudoku-medium` | Sudoku (medium) |
| `/puzzles-and-games/sudoku/hard` | `renderSudoku("hard")` | `sudoku-hard` | Sudoku (hard) |
| `/puzzles-and-games/sudoku/killer` | `renderSudoku("killer")` | `sudoku-killer` | Killer sudoku |
| `/puzzles-and-games/word-wheel` | `renderPuzzlePage("word-wheel")` | `word-wheel` | Word wheel |
| `/puzzles-and-games/wordiply` | `renderPuzzlePage("wordiply")` | `wordiply` | Wordiply |

For all six, this repo sends **only a static placeholder title** (plus the puzzle date - see
below) - there is no real per-instance content sourcing on the frontend side for any of these,
since the iframe itself always shows "today's" puzzle according to the third party's own logic.
Whatever DCR renders is driven entirely by its own static per-slug config (see "DCR's
`GameConfig`/`PuzzleConfig` registry" below) plus that placeholder title.

### Code

- `applications/app/controllers/PuzzlesPageController.scala`:
  - `renderSudoku(variant)`/`renderSudokuJson(variant)` - the nested Sudoku actions.
  - `renderPuzzlePage(slug)`/`renderPuzzlePageJson(slug)` - the flat word-wheel/wordiply actions.
  - `sudokuVariantTitles`/`flatPuzzleTitles` - the slug allowlists and title maps.
  - All four are deliberately named distinctly from this controller's other, pre-existing
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
  `# Puzzle Page` comment):
  ```
  GET /puzzles-and-games/sudoku/:variant       -> PuzzlesPageController.renderSudoku       (variant constrained to easy|medium|hard|killer)
  GET /puzzles-and-games/sudoku/:variant.json  -> PuzzlesPageController.renderSudokuJson
  GET /puzzles-and-games/:slug                 -> PuzzlesPageController.renderPuzzlePage
  GET /puzzles-and-games/:slug.json            -> PuzzlesPageController.renderPuzzlePageJson
  ```

### Access gate: reuses the existing Puzzles Hub AB test

All four Puzzle Page actions are gated behind `ab.PuzzlesHubExperiment` ("puzzles-new-hub"), the
same server-side AB test already used by this controller's `renderPuzzles`/`renderPuzzlesJson` hub
actions - no new/separate experiment was introduced for V0. Requests return `404` unless the request
carries the `X-GU-Server-AB-Tests: puzzles-new-hub:variant` header (via this repo's normal server-side
AB test framework, `common/app/ab/ABTests.scala`).

### The `?date=` parameter (prep for V1 calendar navigation)

All four Puzzle Page actions accept an optional `?date=YYYY-MM-DD` query parameter, defaulting to
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
a new **flat** iframe-based slug (like word-wheel/wordiply) on the **frontend side**:

1. Add the slug to `PuzzlesPageController.flatPuzzleTitles`, mapping it to a human-readable title.
   This is currently the *only* thing that determines whether `renderPuzzlePage`/
   `renderPuzzlePageJson` will serve that slug at all - anything not in this map 404s.
2. Coordinate with the DCR side to add a matching entry to DCR's `PuzzleConfig` registry for the same
   slug - this repo's change alone does nothing without a corresponding DCR-side registry entry.
3. No routes changes are needed - `GET /puzzles-and-games/:slug(.json)` already matches any slug
   string.

A new **nested** puzzle type (like Sudoku's variants) would instead need its own dedicated action(s)
and route(s) taking the appropriate path segments, mirroring `renderSudoku`/`renderSudokuJson` -
this repo's internal naming/routes should always match the public URL shape, not be flattened
internally just because that's simpler.

Puzzle Page is scoped to iframe-based puzzles with no real per-instance content by design - a puzzle
type that needs real per-instance content fetched from somewhere is a larger change to discuss and
design explicitly, not something to bolt onto this flow unilaterally.

### Local testing

Both servers must be running to see real HTML: DCR locally on `http://localhost:3030` (`make dev` in
the `dotcom-rendering` repo), and this repo on `http://localhost:9000` via `sbt` -> `project
dev-build` -> `run`, with `article-rendering.baseURL` pointed at `http://localhost:3030` (see
`docs/03-dev-howtos/14-override-default-configuration.md` for the `devOverrides` mechanism, and
`docs/01-start-here/01-installation-steps.md` for the `dev-build` local dev setup).

**The AB-test header is required again** (see "Access gate" above) - without
`X-GU-Server-AB-Tests: puzzles-new-hub:variant`, every URL below 404s. Set it via a browser extension
(e.g. ModHeader) or `curl -H "X-GU-Server-AB-Tests: puzzles-new-hub:variant" ...`.

The `.json` route variant returns the exact JSON payload this repo would send to DCR, without
needing DCR itself to be reachable.

| Puzzle | URL |
|---|---|
| Sudoku (easy) | `http://localhost:9000/puzzles-and-games/sudoku/easy` |
| Sudoku (medium) | `http://localhost:9000/puzzles-and-games/sudoku/medium` |
| Sudoku (hard) | `http://localhost:9000/puzzles-and-games/sudoku/hard` |
| Killer sudoku | `http://localhost:9000/puzzles-and-games/sudoku/killer` |
| Word wheel | `http://localhost:9000/puzzles-and-games/word-wheel` |
| Wordiply | `http://localhost:9000/puzzles-and-games/wordiply` |

Append `?date=2024-01-15` (or similar) to any of the above to see a non-default `puzzleDate` value
in the JSON payload.

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
| `canonicalUrl` | string | The canonical URL for this page. |
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
- **Routes will likely move.** These routes are expected to eventually be mapped/exposed via a
  different project rather than living here long-term.
- **Deeper technical open items (AmuseLabs archive URLs, the user-id/postMessage mechanism, etc.)
  are tracked on the DCR side**, in that repo's own equivalent consolidated Puzzle Page doc, not
  duplicated here - check the `dotcom-rendering` repo for the current location of that document.
