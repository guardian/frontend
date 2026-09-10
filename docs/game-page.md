# Game Page

## What it is

Game Page is a single, generic page template for iframe-based Guardian puzzle/game types (sudoku,
word games, quizzes/trivia, etc.), rendered by dotcom-rendering (DCR). This repo (`frontend`) is
responsible for assembling a small amount of per-instance data (currently just a title) and POSTing
it to DCR's `/GamePage` endpoint; DCR owns all layout, styling, and structural/rendering behaviour
(including the third-party iframe URL for each game).

**Crosswords are explicitly out of scope for Game Page.** They remain entirely on their own,
separate `/crosswords/*` routes and controllers (`CrosswordsController.scala`,
`CrosswordPageController`, etc.), unrelated to and untouched by any of the Game Page work described
in this document. This is a deliberate product decision, not a "not yet done" - do not add crossword
handling back into `PuzzlesPageController`/Game Page without explicit direction to do so.

## Current status: what actually works today

Game Page currently covers 11 iframe-based slugs: `sudoku-easy`, `sudoku-medium`, `sudoku-hard`,
`sudoku-killer`, `futoshiki`, `suguru`, `word-wheel`, `codeword`, `wordiply`, `on-the-ball`,
`film-reveal`. For all of them, this repo sends **only a static placeholder title** (e.g.
`"Sudoku (easy)"`) - there is no real per-instance content sourcing on the frontend side for any of
these yet, and none is currently planned, since the iframe itself always shows "today's" puzzle
according to the third party's own logic. Whatever DCR renders for them is driven entirely by DCR's
own static per-slug config (see "DCR's `GameConfig` registry" below) plus that placeholder title -
not by any live per-instance data from this repo.

## Hitting it locally

Route (identical in both `applications/conf/routes` and `dev-build/conf/routes`, under the
`# Game Page` comment):

```
GET /puzzles/:slug       -> PuzzlesPageController.renderGame
GET /puzzles/:slug.json  -> PuzzlesPageController.renderGameJson
```

The `.json` variant returns the exact JSON payload this repo would send to DCR, without needing DCR
itself to be reachable - useful for checking the data alone.

There is currently no AB test or other gate on this route - it renders unconditionally for
recognised slugs (see "Known limitations" below).

To see real HTML (not just JSON), DCR must be running locally and this repo's
`article-rendering.baseURL` config must point at it, exactly as for the existing crossword pages -
see `docs/03-dev-howtos/14-override-default-configuration.md` for the `devOverrides` mechanism, and
run this repo via `sbt` -> `project dev-build` -> `run` (this repo's documented, complete local dev
setup - see `docs/01-start-here/01-installation-steps.md`).

### Directly browsable URLs for all 11 slugs

Unlike DCR's own `/GamePage` endpoint (POST-only, not directly browsable), this route is a plain
`GET` served by this repo, so each URL can be pasted straight into a browser - no `curl`, no
manually-built JSON payload, and (since the AB gate was removed) no special header or query param
needed either.

**Both servers must be running for these to render real HTML:**
- DCR locally on `http://localhost:3030` (`make dev` in the `dotcom-rendering` repo, per its own
  docs), and
- this repo on `http://localhost:9000`, via `sbt` -> `project dev-build` -> `run`, with
  `article-rendering.baseURL` pointed at `http://localhost:3030` (see the `devOverrides` mechanism
  above). If DCR isn't reachable, these URLs will fail at the point this repo tries to POST to DCR -
  add `.json` to any URL below to inspect the payload this repo would have sent, without needing DCR
  running at all.

| Slug | Group | URL |
|---|---|---|
| `sudoku-easy` | Logic puzzles | `http://localhost:9000/puzzles/sudoku-easy` |
| `sudoku-medium` | Logic puzzles | `http://localhost:9000/puzzles/sudoku-medium` |
| `sudoku-hard` | Logic puzzles | `http://localhost:9000/puzzles/sudoku-hard` |
| `sudoku-killer` | Logic puzzles | `http://localhost:9000/puzzles/sudoku-killer` |
| `futoshiki` | Logic puzzles | `http://localhost:9000/puzzles/futoshiki` |
| `suguru` | Logic puzzles | `http://localhost:9000/puzzles/suguru` |
| `word-wheel` | Word games | `http://localhost:9000/puzzles/word-wheel` |
| `codeword` | Word games | `http://localhost:9000/puzzles/codeword` |
| `wordiply` | Word games | `http://localhost:9000/puzzles/wordiply` |
| `on-the-ball` | Quizzes and Trivia | `http://localhost:9000/puzzles/on-the-ball` |
| `film-reveal` | Quizzes and Trivia | `http://localhost:9000/puzzles/film-reveal` |

## How to configure/add a new game type

All per-slug *structural* configuration (iframe URL, render mode, which UI chrome is enabled) lives
in DCR's `GameConfig` registry, not in this repo (see "DCR's `GameConfig` registry" below) - this
repo does not duplicate that data. To onboard a new iframe-based slug (e.g. a hypothetical
`"my-new-game"` that doesn't exist yet), on the **frontend side** you need to:

1. **Add the slug to `PuzzlesPageController.gameSlugTitles`** (in
   `applications/app/controllers/PuzzlesPageController.scala`), mapping the slug string to a
   human-readable title, e.g.:
   ```scala
   val gameSlugTitles: Map[String, String] = Map(
     ...
     "my-new-game" -> "My New Game",
   )
   ```
   This is currently the *only* thing that determines whether `renderGame`/`renderGameJson` will
   serve a slug at all (anything not in this map 404s) - there is no other registry on this repo's
   side.
2. **Coordinate with the DCR side** to add a matching entry to DCR's `GameConfig` registry for the
   same slug (iframe URL, render mode, feature flags - see below) - this repo's change alone does
   nothing without a corresponding DCR-side registry entry, since DCR is what actually decides how to
   render each slug.
3. No routes changes are needed - `GET /puzzles/:slug(.json)` already matches any slug string and
   dispatches based on `gameSlugTitles`.

Game Page is scoped to iframe-based games with no per-instance content by design (see "What it is"
above) - if a future game type needs real per-instance content fetched from somewhere, that is a
larger change to discuss and design explicitly, not something to bolt onto this flow unilaterally.

## Field reference: the JSON contract sent to DCR

This repo POSTs the following to DCR's `/GamePage` endpoint (see
`common/app/model/dotcomrendering/DotcomGamePageRenderingDataModel.scala` for the exact case
classes, and `renderers.DotcomRenderingService.getGamePage` for the POST itself):

| Field | Type | Meaning |
|---|---|---|
| `id` | string | The page's canonical content id (`page.metadata.id`) - not specific to Game Page. |
| `slug` | string | The game type identifier DCR uses to look up its own `GameConfig` entry (e.g. `"sudoku-easy"`). This is the field that ties this repo's request to DCR's registry. |
| `webTitle` | string | The page's `<title>`/web title. |
| `config` | object | The same shared `ConfigType` JSON object sent to every other DCR endpoint this repo calls (switches, stage, asset URLs, etc.) - see `DotcomRenderingConfig`. Not Game-Page-specific. |
| `nav` | object | The same shared navigation (`Nav`) structure sent to other DCR endpoints. Not Game-Page-specific. |
| `pageFooter` | object | The same shared footer links structure sent to other DCR endpoints. Not Game-Page-specific. |
| `canonicalUrl` | string | The canonical URL for this page. |
| `editionId` | string | The edition (e.g. `UK`, `US`, `AU`) resolved from the request. |
| `instance` | object | The Game-Page-specific per-instance data - see below. |

`instance` fields (`GamePageInstance`):

| Field | Type | Meaning |
|---|---|---|
| `title` | string | Display title for the instance (e.g. `"Sudoku (easy)"`). The only field this repo currently populates. Always present. |
| `puzzleType` | string, optional | **Reserved/unused.** Was populated for a crossword-flavoured Game Page slug that has since been descoped (crosswords remain on their own, separate flow). Always `None`/absent today. Kept in the model only because it's part of the JSON contract already agreed with DCR - removing it is a DCR-side contract change to coordinate separately. |
| `setterName` | string, optional | **Reserved/unused**, same history/caveat as `puzzleType` above. Always `None`/absent today. |
| `date` | string, optional | **Reserved/unused**, same history/caveat as `puzzleType` above. Always `None`/absent today. When it was populated, this was a human-readable, already-formatted display date, not a raw timestamp - worth keeping in mind if this field is ever revived. |
| `specialInstructions` | string, optional | **Reserved/unused**, same history/caveat as `puzzleType` above. Always `None`/absent today. |
| `discussionId` | string, optional | **Reserved/unused**, same history/caveat as `puzzleType` above. Always `None`/absent today. |
| `crosswordData` | object, optional | **Reserved/unused**, same history/caveat as `puzzleType` above. Always `None`/absent today. |
| `moreFromPuzzlesAndGames` | array | Best-effort "more like this" recommendations (`title`, `type`, `set`, optional `url`). Currently always an empty array - not populated anywhere yet. |

## DCR's `GameConfig` registry (reference only - not owned by this repo)

DCR owns a static, per-slug configuration registry (referred to here as `GameConfig`) in the
dotcom-rendering repository - this repo does not have, and does not need, a copy of it; it only
needs to send the right `slug` string. Coordinate with whoever owns the DCR-side Game Page work (or
check the dotcom-rendering repo directly) for the exact current file location and shape. As
understood from the frontend/DCR handoff contract, each entry covers:

| Field | Meaning |
|---|---|
| `slug` | The same identifier this repo sends - the registry's lookup key. |
| `gameGroup` | Which category the game belongs to for navigation/grouping purposes (e.g. "Logic puzzles", "Word games", "Quizzes and Trivia"). |
| `renderMode` | How DCR should render this slug. For Game Page's current, iframe-only scope this is expected to always mean a simple iframe wrapper. |
| `componentKey` | Identifies which DCR component/template implementation should be used to render this slug. |
| `iframe.provider` | Which third-party provider serves the game (e.g. AmuseLabs, a bespoke provider like `wordiply.com`, `sportsreveal.io`, `moviegrid.io`). |
| `iframe.urlTemplate` | The (usually static) URL template DCR embeds. |
| `setterEnabled` | Whether to show setter/byline information in the UI. Not currently relevant to any of Game Page's iframe-only slugs. |
| `commentsEnabled` | Whether to show/enable the comments (discussion) UI for this slug. |
| `shareEnabled` | Whether to show social share controls. |
| `printEnabled` | Whether to show a "print" option/view. |
| `hasArchive` | Whether this game type has a browsable archive of past instances. |

None of the above needs to be sent by this repo - DCR resolves all of it purely from `slug`.

## Known limitations / not yet implemented

- **Iframe-only by design, not "not yet done".** Game Page is explicitly scoped to iframe-based
  games. Crosswords are out of scope on product direction and remain entirely on their own, separate
  `/crosswords/*` flow - this is not a gap to fill later, it's the intended shape of Game Page.
- **No real per-instance content for any slug.** All 11 slugs get a static placeholder title only;
  there is no CAPI (or other) content fetch wired up for any of them, and none is currently planned.
- **No AB-test/rollout gate.** A `game-page-experiment` server-side AB test gate existed briefly
  during initial development but was removed at explicit user request, since these routes are
  expected to be mapped/exposed via a separate project rather than gated via this repo's AB-test
  mechanism. There is currently no access control of any kind on this route beyond normal slug
  validation.
- **No "more from puzzles and games" data.** `instance.moreFromPuzzlesAndGames` is always an empty
  array; nothing populates it yet.
- **Some JSON contract fields are reserved/unused.** `puzzleType`, `setterName`, `date`,
  `specialInstructions`, `discussionId`, and `crosswordData` on `instance` are left over from a
  crossword-flavoured version of Game Page that has since been descoped. They're kept in the model
  (always unpopulated) rather than removed, since trimming DCR's contract is a DCR-side change to
  coordinate separately - see the field reference above.
- **Routes will likely move.** Per the user's stated direction, these routes are expected to
  eventually be mapped/exposed via a different project rather than living here long-term - treat the
  current `/puzzles/...` route in this repo as a working scaffold, not a final, stable public URL
  structure.
