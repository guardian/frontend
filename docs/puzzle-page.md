# Puzzle Page

## What is implemented

Puzzle Page is a generic page template for iframe-based Guardian puzzle types (sudoku and word
games), rendered by dotcom-rendering (DCR). This repo (`frontend`) assembles a small amount of
per-instance data (currently just a title and the puzzle date requested) and POSTs it to DCR's
`/PuzzlePage` endpoint; DCR owns all layout, styling, and structural/rendering behaviour, including
the third-party iframe URL for each puzzle.

**Crosswords are not part of Puzzle Page.** They remain entirely on their own, separate
`/crosswords/*` routes and controllers (`CrosswordsController.scala`, `CrosswordPageController`,
etc.), untouched by any of this. This is a deliberate product decision.

### Public URL structure: nested under the hub, grouped, and dated

Per confirmed team direction, individual puzzle-page URLs are nested under the `/puzzles-and-games`
hub, grouped by DCR's `puzzleGroup` ("logic-puzzles" or "word-games"), and always carry a real
`YYYY-MM-DD` date:

- Hub (unchanged): `https://www.theguardian.com/puzzles-and-games/`
- Sudoku: `https://www.theguardian.com/puzzles-and-games/logic-puzzles/sudoku-easy/2024-01-15`
  (and `sudoku-medium`, `sudoku-hard`, `sudoku-killer`)
- Word wheel: `https://www.theguardian.com/puzzles-and-games/word-games/word-wheel/2024-01-15`
- Wordiply: `https://www.theguardian.com/puzzles-and-games/word-games/wordiply/2024-01-15`

The **bare URL** for each game (no date segment, e.g.
`https://www.theguardian.com/puzzles-and-games/logic-puzzles/sudoku-easy`) is not itself a page -
it **redirects** (temporarily - see "Archive redirects" below) to that group's archive page, filtered
to this puzzle.

Each game's group segment (`logic-puzzles`/`word-games`) is a **literal, hardcoded path segment** on
that game's own dedicated route/action, matching its DCR `puzzleGroup` - not a generic `:group`
wildcard. This is a natural consequence of every game having its own explicit route/action (see
"Code" below), and avoids ever routing a request for a group a given game doesn't actually belong
to.

### Current scope (V0): 6 puzzles

Matching DCR's own V0 registry:

| Public URL (dated) | Controller action | `slug` sent to DCR | Title sent to DCR |
|---|---|---|---|
| `/puzzles-and-games/logic-puzzles/sudoku-easy/{date}` | `renderSudoku("easy", date)` | `sudoku-easy` | Sudoku (easy) |
| `/puzzles-and-games/logic-puzzles/sudoku-medium/{date}` | `renderSudoku("medium", date)` | `sudoku-medium` | Sudoku (medium) |
| `/puzzles-and-games/logic-puzzles/sudoku-hard/{date}` | `renderSudoku("hard", date)` | `sudoku-hard` | Sudoku (hard) |
| `/puzzles-and-games/logic-puzzles/sudoku-killer/{date}` | `renderSudoku("killer", date)` | `sudoku-killer` | Killer sudoku |
| `/puzzles-and-games/word-games/word-wheel/{date}` | `renderWordWheel(date)` | `word-wheel` | Word wheel |
| `/puzzles-and-games/word-games/wordiply/{date}` | `renderWordiply(date)` | `wordiply` | Wordiply |

For all six, this repo sends **only a static placeholder title plus the requested date** - there is
no real per-instance content sourcing on the frontend side for any of these, since the iframe itself
always shows the puzzle for that date according to the third party's own logic. Whatever DCR renders
is driven entirely by its own static per-slug config (see "DCR's `PuzzleConfig` registry" below)
plus that placeholder title and date.

### Code

- `applications/app/controllers/PuzzlesPageController.scala`:
  - `renderSudoku(variant, date)`/`renderSudokuJson(variant, date)` - the nested, dated Sudoku
    actions, backed by `sudokuVariantTitles` (variant -> title map).
  - `renderWordWheel(date)`/`renderWordWheelJson(date)` - dedicated word wheel actions, hardcoding
    `WordWheelSlug`/`WordWheelTitle` internally.
  - `renderWordiply(date)`/`renderWordiplyJson(date)` - dedicated wordiply actions, hardcoding
    `WordiplySlug`/`WordiplyTitle` internally.
  - `redirectSudokuArchive(variant)`, `redirectWordWheelArchive()`, `redirectWordiplyArchive()` - the
    bare (dateless) archive-redirect actions (see "Archive redirects" below).
  - All actions are deliberately named distinctly from this controller's other, pre-existing
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
  GET /puzzles-and-games/logic-puzzles/sudoku-:variant/:date       -> PuzzlesPageController.renderSudoku       (variant constrained to easy|medium|hard|killer, date constrained to \d{4}-\d{2}-\d{2})
  GET /puzzles-and-games/logic-puzzles/sudoku-:variant/:date.json  -> PuzzlesPageController.renderSudokuJson
  GET /puzzles-and-games/logic-puzzles/sudoku-:variant             -> PuzzlesPageController.redirectSudokuArchive

  GET /puzzles-and-games/word-games/word-wheel/:date       -> PuzzlesPageController.renderWordWheel
  GET /puzzles-and-games/word-games/word-wheel/:date.json  -> PuzzlesPageController.renderWordWheelJson
  GET /puzzles-and-games/word-games/word-wheel             -> PuzzlesPageController.redirectWordWheelArchive

  GET /puzzles-and-games/word-games/wordiply/:date       -> PuzzlesPageController.renderWordiply
  GET /puzzles-and-games/word-games/wordiply/:date.json  -> PuzzlesPageController.renderWordiplyJson
  GET /puzzles-and-games/word-games/wordiply             -> PuzzlesPageController.redirectWordiplyArchive
  ```

### Access gate: reuses the existing Puzzles Hub AB test

All Puzzle Page actions (dated render actions and archive redirects alike) are gated behind
`ab.PuzzlesHubExperiment` ("puzzles-new-hub"), the same server-side AB test already used by this
controller's `renderPuzzles`/`renderPuzzlesJson` hub actions - no new/separate experiment was
introduced for V0. Requests return `404` unless the request carries the
`X-GU-Server-AB-Tests: puzzles-new-hub:variant` header (via this repo's normal server-side AB test
framework, `common/app/ab/ABTests.scala`).

**Note for future v1/v2 work:** DCR uses a 3-tier, cumulative rollout gating structure for this
feature (`puzzles-new-hub` v0, `puzzles-new-hub-v1`, `puzzles-new-hub-v2`, defined in
`ab-testing/config/abTests.ts`, checked via `isPuzzlesHubEnabled`/`isPuzzlesHubV1Enabled`/
`isPuzzlesHubV2Enabled` in `src/lib/puzzlesHubExperiment.ts`/`puzzlesHubVersionExperiment.ts`), used
there to gate individual v1/v2-scoped features (currently the "More from Puzzles & Games" rail,
gated behind v1). This repo only checks the single v0 tier today, since no v1/v2-scoped feature
exists on the frontend side yet. Confirmed correct for now in product review, but when the first
v1-scoped frontend feature is built (e.g. the "sign in to track puzzles progress" message, full hub
sub-nav links, or calendar/archive views), this repo will need its own equivalent cumulative check,
mirroring DCR's `isPuzzlesHubV1Enabled`/`isPuzzlesHubV2Enabled` pattern, not just continue checking
the v0 gate alone.

### The date path segment

Every render action takes `date` as a real, always-present `yyyy-MM-dd` path segment, forwarded to
DCR as `instance.puzzleDate`. This supersedes an earlier `?date=` query-param mechanism (removed
entirely, along with the `java.time.LocalDate`-based "default to today" fallback) - the date is no
longer optional plumbing, it's a meaningful part of every puzzle-page URL, since users will navigate
here from a calendar for a specific day's puzzle.

**Format validation only.** The date's *shape* is validated at the route level via a
`$date<\d{4}-\d{2}-\d{2}>` constraint - a structurally malformed date (wrong number of digits, missing
dashes, etc.) fails to match the route and 404s before ever reaching the controller. **Deeper calendar
validity is intentionally not implemented** - e.g. `2024-02-30` (not a real date) or a future date
will still route through and render, since only the digit/dash shape is checked, not whether the date
is real or sensible. This is an accepted, known limitation for this task (see "Open questions" below).

### Archive redirects

The bare, dateless URL for each game (`redirectSudokuArchive`/`redirectWordWheelArchive`/
`redirectWordiplyArchive`) returns a **temporary (302/`FOUND`) redirect** to
`/puzzles-and-games/{group}/archive?puzzle={slug}` - e.g.
`/puzzles-and-games/logic-puzzles/archive?puzzle=sudoku-easy`. Per explicit product direction
("Redirect to the archive please. If it's possible for that to be filtered to that chip, even
better"), filtering is done via the `?puzzle=` query param.

**The archive page itself does not exist yet** (it's a V1 feature) - it's explicitly confirmed
acceptable for this redirect target to 404 downstream for now, until the archive is built. A
*temporary*, not permanent, redirect status is used deliberately, so browsers/CDNs don't cache a
redirect target that isn't ready yet.

### How to configure/add a new puzzle type

All per-slug *structural* configuration (iframe URL, render mode, which UI chrome is enabled) lives
in DCR's `PuzzleConfig` registry, not in this repo - this repo does not duplicate that data. To onboard
a new **flat** (single-segment identity) iframe-based puzzle (like word-wheel/wordiply) on the
**frontend side**:

1. Pick the right group segment (`logic-puzzles` or `word-games`, matching the new puzzle's DCR
   `puzzleGroup`) and add a dedicated action set (`renderX(date)`/`renderXJson(date)`/
   `redirectXArchive()`) to `PuzzlesPageController`, hardcoding the new puzzle's slug and title as
   constants (mirroring `renderWordWheel`/`renderWordiply`) - do not add it to a shared generic
   map/action, since Play routing (and this repo's convention here) treats each puzzle as its own
   explicit route/action, exactly like each crossword type.
2. Add the corresponding routes (dated, dated `.json`, and bare/redirect) to both
   `applications/conf/routes` and `dev-build/conf/routes`, in the same position as the existing
   Puzzle Page routes (before the generic catch-all), using the same `$date<\d{4}-\d{2}-\d{2}>`
   constraint on the dated routes.
3. Coordinate with the DCR side to add a matching entry to DCR's `PuzzleConfig` registry for the same
   slug and group - this repo's change alone does nothing without a corresponding DCR-side registry
   entry.

A new puzzle with a **variant-style identity** (like Sudoku's variants) would instead need its own
dedicated action(s) taking the appropriate additional path segment(s), mirroring
`renderSudoku`/`renderSudokuJson` - this repo's internal naming/routes should always match the
public URL shape, not be flattened internally just because that's simpler.

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

| Puzzle | Dated URL (example date `2024-01-15`) | Bare (archive-redirect) URL |
|---|---|---|
| Sudoku (easy) | `http://localhost:9000/puzzles-and-games/logic-puzzles/sudoku-easy/2024-01-15` | `http://localhost:9000/puzzles-and-games/logic-puzzles/sudoku-easy` |
| Sudoku (medium) | `http://localhost:9000/puzzles-and-games/logic-puzzles/sudoku-medium/2024-01-15` | `http://localhost:9000/puzzles-and-games/logic-puzzles/sudoku-medium` |
| Sudoku (hard) | `http://localhost:9000/puzzles-and-games/logic-puzzles/sudoku-hard/2024-01-15` | `http://localhost:9000/puzzles-and-games/logic-puzzles/sudoku-hard` |
| Killer sudoku | `http://localhost:9000/puzzles-and-games/logic-puzzles/sudoku-killer/2024-01-15` | `http://localhost:9000/puzzles-and-games/logic-puzzles/sudoku-killer` |
| Word wheel | `http://localhost:9000/puzzles-and-games/word-games/word-wheel/2024-01-15` | `http://localhost:9000/puzzles-and-games/word-games/word-wheel` |
| Wordiply | `http://localhost:9000/puzzles-and-games/word-games/wordiply/2024-01-15` | `http://localhost:9000/puzzles-and-games/word-games/wordiply` |

The hub itself: `http://localhost:9000/puzzles-and-games`.

The bare URLs will 302-redirect to a `.../archive?puzzle=...` URL that currently 404s (the archive
page doesn't exist yet - see "Archive redirects" above); this is expected.

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
| `canonicalUrl` | string | The canonical URL for this page (e.g. `https://www.theguardian.com/puzzles-and-games/logic-puzzles/sudoku-easy/2024-01-15`). |
| `editionId` | string | The edition (e.g. `UK`, `US`, `AU`) resolved from the request. |
| `instance` | object | Per-instance data - see below. |

`instance` fields (`PuzzlePageInstance`):

| Field | Type | Meaning |
|---|---|---|
| `title` | string | Display title for the instance (e.g. `"Sudoku (easy)"`). |
| `puzzleDate` | string, optional | An ISO-8601 (`yyyy-MM-dd`) date string, sourced directly from the request URL's date path segment (see "The date path segment" above) - which day's puzzle this instance is for. Always populated in practice; modelled as optional for JSON forwards/backwards compatibility. DCR is being updated in parallel (see cross-repo note below) to actually display this value and forward it to the iframe. |
| `moreFromPuzzlesAndGames` | array | Best-effort "more like this" recommendations. Currently always an empty array - not populated anywhere yet. |

The crossword-flavoured fields that previously existed on this type (`puzzleType`, `setterName`,
`date`, `specialInstructions`, `discussionId`, `crosswordData`) have been removed entirely, as a
coordinated contract change with DCR's equivalent removal - they were never populated once Puzzle
Page's iframe-only scope was confirmed.

**Cross-repo note:** DCR is being updated in parallel to actually display `instance.puzzleDate` next
to the puzzle title, and to include it in the `guardian-puzzle-context` sent to the iframe (alongside
the existing userId/darkMode). No contract/type changes were needed on this repo's side for that -
`puzzleDate` already existed on `PuzzlePageInstance`; this repo just now sources a real, always-present
value for it instead of a today-only default.

## Open questions / known limitations

- **Iframe-only by design.** Puzzle Page covers iframe-based puzzles only; crosswords are out of
  scope on product direction, not a gap to fill later.
- **No real per-instance content for any puzzle.** All 6 puzzles get a static placeholder title
  only.
- **Date format, not calendar validity, is checked.** A structurally well-formed but calendrically
  invalid date (e.g. `2024-02-30`) or a future date will still route through and render - only the
  `\d{4}-\d{2}-\d{2}` shape is enforced at the route level. Not implemented for this task; an
  accepted limitation.
- **The archive pages don't exist yet.** The bare, dateless URL for each game redirects to a
  `.../archive?puzzle=...` URL that 404s today - this is expected until the archive (a V1 feature)
  is built.
- **This URL structure is not yet formally confirmed by the business** in the sense of a final,
  permanent public commitment - it was arrived at through iterative confirmed decisions during
  development and may still evolve.
- **Deeper technical open items (AmuseLabs archive URLs, the user-id/postMessage mechanism, etc.)
  are tracked on the DCR side**, in that repo's own equivalent consolidated Puzzle Page doc, not
  duplicated here - check the `dotcom-rendering` repo for the current location of that document.
