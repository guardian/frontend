package conf

import javax.inject.Inject

import com.gu.googleauth.{UserIdentity, FilterExemption}
import common.ExecutionContexts
import controllers.AuthCookie
import play.api.{Mode, Environment}
import play.api.http.HttpFilters
import play.api.mvc.Results._
import play.api.mvc.{Result, RequestHeader, Filter}

import scala.concurrent.Future

// OBVIOUSLY this is only for the preview server
// NOT to be used elsewhere...
class NoCacheFilter extends Filter with ExecutionContexts {
  override def apply(nextFilter: (RequestHeader) => Future[Result])(request: RequestHeader): Future[Result] =
    nextFilter(request).map(_.withHeaders("Cache-Control" -> "no-cache"))
}

object FilterExemptions {

  lazy val loginExemption: FilterExemption = FilterExemption("/login")
  lazy val exemptions: Seq[FilterExemption] = List(
    FilterExemption("/oauth2callback"),
    FilterExemption("/assets"),
    FilterExemption("/favicon.ico"),
    FilterExemption("/_healthcheck"),
    FilterExemption("/2015-06-24-manifest.json"),
    // the healthcheck url
    FilterExemption("/world/2012/sep/11/barcelona-march-catalan-independence")
  )
}

object PreviewAuthFilters {
  val LOGIN_ORIGIN_KEY = "loginOriginUrl"
  class AuthFilterWithExemptions( loginUrl: FilterExemption,
    exemptions: Seq[FilterExemption])(implicit environment: Environment) extends Filter {

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

class StandaloneFilters(
    environment: Environment
) extends HttpFilters {

  val previewAuthFilter = new PreviewAuthFilters.AuthFilterWithExemptions(
    FilterExemptions.loginExemption,
    FilterExemptions.exemptions)(environment)

  val filters = previewAuthFilter :: new NoCacheFilter() :: Filters.common
}
