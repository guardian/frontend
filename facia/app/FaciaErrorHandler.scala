import common.GuLogging
import common.LoggingField.LogFieldBoolean
import experiments.{ActiveExperiments, RemoveLiteFronts}
import play.api._
import play.api.http.DefaultHttpErrorHandler
import play.api.mvc._
import play.api.routing.Router
import play.core.SourceMapper

class FaciaErrorHandler(env: Environment, config: Configuration, sourceMapper: Option[SourceMapper], router: => Router)
    extends DefaultHttpErrorHandler(env, config, sourceMapper, Some(router))
    with GuLogging {

  override def logServerError(request: RequestHeader, usefulException: UsefulException): Unit = {
    lazy val isFullFrontRequest = ActiveExperiments.isParticipating(RemoveLiteFronts)(request)

    logErrorWithCustomFields(
      """
        |
        |! @%s - Internal server error, for (%s) [%s] ->
        | """.stripMargin.format(usefulException.id, request.method, request.uri),
      usefulException,
      List(LogFieldBoolean("isFullFrontRequest", isFullFrontRequest)),
    )
  }
}
