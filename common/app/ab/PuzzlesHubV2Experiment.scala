package ab

import common.{Edition, PuzzlesHubAccess}
import conf.Configuration
import play.api.mvc.RequestHeader

/** The v2 rollout is cumulative: the hub must also be available for the reader's edition. */
object PuzzlesHubV2Experiment {
  val TestName = "puzzles-new-hub-v2"
  val VariantGroup = "variant"

  def isEnabled(implicit request: RequestHeader): Boolean =
    isEnabled(Configuration.environment.isDev)

  private[ab] def isEnabled(isDevelopment: Boolean)(implicit request: RequestHeader): Boolean =
    isDevelopment || (PuzzlesHubAccess.Editions.contains(Edition(request)) &&
      ABTests.isUserInTestGroup(TestName, VariantGroup))
}
