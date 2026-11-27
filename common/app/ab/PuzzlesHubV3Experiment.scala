package ab

import conf.Configuration
import play.api.mvc.RequestHeader

/** The v3 rollout (premium puzzles access control) requires explicit v3 variant participation outside local
  * development.
  */
object PuzzlesHubV3Experiment {
  val TestName = "puzzles-new-hub-v3"
  val VariantGroup = "variant"

  def isEnabled(implicit request: RequestHeader): Boolean =
    isEnabled(Configuration.environment.isDev)

  private[ab] def isEnabled(isDevelopment: Boolean)(implicit request: RequestHeader): Boolean =
    isDevelopment || ABTests.isUserInTestGroup(TestName, VariantGroup)
}
