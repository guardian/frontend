package ab

import common.{Edition, PuzzlesHubAccess}
import conf.Configuration
import play.api.mvc.RequestHeader

/** Maxi's rollout is independent of V3 premium access. */
object MaxiCrosswordExperiment {
  val TestName = "puzzles-crosswords-maxi"
  val VariantGroup = "variant"

  def isEnabled(implicit request: RequestHeader): Boolean =
    Configuration.environment.isDev || (PuzzlesHubAccess.Editions.contains(Edition(request)) &&
      ABTests.isUserInTestGroup(TestName, VariantGroup))
}
