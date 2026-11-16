package common

import conf.Configuration
import play.api.mvc.RequestHeader

/** The single source of truth for whether the Puzzles & Games hub (its pages, navigation and crossword changes) is
  * available for a request.
  *
  * Availability is decided by the request's edition. To roll the hub out to another edition, add it to [[Editions]].
  * Keep this in sync with `PUZZLES_HUB_EDITIONS` in dotcom-rendering (`src/lib/puzzlesHubAccess.ts`), which applies the
  * same rule again before rendering.
  */
object PuzzlesHubAccess {
  val Editions: Set[Edition] = Set(editions.International)

  /** True when the request's edition is one of [[Editions]], or in local development. */
  def isAvailable(implicit request: RequestHeader): Boolean =
    isAvailable(Configuration.environment.isDev, Edition(request))

  private[common] def isAvailable(isDevelopment: Boolean, edition: Edition): Boolean =
    isDevelopment || Editions.contains(edition)
}
