package ab

import conf.Configuration
import play.api.mvc.RequestHeader

/** The v4 rollout (Maxi crossword) requires v3, plus explicit v4 variant participation outside local development. */
object PuzzlesHubV4Experiment {
  val TestName = "puzzles-new-hub-v4"
  val VariantGroup = "variant"

  def isEnabled(implicit request: RequestHeader): Boolean =
    isEnabled(Configuration.environment.isDev)

  private[ab] def isEnabled(isDevelopment: Boolean)(implicit request: RequestHeader): Boolean =
    PuzzlesHubV3Experiment.isEnabled(isDevelopment) &&
      (isDevelopment || ABTests.isUserInTestGroup(TestName, VariantGroup))
}
