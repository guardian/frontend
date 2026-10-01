package ab

import conf.Configuration
import play.api.mvc.RequestHeader

/** Request-level access to the `puzzles-new-hub-v1` tier of the Puzzles & Games rollout.
  *
  * The tier is cumulative: it only takes effect when the `puzzles-new-hub` (v0) baseline is also enabled, mirroring
  * dotcom-rendering's `isPuzzlesHubV1Enabled`.
  */
object PuzzlesHubV1Experiment {
  val TestName = "puzzles-new-hub-v1"
  val VariantGroup = "variant"

  def isEnabled(implicit request: RequestHeader): Boolean =
    isEnabled(Configuration.environment.isDev)

  private[ab] def isEnabled(isDevelopment: Boolean)(implicit request: RequestHeader): Boolean =
    isDevelopment ||
      (ABTests.isUserInTestGroup(PuzzlesHubExperiment.TestName, PuzzlesHubExperiment.VariantGroup) &&
        ABTests.isUserInTestGroup(TestName, VariantGroup))
}
