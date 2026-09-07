package ab

import play.api.mvc.RequestHeader

/** Request-level access to the (currently unlaunched) Game Page experiment.
  *
  * This gates the new, isolated Game Page routes/controller so that they remain invisible to the general public in
  * production: nobody has this header set unless it is explicitly forced (e.g. a manual header override locally, or
  * later an edge/Fastly rule), exactly like [[PuzzlesHubExperiment]].
  */
object GamePageExperiment {
  val TestName = "game-page-experiment"
  val VariantGroup = "variant"

  def isEnabled(implicit request: RequestHeader): Boolean =
    ABTests.isUserInTestGroup(TestName, VariantGroup)
}
