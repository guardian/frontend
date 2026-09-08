# Game Page

## What it is

Game Page is a single, generic page template that unifies all Guardian puzzle/game types
(crosswords, sudoku, word games, quizzes/trivia, etc.) under one shared layout/design, rendered by
dotcom-rendering (DCR). This repo (`frontend`) is responsible for fetching/assembling per-instance
data (where any exists) and POSTing it to DCR's `/GamePage` endpoint; DCR owns all layout, styling,
and structural/rendering behaviour.

So far, one slug — `"crossword"` — is wired up end-to-end with real content. The other 11 slugs are
routed and will render via DCR, but only with a placeholder title on the frontend side (see
"Current status" below).

## Current status: what actually works today

- **`"crossword"`** — fully wired end-to-end. `GamePageController` fetches a real crossword from the
  Content API (CAPI) by `crosswordType`/`id`, and sends real data: title, setter name, a
  human-readable display date, special instructions, a discussion (comments) id, and the raw
  crossword grid/clue data (`CrosswordData`).
- **The other 11 slugs** (`sudoku-easy`, `sudoku-medium`, `sudoku-hard`, `sudoku-killer`,
  `futoshiki`, `suguru`, `word-wheel`, `codeword`, `wordiply`, `on-the-ball`, `film-reveal`) —
  routed and will reach DCR, but this repo currently sends **only a static placeholder title**
  (e.g. `"Sudoku (easy)"`) and nothing else. There is no real per-instance content sourcing for
  these yet on the frontend side. Whatever DCR renders for them today is driven entirely by DCR's
  own static per-slug config (see "DCR's `GameConfig` registry" below) plus that placeholder title -
  not by any live per-instance data from this repo.

Do not assume any slug beyond `"crossword"` shows real, live content - it doesn't yet.

## Hitting it locally

Routes (identical in both `applications/conf/routes` and `dev-build/conf/routes`, under the
`# Game Page` comment):

```
GET /puzzles/crossword/:crosswordType/:id       -> GamePageController.renderCrossword
GET /puzzles/crossword/:crosswordType/:id.json  -> GamePageController.renderCrosswordJson
GET /puzzles/:slug                              -> GamePageController.renderGame
GET /puzzles/:slug.json                         -> GamePageController.renderGameJson
```

The `.json` variants return the exact JSON payload this repo would send to DCR, without needing DCR
itself to be reachable - useful for checking the data alone.

Example URLs:
- `http://localhost:9000/puzzles/crossword/quick/17578` (or `.json`) - a real, known-good crossword.
- `http://localhost:9000/puzzles/sudoku-easy` (or `.json`) - one of the 11 placeholder-only slugs.

There is currently no AB test or other gate on any of these routes - they render unconditionally for
recognised slugs/crosswords (see "Known limitations" below).

To see real HTML (not just JSON), DCR must be running locally and this repo's
`article-rendering.baseURL` config must point at it, exactly as for the existing crossword pages -
see `docs/03-dev-howtos/14-override-default-configuration.md` for the `devOverrides` mechanism, and
run this repo via `sbt` -> `project dev-build` -> `run` (this repo's documented, complete local dev
setup - see `docs/01-start-here/01-installation-steps.md`).

### Directly browsable URLs for all 12 slugs

Unlike DCR's own `/GamePage` endpoint (POST-only, not directly browsable), every route below is a
plain `GET` served by this repo, so each URL can be pasted straight into a browser - no `curl`, no
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
| `crossword` | Crosswords | `http://localhost:9000/puzzles/crossword/quick/17578` |
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

For `crossword`, the route is `/puzzles/crossword/:crosswordType/:id` - it needs a real, valid
`crosswordType`/`id` pair, not just any values. `quick/17578` above is one known-good example. To pick
a different one: any currently-published crossword's type and id both work (the id is the number
shown in its URL/title, e.g. "Quick crossword No 17,578" -> `17578`) - either browse
theguardian.com/crosswords for a real one, or check this repo's own existing
`/crosswords/{type}/{id}` pages locally (e.g. `http://localhost:9000/crosswords/quick/17578`) to
confirm an id resolves before using it here. Our `/puzzles/crossword/:crosswordType/:id` route itself
doesn't restrict `crosswordType` to a fixed list (unlike the existing `/crosswords/...` routes) - it
just passes whatever you give it straight to CAPI, so anything other than a genuine series will 404.
In practice, use one of the same series values the existing crossword routes accept: `cryptic`,
`quick`, `quiptic`, `quick-cryptic`, `sunday-quick`, `prize`, `everyman`, `azed`, `special`, `genius`,
`speedy`, `weekend`, `mini`.


## How to configure/add a new game type

All per-slug *structural* configuration (iframe URL, render mode, which UI chrome is enabled) lives
in DCR's `GameConfig` registry, not in this repo (see "DCR's `GameConfig` registry" below) - this
repo does not duplicate that data. To onboard a new slug (e.g. a hypothetical `"wordiply"`-style
iframe game that doesn't exist yet), on the **frontend side** you need to:

1. **Add the slug to `GamePageController.iframeSlugTitles`** (in
   `applications/app/controllers/GamePageController.scala`), mapping the slug string to a
   human-readable title, e.g.:
   ```scala
   val iframeSlugTitles: Map[String, String] = Map(
     ...
     "my-new-game" -> "My New Game",
   )
   ```
   This is currently the *only* thing that determines whether `GamePageController.renderGame`/
   `renderGameJson` will serve a slug at all (anything not in this map 404s) - there is no other
   registry on this repo's side.
2. **If the new game type has real per-instance content to fetch** (unlike the current 11
   placeholder-only slugs), you'll need to add a fetch path similar to
   `renderCrossword`/`renderCrosswordGamePage`: fetch the content (from CAPI or wherever it lives),
   populate the relevant `GamePageInstance` fields (see the field reference below), and set `slug` to
   your new slug when building `DotcomGamePageRenderingDataModel`. There is no shared "iframe slug
   with real content" helper yet - each new real-content game type is currently expected to get its
   own small dedicated action/route (as `renderCrossword`/`renderCrosswordJson` do), mirroring
   however its content actually needs to be fetched, rather than being force-fit into the generic
   `renderGame`/`renderIframeGamePage` path (which assumes no per-instance content beyond a title).
3. **Coordinate with the DCR side** to add a matching entry to DCR's `GameConfig` registry for the
   same slug (iframe URL, render mode, feature flags - see below) - this repo's change alone does
   nothing without a corresponding DCR-side registry entry, since DCR is what actually decides how to
   render each slug.
4. No routes changes are needed for a new iframe-only slug - `GET /puzzles/:slug(.json)` already
   matches any slug string and dispatches based on `iframeSlugTitles`. A new slug with its own
   dedicated real-content fetch (per point 2) would need its own route(s), mirroring the
   `/puzzles/crossword/...` pattern.

## Field reference: the JSON contract sent to DCR

This repo POSTs the following to DCR's `/GamePage` endpoint (see
`common/app/model/dotcomrendering/DotcomGamePageRenderingDataModel.scala` for the exact case
classes, and `renderers.DotcomRenderingService.getGamePage` for the POST itself):

| Field | Type | Meaning |
|---|---|---|
| `id` | string | The page's canonical content id (`page.metadata.id`) - not specific to Game Page. |
| `slug` | string | The game type identifier DCR uses to look up its own `GameConfig` entry (e.g. `"crossword"`, `"sudoku-easy"`). This is the field that ties this repo's request to DCR's registry. |
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
| `title` | string | Display title for the instance (e.g. "Quick crossword No 17,578", or a static placeholder like "Sudoku (easy)" for the 11 iframe slugs). Always present. |
| `puzzleType` | string, optional | For crosswords, the CAPI series/tag (e.g. `"quick"`, `"cryptic"`). Not populated for the 11 iframe slugs. |
| `setterName` | string, optional | The crossword setter's name, when known. Crossword-only. |
| `date` | string, optional | A **human-readable, already-formatted** display date (e.g. `"Mon 7 Sep 2026"`, via `GUDateTimeFormatNew.formatDateForDisplay`) - DCR renders this verbatim as text, so any formatting must happen here, not in DCR. Crossword-only today. |
| `specialInstructions` | string, optional | Free-text puzzle instructions (e.g. for prize/special crosswords). Crossword-only. |
| `discussionId` | string, optional | The id used to load comments/discussion for this instance, when applicable. Crossword-only today. |
| `crosswordData` | object, optional | The raw crossword grid/clue/solution data (`CrosswordData` - the same type already used by the existing, legacy crossword page), only present when `slug == "crossword"`. |
| `moreFromPuzzlesAndGames` | array | Best-effort "more like this" recommendations (`title`, `type`, `set`, optional `url`). Currently always an empty array in this repo - not populated anywhere yet. |

## DCR's `GameConfig` registry (reference only - not owned by this repo)

DCR owns a static, per-slug configuration registry (referred to here as `GameConfig`) in the
dotcom-rendering repository - this repo does not have, and does not need, a copy of it; it only
needs to send the right `slug` string. Coordinate with whoever owns the DCR-side Game Page work (or
check the dotcom-rendering repo directly) for the exact current file location and shape. As
understood from the frontend/DCR handoff contract, each entry covers:

| Field | Meaning |
|---|---|
| `slug` | The same identifier this repo sends - the registry's lookup key. |
| `gameGroup` | Which category the game belongs to for navigation/grouping purposes (e.g. "Crosswords", "Logic puzzles", "Word games", "Quizzes and Trivia"). |
| `renderMode` | How DCR should render this slug - e.g. as a fully-fledged content page (like the crossword, with its own layout/components) versus a simple iframe wrapper. |
| `componentKey` | Identifies which DCR component/template implementation should be used to render this slug (relevant when `renderMode` is a rich, non-iframe render). |
| `iframe.provider` | For iframe-based slugs, which third-party provider serves the game (e.g. AmuseLabs, a bespoke provider like `wordiply.com`, `sportsreveal.io`, `moviegrid.io`). |
| `iframe.urlTemplate` | For iframe-based slugs, the (usually static) URL template DCR embeds. |
| `setterEnabled` | Whether to show setter/byline information in the UI (relevant for crosswords). |
| `commentsEnabled` | Whether to show/enable the comments (discussion) UI for this slug. |
| `shareEnabled` | Whether to show social share controls. |
| `printEnabled` | Whether to show a "print" option/view. |
| `hasArchive` | Whether this game type has a browsable archive of past instances (as crosswords do via `/crosswords/search`, `/crosswords/digital-edition`, etc.). |

None of the above needs to be sent by this repo - DCR resolves all of it purely from `slug`.

## Known limitations / not yet implemented

- **No real per-instance content for the 11 iframe slugs.** They currently get a static placeholder
  title only; there is no CAPI (or other) content fetch wired up for any of them yet.
- **No AB-test/rollout gate.** A `game-page-experiment` server-side AB test gate existed briefly
  during initial development but was removed at explicit user request, since these routes are
  expected to be mapped/exposed via a separate project rather than gated via this repo's AB-test
  mechanism. There is currently no access control of any kind on these routes beyond normal
  slug/crossword-id validation.
- **No "more from puzzles and games" data.** `instance.moreFromPuzzlesAndGames` is always an empty
  array; nothing populates it yet.
- **Routes will likely move.** Per the user's stated direction, these routes are expected to
  eventually be mapped/exposed via a different project rather than living here long-term - treat the
  current `/puzzles/...` routes in this repo as a working scaffold, not a final, stable public URL
  structure.
