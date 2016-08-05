package googleAuth

import akka.stream.Materializer
import play.api.Environment
import play.api.mvc.RequestHeader
import play.api.Mode
import com.gu.googleauth.{FilterExemption, UserIdentity}
import play.api.mvc.{Filter, Result}
import play.api.mvc.Results.Redirect

import scala.concurrent.Future

object GoogleAuthFilters {
  val LOGIN_ORIGIN_KEY = "loginOriginUrl"
  class AuthFilterWithExemptions( loginUrl: FilterExemption,
                                  exemptions: Seq[FilterExemption])(implicit val mat: Materializer, environment: Environment) extends Filter {

    private def doNotAuthenticate(request: RequestHeader) = environment.mode == Mode.Test ||
      request.path.startsWith(loginUrl.path) ||
      exemptions.exists(exemption => request.path.startsWith(exemption.path))

    def apply(nextFilter: (RequestHeader) => Future[Result]) (request: RequestHeader): Future[Result] = {
      if (doNotAuthenticate(request)) {
        nextFilter(request)
      } else {
        AuthCookie.toUserIdentity(request).filter(_.isValid).orElse(UserIdentity.fromRequest(request)) match {
          case Some(identity) if identity.isValid => nextFilter(request)
          case otherIdentity =>
            Future.successful(Redirect(loginUrl.path)
              .addingToSession((LOGIN_ORIGIN_KEY, request.uri))(request))
        }
      }
    }
  }
}
