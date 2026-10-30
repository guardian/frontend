package ab

import conf.Configuration
import play.api.mvc.RequestHeader

/** The existing v2 rollout is cumulative: readers must also be in the v1 variant. */
object PuzzlesHubV2Experiment {
  val TestName = "puzzles-new-hub-v2"
  val VariantGroup = "variant"

  def isEnabled(implicit request: RequestHeader): Boolean =
    isEnabled(Configuration.environment.isDev)

  private[ab] def isEnabled(isDevelopment: Boolean)(implicit request: RequestHeader): Boolean =
    isDevelopment || (PuzzlesHubV1Experiment.isEnabled(isDevelopment = false) &&
      ABTests.isUserInTestGroup(TestName, VariantGroup))
}
