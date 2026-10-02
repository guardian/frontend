package ab

import conf.Configuration
import play.api.mvc.RequestHeader

/** Request-level access to the Fastly-managed `puzzles-new-hub-v1` experiment, which gates the Puzzles & Games hub, its
  * pages and its navigation.
  *
  * The experiment is defined in dotcom-rendering's AB-testing configuration. Fastly assigns the request to a group and
  * passes that participation to Frontend in the server-side AB-tests header, which [[http.ABTestingFilter]] uses to
  * decorate the request before this helper is called. Mirrors dotcom-rendering's `isPuzzlesHubV1Enabled`.
  */
object PuzzlesHubV1Experiment {
  val TestName = "puzzles-new-hub-v1"
  val VariantGroup = "variant"

  def isEnabled(implicit request: RequestHeader): Boolean =
    isEnabled(Configuration.environment.isDev)

  private[ab] def isEnabled(isDevelopment: Boolean)(implicit request: RequestHeader): Boolean =
    isDevelopment || ABTests.isUserInTestGroup(TestName, VariantGroup)
}
