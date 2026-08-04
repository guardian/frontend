package ab

import play.api.mvc.RequestHeader

object PuzzlesHubExperiment {
  val TestName = "puzzles-new-hub"
  val VariantGroup = "variant"

  def isEnabled(implicit request: RequestHeader): Boolean =
    ABTests.isUserInTestGroup(TestName, VariantGroup)
}
