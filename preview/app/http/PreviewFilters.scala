package http

import akka.stream.Materializer
import GoogleAuthFilters.AuthFilterWithExemptions
import com.gu.googleauth.UserIdentity
import common.Logging
import controllers.HealthCheck
import googleAuth.FilterExemptions
import model.ApplicationContext
import play.api.http.{HttpConfiguration, HttpFilters}
import play.api.libs.json.Json
import play.api.mvc.{Filter, RequestHeader, Result}

import scala.concurrent.{ExecutionContext, Future}

class PreviewFilters(
    httpConfiguration: HttpConfiguration,
    healthCheck: HealthCheck,
)(implicit mat: Materializer, applicationContext: ApplicationContext, executionContext: ExecutionContext)
    extends HttpFilters {

  private val exemptionsUrls = healthCheck.healthChecks.map(_.path) ++ Seq("/2015-06-24-manifest.json")
  private val filterExemptions = new FilterExemptions(exemptionsUrls: _*)
  val previewAuthFilter = new AuthFilterWithExemptions(filterExemptions.loginExemption, filterExemptions.exemptions)(
    mat,
    applicationContext,
    httpConfiguration,
  )

  val filters = previewAuthFilter :: new NoCacheFilter :: new NoAvatarFilter :: Filters.common
}

// OBVIOUSLY this is only for the preview server
// NOT to be used elsewhere...
class NoCacheFilter(implicit val mat: Materializer, executionContext: ExecutionContext) extends Filter {
  override def apply(nextFilter: (RequestHeader) => Future[Result])(request: RequestHeader): Future[Result] =
    nextFilter(request).map(_.withHeaders("Cache-Control" -> "no-cache"))
}

class NoAvatarFilter(implicit val mat: Materializer, executionContext: ExecutionContext) extends Filter with Logging {
  override def apply(nextFilter: (RequestHeader) => Future[Result])(request: RequestHeader): Future[Result] =
    nextFilter(request).map { result =>
      result.newSession match {
        case Some(session) if session.get(UserIdentity.KEY).isDefined =>
          (for {
            userIdentityStr <- session.get(UserIdentity.KEY).toRight(s"No '${UserIdentity.KEY}' key in session")
            userIdentityJson = Json.parse(userIdentityStr)
            userIdentity <-
              Json
                .fromJson[UserIdentity](userIdentityJson)
                .asEither
                .left
                .map(parsingError => s"Failed to parse session userId into UserIdentity object: $parsingError")
            newId = userIdentity.copy(avatarUrl = None)
            newIdStr = Json.toJson(newId).toString()
            newResult = result.withSession(session + (UserIdentity.KEY -> newIdStr))
          } yield newResult) match {
            case Right(newResult) => newResult
            case Left(failureMessage) =>
              log.warn(s"Failed to filter out avatarUrl: $failureMessage")
              result
          }
        case _ => result // no new UserIdentity session so nothing to remove
      }
    }
}
