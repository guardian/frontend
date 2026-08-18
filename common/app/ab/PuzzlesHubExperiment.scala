package ab

import play.api.mvc.RequestHeader

/** Request-level access to the Fastly-managed puzzles hub experiment.
  *
  * The experiment is defined in dotcom-rendering's AB-testing configuration. Fastly assigns the request to a group and
  * passes that participation to Frontend in the server-side AB-tests header, which [[http.ABTestingFilter]] uses to
  * decorate the request before this helper is called.
  */
object PuzzlesHubExperiment {
  val TestName = "puzzles-new-hub"
  val VariantGroup = "variant"

  def isEnabled(implicit request: RequestHeader): Boolean =
    ABTests.isUserInTestGroup(TestName, VariantGroup)
}
