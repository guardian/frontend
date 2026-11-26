package ab

import common.{Edition, PuzzlesHubAccess}
import conf.Configuration
import play.api.mvc.RequestHeader

/** Maxi's rollout is independent of V3 premium access. */
object PuzzlesHubV4Experiment {
  val TestName = "puzzles-new-hub-v4"
  val VariantGroup = "variant"

  def isEnabled(implicit request: RequestHeader): Boolean =
    Configuration.environment.isDev || (PuzzlesHubAccess.Editions.contains(Edition(request)) &&
      ABTests.isUserInTestGroup(TestName, VariantGroup))
}
