# Puzzle Page

## What is implemented

Puzzle Page is a generic page template for iframe-based Guardian puzzle types (sudoku and word
games), rendered by dotcom-rendering (DCR). This repo (`frontend`) assembles a small amount of
per-instance data (title, requested date, and the API-resolved `gameUrl`) and POSTs it to DCR's
`/PuzzlePage` endpoint; DCR owns all layout, styling, and structural/rendering behaviour, including
reader-specific additions to the third-party iframe URL.

**Crosswords are not part of Puzzle Page.** They remain entirely on their own, separate
`/crosswords/*` routes and controllers (`CrosswordsController.scala`, `CrosswordPageController`,
etc.), untouched by any of this. This is a deliberate product decision.

### Public URL structure: nested under the hub, grouped, and dated

Per confirmed team direction, individual puzzle-page URLs are nested under the `/puzzles-and-games`
hub, grouped by DCR's `puzzleGroup` ("logic-puzzles" or "word-games"), and always carry a real
`YYYY-MM-DD` date:

-   Hub (unchanged): `https://www.theguardian.com/puzzles-and-games/`
-   Sudoku: `https://www.theguardian.com/puzzles-and-games/logic-puzzles/sudoku-easy/2024-01-15`
    (and `sudoku-medium`, `sudoku-hard`, `sudoku-killer`)
-   Word wheel: `https://www.theguardian.com/puzzles-and-games/word-games/word-wheel/2024-01-15`
-   Wordiply: `https://www.theguardian.com/puzzles-and-games/word-games/wordiply/2024-01-15`

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

| Public URL (dated)                                      | Controller action              | `slug` sent to DCR | Title sent to DCR |
| ------------------------------------------------------- | ------------------------------ | ------------------ | ----------------- |
| `/puzzles-and-games/logic-puzzles/sudoku-easy/{date}`   | `renderSudoku("easy", date)`   | `sudoku-easy`      | Sudoku (easy)     |
| `/puzzles-and-games/logic-puzzles/sudoku-medium/{date}` | `renderSudoku("medium", date)` | `sudoku-medium`    | Sudoku (medium)   |
| `/puzzles-and-games/logic-puzzles/sudoku-hard/{date}`   | `renderSudoku("hard", date)`   | `sudoku-hard`      | Sudoku (hard)     |
| `/puzzles-and-games/logic-puzzles/sudoku-killer/{date}` | `renderSudoku("killer", date)` | `sudoku-killer`    | Killer sudoku     |
| `/puzzles-and-games/word-games/word-wheel/{date}`       | `renderWordWheel(date)`        | `word-wheel`       | Word wheel        |
| `/puzzles-and-games/word-games/wordiply/{date}`         | `renderWordiply(date)`         | `wordiply`         | Wordiply          |

For all six, frontend maps the slug to `puzzleType` and requests
`GET /game?puzzleType=...&date=YYYY-MM-DD` using `Configuration.puzzlesApi.baseUrl`
and the configured API key. The response is a single archive item (no envelope).
Its `gameUrl` becomes `instance.gameUrl`; DCR preserves its path, puzzle ID and provider
parameters, adding reader context after hydration. This server request is anonymous so
cached HTML never contains another reader's provider identity.

Missing games or absent game URLs return 404. Upstream failures and invalid responses
return an uncached 502. The existing `puzzles.api.url` configuration must point to the
new API deployment that serves `/game`, `/archive` and `/progress/query`.

Hub crossword cards, archive calendar/recent cards and their recommendation rails use
API `gameUrl` values directly, including dated Genius article URLs. They no longer look
up CAPI to construct crossword destinations. Other puzzle card destinations are unchanged.

### Code

-   `applications/app/controllers/PuzzlesPageController.scala`:
    -   `renderSudoku(variant, date)`/`renderSudokuJson(variant, date)` - the nested, dated Sudoku
        actions, backed by `sudokuVariantTitles` (variant -> title map).
    -   `renderWordWheel(date)`/`renderWordWheelJson(date)` - dedicated word wheel actions, hardcoding
        `WordWheelSlug`/`WordWheelTitle` internally.
    -   `renderWordiply(date)`/`renderWordiplyJson(date)` - dedicated wordiply actions, hardcoding
        `WordiplySlug`/`WordiplyTitle` internally.
    -   `redirectSudokuArchive(variant)`, `redirectWordWheelArchive()`, `redirectWordiplyArchive()` - the
        bare (dateless) archive-redirect actions (see "Archive redirects" below).
    -   All actions are deliberately named distinctly from this controller's other, pre-existing
        `renderPuzzles()`/`renderPuzzlesJson()` actions, which serve the unrelated Puzzles Hub/listing
        page.
-   `common/app/model/dotcomrendering/DotcomPuzzlePageRenderingDataModel.scala` -
    `DotcomPuzzlePageRenderingDataModel`/`PuzzlePageInstance`, the JSON contract sent to DCR (see field
    reference below).
-   `common/app/renderers/DotcomRenderingService.scala` - `getPuzzlePage` POSTs to
    `<articleBaseURL>/PuzzlePage`.
-   `common/app/staticpages/StaticPages.scala` - `dcrSimplePuzzlePage` builds the minimal `SimplePage`
    metadata used for each instance.
-   Routes (identical in `applications/conf/routes` and `dev-build/conf/routes`, under the
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
`ab.PuzzlesHubV1Experiment` ("puzzles-new-hub-v1"), the same server-side AB test used by this
controller's `renderPuzzles`/`renderPuzzlesJson` hub actions. Requests return `404` unless the
request carries the `X-GU-Server-AB-Tests: puzzles-new-hub-v1:variant` header (via this repo's normal server-side AB test
framework, `common/app/ab/ABTests.scala`).

**Note for future v2 work:** DCR uses a 2-tier, cumulative rollout gating structure for this
feature (`puzzles-new-hub-v1`, `puzzles-new-hub-v2`, defined in `ab-testing/config/abTests.ts`,
checked via `isPuzzlesHubV1Enabled`/`isPuzzlesHubV2Enabled` in
`src/lib/puzzlesHubVersionExperiment.ts`). This repo only checks the v1 tier today; a v2-scoped
frontend feature will need its own equivalent cumulative check.

### The date path segment

Every render action takes `date` as a real, always-present `yyyy-MM-dd` path segment, forwarded to
DCR as `instance.puzzleDate`. This supersedes an earlier `?date=` query-param mechanism (removed
entirely, along with the `java.time.LocalDate`-based "default to today" fallback) - the date is no
longer optional plumbing, it's a meaningful part of every puzzle-page URL, since users will navigate
here from a calendar for a specific day's puzzle.

The route validates the date's shape and the controller validates its calendar value
with `LocalDate.parse`. Impossible dates return 404 without calling the API. Valid dates
are looked up exactly as requested; publication availability is determined by `/game`.

### Archive redirects

Dateless game URLs return a temporary `302` redirect to
`/puzzles-and-games/{group}/archive?puzzle={slug}`, for example
`/puzzles-and-games/logic-puzzles/archive?puzzle=sudoku-easy`. Archives use their existing
rendering flow and do not inherit game sponsorship.

### How to configure/add a new puzzle type

All per-slug presentation configuration (render mode and which UI chrome is enabled) lives
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

Also register each new slug in `PuzzlesPageController.PuzzleTypesBySlug` and ensure the
Puzzles API supports that type in `/game`. The API owns provider URLs and puzzle IDs.

### Sponsorship

Configure web sponsorship in `applications/conf/puzzles-layout.json`, using edition IDs
`UK`, `US`, `AU`, `INT` or `EUR`. Each location takes the same sponsor object:

| Placement | JSON location (AU example) |
| --- | --- |
| Hub header | `sponsorship.AU` |
| Directory section | `containers[].sponsorship.AU` on the relevant container |
| Game category | `gameSponsorship.word-games.AU` or `gameSponsorship.logic-puzzles.AU` |

Containers must be top-level `featured` or `standard` sections (including an omitted variant).
Nested, `ad` and `supporting` sponsorship is rejected; empty or disabled sections remain hidden.
Game categories cover Word wheel/Wordiply and the four Sudoku variants respectively; other
categories are rejected. Crosswords and archives are unchanged; apps sponsorship is configured
separately.

#### Sponsor format

Insert an object with this shape at the chosen location. Example URLs are placeholders, not a campaign.

```json
{
    "name": "Example sponsor",
    "label": "Supported by",
    "sponsorUri": "https://example.com",
    "aboutUri": "https://example.com/about",
    "logo": {
        "src": "https://example.com/logo.png",
        "darkSrc": "https://example.com/logo-dark.png",
        "aspectRatio": 2
    }
}
```

`name` and `label` must be non-empty; all URLs must be HTTPS. `aboutUri` and `logo.darkSrc` are
optional: omit unused values rather than supplying empty strings. `aspectRatio` is width/height
and must be positive; frontend generates dimensions with height 100 and rounded width
`aspectRatio * 100`. Branding is always sponsored. App-only layout fields are ignored.

#### Resolution and rollout

For each game category and edition:

| Hub sponsor | Explicit game sponsor | Game result |
| --- | --- | --- |
| No | No | Unsponsored |
| Yes | No | Unsponsored |
| No | Yes | Game sponsor |
| Yes | Yes | Hub sponsor |

There is no fallback across editions or categories. Container sponsorship is independent.
The config-only provider resolves game branding without fetching hub cards or newsletters;
HTML and JSON use the same resolved `commercialProperties`. Raw configuration is not sent to DCR.
See [DCR's contract and rendering rules](https://github.com/guardian/dotcom-rendering/blob/main/dotcom-rendering/docs/puzzle-page.md#sponsorship)
for About links, dark logos and ad-free behaviour.

Merge and deploy the frontend/DCR sponsorship support before activating a campaign. Enable or
remove the relevant edition entries and deploy frontend, allowing for normal page caches.
There is no sponsorship-specific switch. Removing only the hub entry exposes any configured
game fallback; remove the explicit game entry to disable game sponsorship. Check all three
placements when removing a campaign. Never commit local demo sponsors.

### Local testing

Both servers must be running to see real HTML: DCR locally on `http://localhost:3030` (`make dev` in
the `dotcom-rendering` repo), and this repo on `http://localhost:9000` via `sbt` -> `project
dev-build` -> `run`, with `article-rendering.baseURL` pointed at `http://localhost:3030` (see
`docs/03-dev-howtos/14-override-default-configuration.md` for the `devOverrides` mechanism, and
`docs/01-start-here/01-installation-steps.md` for the `dev-build` local dev setup).

When gated, use `X-GU-Server-AB-Tests: puzzles-new-hub-v1:variant`. Scope browser header rules
to localhost to avoid CORS failures on third-party resources. DCR's development bypass does not
bypass frontend's experiment gate.

The `.json` route variant returns the exact JSON payload this repo would send to DCR, without
needing DCR itself to be reachable.

| Puzzle          | Dated URL (example date `2024-01-15`)                                            | Bare (archive-redirect) URL                                           |
| --------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Sudoku (easy)   | `http://localhost:9000/puzzles-and-games/logic-puzzles/sudoku-easy/2024-01-15`   | `http://localhost:9000/puzzles-and-games/logic-puzzles/sudoku-easy`   |
| Sudoku (medium) | `http://localhost:9000/puzzles-and-games/logic-puzzles/sudoku-medium/2024-01-15` | `http://localhost:9000/puzzles-and-games/logic-puzzles/sudoku-medium` |
| Sudoku (hard)   | `http://localhost:9000/puzzles-and-games/logic-puzzles/sudoku-hard/2024-01-15`   | `http://localhost:9000/puzzles-and-games/logic-puzzles/sudoku-hard`   |
| Killer sudoku   | `http://localhost:9000/puzzles-and-games/logic-puzzles/sudoku-killer/2024-01-15` | `http://localhost:9000/puzzles-and-games/logic-puzzles/sudoku-killer` |
| Word wheel      | `http://localhost:9000/puzzles-and-games/word-games/word-wheel/2024-01-15`       | `http://localhost:9000/puzzles-and-games/word-games/word-wheel`       |
| Wordiply        | `http://localhost:9000/puzzles-and-games/word-games/wordiply/2024-01-15`         | `http://localhost:9000/puzzles-and-games/word-games/wordiply`         |

The hub itself: `http://localhost:9000/puzzles-and-games`.

Bare URLs return a temporary redirect to the relevant `.../archive?puzzle=...` page.

### The DCR endpoint contract

This repo POSTs the following to DCR's `/PuzzlePage` endpoint:

| Field          | Type   | Meaning                                                                                                                                                         |
| -------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`           | string | The page's canonical content id. Not Puzzle-Page-specific.                                                                                                      |
| `slug`         | string | The puzzle type identifier DCR uses to look up its own `PuzzleConfig` entry (e.g. `"sudoku-easy"`, `"word-wheel"`). Always the flattened form, even for Sudoku. |
| `webTitle`     | string | The page's `<title>`/web title.                                                                                                                                 |
| `config`       | object | The same shared config JSON object sent to every other DCR endpoint this repo calls. Not Puzzle-Page-specific.                                                  |
| `nav`          | object | The same shared navigation structure sent to other DCR endpoints. Not Puzzle-Page-specific.                                                                     |
| `pageFooter`   | object | The same shared footer links structure sent to other DCR endpoints. Not Puzzle-Page-specific.                                                                   |
| `canonicalUrl` | string | The canonical URL for this page (e.g. `https://www.theguardian.com/puzzles-and-games/logic-puzzles/sudoku-easy/2024-01-15`).                                    |
| `editionId`    | string | The edition (e.g. `UK`, `US`, `AU`) resolved from the request.                                                                                                  |
| `instance`     | object | Per-instance data - see below.                                                                                                                                  |
| `isAdFreeUser` | boolean | Whether the reader has an ad-free subscription. This suppresses ads, not sponsorship. |
| `commercialProperties` | object | Resolved sponsorship by edition ID, using the existing article branding shape. Empty when there is no explicit game sponsorship; DCR also accepts an omitted field for backwards compatibility. |

`instance` fields (`PuzzlePageInstance`):

| Field                     | Type             | Meaning                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`                   | string           | Display title for the instance (e.g. `"Sudoku (easy)"`).                                                                                                                                                                                                                                                                                                                                                 |
| `puzzleDate` | string, optional | ISO date from the URL. DCR displays it and forwards it to the iframe context. |
| `gameUrl` | string, optional | Dated provider URL from the Puzzles API; required by the current page builder. |
| `moreFromPuzzlesAndGames` | array | Best-effort related puzzle cards; may be empty. |
| `puzzlesSupporting` | object, optional | Useful links and an optional live newsletter. |

## Open questions / known limitations

-   **Iframe-only by design.** Puzzle Page covers iframe-based puzzles only; crosswords are out of
    scope on product direction, not a gap to fill later.
-   **Public URLs belong to frontend.** Coordinate route changes to preserve existing links.
-   **Deeper technical open items (AmuseLabs archive URLs, the user-id/postMessage mechanism, etc.)
    are tracked on the DCR side**, in that repo's own equivalent consolidated Puzzle Page doc, not
    duplicated here - check the `dotcom-rendering` repo for the current location of that document.
