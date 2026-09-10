# Puzzle Page

## What is implemented

Puzzle Page is a generic page template for iframe-based Guardian puzzle types (sudoku and word
games), rendered by dotcom-rendering (DCR). This repo (`frontend`) assembles a small amount of
per-instance data (currently just a title) and POSTs it to DCR's `/PuzzlePage` endpoint; DCR owns
all layout, styling, and structural/rendering behaviour, including the third-party iframe URL for
each puzzle.

**Crosswords are not part of Puzzle Page.** They remain entirely on their own, separate
`/crosswords/*` routes and controllers (`CrosswordsController.scala`, `CrosswordPageController`,
etc.), untouched by any of this. This is a deliberate product decision.

### Current scope (V0): 6 slugs

Matching DCR's own V0 registry, `PuzzlesPageController.puzzleSlugTitles` currently covers 6 slugs:

| Slug | Title sent to DCR |
|---|---|
| `sudoku-easy` | Sudoku (easy) |
| `sudoku-medium` | Sudoku (medium) |
| `sudoku-hard` | Sudoku (hard) |
| `sudoku-killer` | Killer sudoku |
| `word-wheel` | Word wheel |
| `wordiply` | Wordiply |

For all of them, this repo sends **only a static placeholder title** - there is no real
per-instance content sourcing on the frontend side for any of these, since the iframe itself always
shows "today's" puzzle according to the third party's own logic. Whatever DCR renders is driven
entirely by its own static per-slug config (see "DCR's `GameConfig` registry" below) plus that
placeholder title.

### Code

- `applications/app/controllers/PuzzlesPageController.scala` - `renderPuzzlePage(slug)`/
  `renderPuzzlePageJson(slug)` serve a single puzzle instance; `puzzleSlugTitles` is the slug
  allowlist and title map. These are deliberately named distinctly from this controller's other,
  pre-existing `renderPuzzles()`/`renderPuzzlesJson()` actions, which serve the unrelated Puzzles
  Hub/listing page.
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
  GET /puzzles/:slug       -> PuzzlesPageController.renderPuzzlePage
  GET /puzzles/:slug.json  -> PuzzlesPageController.renderPuzzlePageJson
  ```
  Route paths are unchanged from earlier iterations of this work - only the underlying action names
  have changed.

### How to configure/add a new puzzle type

All per-slug *structural* configuration (iframe URL, render mode, which UI chrome is enabled) lives
in DCR's `GameConfig` registry, not in this repo - this repo does not duplicate that data. To onboard
a new iframe-based slug on the **frontend side**:

1. Add the slug to `PuzzlesPageController.puzzleSlugTitles`, mapping it to a human-readable title.
   This is currently the *only* thing that determines whether `renderPuzzlePage`/
   `renderPuzzlePageJson` will serve a slug at all - anything not in this map 404s.
2. Coordinate with the DCR side to add a matching entry to DCR's `GameConfig` registry for the same
   slug - this repo's change alone does nothing without a corresponding DCR-side registry entry.
3. No routes changes are needed - `GET /puzzles/:slug(.json)` already matches any slug string.

Puzzle Page is scoped to iframe-based puzzles with no per-instance content by design - a puzzle type
that needs real per-instance content fetched from somewhere is a larger change to discuss and design
explicitly, not something to bolt onto this flow unilaterally.

### Local testing

Both servers must be running to see real HTML: DCR locally on `http://localhost:3030` (`make dev` in
the `dotcom-rendering` repo), and this repo on `http://localhost:9000` via `sbt` -> `project
dev-build` -> `run`, with `article-rendering.baseURL` pointed at `http://localhost:3030` (see
`docs/03-dev-howtos/14-override-default-configuration.md` for the `devOverrides` mechanism, and
`docs/01-start-here/01-installation-steps.md` for the `dev-build` local dev setup). No AB-test header
or query param is needed (see "Open questions / known limitations" below).

The `.json` route variant returns the exact JSON payload this repo would send to DCR, without
needing DCR itself to be reachable.

| Slug | URL |
|---|---|
| `sudoku-easy` | `http://localhost:9000/puzzles/sudoku-easy` |
| `sudoku-medium` | `http://localhost:9000/puzzles/sudoku-medium` |
| `sudoku-hard` | `http://localhost:9000/puzzles/sudoku-hard` |
| `sudoku-killer` | `http://localhost:9000/puzzles/sudoku-killer` |
| `word-wheel` | `http://localhost:9000/puzzles/word-wheel` |
| `wordiply` | `http://localhost:9000/puzzles/wordiply` |

### The DCR endpoint contract

This repo POSTs the following to DCR's `/PuzzlePage` endpoint:

| Field | Type | Meaning |
|---|---|---|
| `id` | string | The page's canonical content id. Not Puzzle-Page-specific. |
| `slug` | string | The puzzle type identifier DCR uses to look up its own `GameConfig` entry (e.g. `"sudoku-easy"`). |
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
| `title` | string | Display title for the instance (e.g. `"Sudoku (easy)"`). The only field this repo currently populates. |
| `puzzleType`, `setterName`, `date`, `specialInstructions`, `discussionId`, `crosswordData` | optional | Reserved/unused - left over from an earlier crossword-flavoured version of this flow that has since been descoped. Always absent today. Kept in the model only because they're part of the JSON contract already agreed with DCR - removing them is a DCR-side contract change to coordinate separately, not something to do unilaterally from this repo. |
| `moreFromPuzzlesAndGames` | array | Best-effort "more like this" recommendations. Currently always an empty array - not populated anywhere yet. |

## Open questions / known limitations

- **Iframe-only by design.** Puzzle Page covers iframe-based puzzles only; crosswords are out of
  scope on product direction, not a gap to fill later.
- **No real per-instance content for any slug.** All 6 slugs get a static placeholder title only.
- **No AB-test/rollout gate.** A `game-page-experiment` server-side AB test gate existed briefly
  during initial development but was removed, since these routes are expected to be mapped/exposed
  via a separate project rather than gated via this repo's AB-test mechanism.
- **Some JSON contract fields are reserved/unused** (see the field reference above) - trimming
  them from the contract is a DCR-side change to coordinate separately.
- **Routes will likely move.** These routes are expected to eventually be mapped/exposed via a
  different project rather than living here long-term.
- **Deeper technical open items (AmuseLabs archive URLs, the user-id/postMessage mechanism, etc.)
  are tracked on the DCR side**, in that repo's own equivalent consolidated Puzzle Page doc, not
  duplicated here - check the `dotcom-rendering` repo for the current location of that document.
