package ab

import conf.Configuration
import play.api.mvc.RequestHeader

/** The v3 rollout (premium puzzles access control) is cumulative: the hub must be available for the reader's edition
  * and the reader must also be in the v2 variant (see [[PuzzlesHubV2Experiment]]). Mirrors dotcom-rendering's
  * `isPuzzlesHubV3Enabled`.
  */
object PuzzlesHubV3Experiment {
  val TestName = "puzzles-new-hub-v3"
  val VariantGroup = "variant"

  def isEnabled(implicit request: RequestHeader): Boolean =
    isEnabled(Configuration.environment.isDev)

  private[ab] def isEnabled(isDevelopment: Boolean)(implicit request: RequestHeader): Boolean =
    isDevelopment || (PuzzlesHubV2Experiment.isEnabled(isDevelopment = false) &&
      ABTests.isUserInTestGroup(TestName, VariantGroup))
}
