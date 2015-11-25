import com.gu.googleauth.{FilterExemption, UserIdentity}
import common.ExecutionContexts
import common.dfp.FaciaDfpAgentLifecycle
import conf._
import controllers.AuthCookie
import feed.OnwardJourneyLifecycle
import play.Play
import play.api.mvc.Results._
import play.api.mvc._
import rugby.conf.RugbyLifecycle
import services.ConfigAgentLifecycle

import scala.concurrent.Future

// OBVIOUSLY this is only for the preview server
// NOT to be used elsewhere...
object NoCacheFilter extends Filter with ExecutionContexts {
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
                                  exemptions: Seq[FilterExemption]) extends Filter {

    private def doNotAuthenticate(request: RequestHeader) = Play.isTest ||
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

object Global extends WithFilters(
    new PreviewAuthFilters.AuthFilterWithExemptions(
    FilterExemptions.loginExemption,
    FilterExemptions.exemptions):: NoCacheFilter :: conf.Filters.common: _*)
  with CommercialLifecycle
  with OnwardJourneyLifecycle
  with ConfigAgentLifecycle
  with FaciaDfpAgentLifecycle
  with SwitchboardLifecycle
  with FootballLifecycle
  with CricketLifecycle
  with RugbyLifecycle
