package ab

import common.{Edition, PuzzlesHubAccess}
import conf.Configuration
import play.api.mvc.RequestHeader

/** The v3 rollout (premium puzzles access control) requires the hub to be available for the reader's edition and
  * explicit v3 variant participation outside local development.
  */
object PuzzlesHubV3Experiment {
  val TestName = "puzzles-new-hub-v3"
  val VariantGroup = "variant"

  def isEnabled(implicit request: RequestHeader): Boolean =
    isEnabled(Configuration.environment.isDev)

  private[ab] def isEnabled(isDevelopment: Boolean)(implicit request: RequestHeader): Boolean =
    isDevelopment || (PuzzlesHubAccess.Editions.contains(Edition(request)) &&
      ABTests.isUserInTestGroup(TestName, VariantGroup))
}
