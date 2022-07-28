package http

import akka.stream.Materializer
import com.gu.googleauth.{FilterExemption, UserIdentity}
import googleAuth.AuthCookie
import model.ApplicationContext
import play.api.Mode
import play.api.http.HttpConfiguration
import play.api.mvc.Results.Redirect
import play.api.mvc.{Filter, RequestHeader, Result}

import scala.concurrent.Future

object GoogleAuthFilters {
  val LOGIN_ORIGIN_KEY = "loginOriginUrl"

  class AuthFilterWithExemptions(loginUrl: FilterExemption, exemptions: Seq[FilterExemption])(implicit
      val mat: Materializer,
      context: ApplicationContext,
      httpConfiguration: HttpConfiguration,
  ) extends Filter {

    val authCookie = new AuthCookie(httpConfiguration)

    // Date: 06 July 2021
    // Author: Pascal

    // Condition [1], below, was added in July 2021, as part of posing the ground for the interactive migration.
    // It should be removed when the Interactives migration is complete, meaning when we no longer need the routes
    // POST /interactive-librarian/live-presser/*path
    // POST /interactive-librarian/read-clean-write/*path
    // in [admin].
    // Note that a slightly better solution would have been to set up a new entry in AdminFilters's FilterExemptions
    // but they do not interpret wildcards. As a consequence the next best solution is to add a migration specific
    // clause to doNotAuthenticate

    private def doNotAuthenticate(request: RequestHeader) =
      context.environment.mode == Mode.Test ||
        request.path.startsWith(loginUrl.path) ||
        request.path.startsWith("/interactive-librarian/") || // Condition [1]
        exemptions.exists(exemption => request.path.startsWith(exemption.path))

    def apply(nextFilter: (RequestHeader) => Future[Result])(request: RequestHeader): Future[Result] = {
      if (doNotAuthenticate(request)) {
        nextFilter(request)
      } else {
        authCookie.toUserIdentity(request).filter(_.isValid).orElse(UserIdentity.fromRequest(request)) match {
          case Some(identity) if identity.isValid => nextFilter(request)
          case _ =>
            Future.successful(
              Redirect(loginUrl.path)
                .addingToSession((LOGIN_ORIGIN_KEY, request.uri))(request),
            )
        }
      }
    }
  }
}
