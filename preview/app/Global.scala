import com.gu.googleauth.{UserIdentity, FilterExemption, GoogleAuthFilters}
import common.ExecutionContexts
import conf.{Switches, Filters}
import dfp.DfpAgentLifecycle
import feed.OnwardJourneyLifecycle
import play.Play
import play.api.mvc.Results._
import play.api.mvc._
import scala.concurrent.Future
import services.ConfigAgentLifecycle

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
    FilterExemption("/world/2012/sep/11/barcelona-march-catalan-independence")
  )
}

object PreviewAuthFilters {
  val LOGIN_ORIGIN_KEY = "loginOriginUrl"
  class AuthFilterWithExemptions(
                                  loginUrl: FilterExemption,
                                  exemptions: Seq[FilterExemption]) extends Filter {

    def apply(nextFilter: (RequestHeader) => Future[Result])
             (requestHeader: RequestHeader): Future[Result] = {

      if (Play.isTest || requestHeader.path.startsWith(loginUrl.path) || Switches.EnableOauthOnPreview.isSwitchedOff ||
        exemptions.exists(exemption => requestHeader.path.startsWith(exemption.path)))
        nextFilter(requestHeader)
      else {
        UserIdentity.fromRequest(requestHeader) match {
          case Some(identity) if identity.isValid => nextFilter(requestHeader)
          case otherIdentity =>
            Future.successful(Redirect(loginUrl.path)
              .addingToSession((LOGIN_ORIGIN_KEY, requestHeader.uri))(requestHeader))
        }
      }
    }
  }
}

object Global extends WithFilters(
  new PreviewAuthFilters.AuthFilterWithExemptions(
    FilterExemptions.loginExemption,
    FilterExemptions.exemptions):: NoCacheFilter :: Filters.common: _*) with CommercialLifecycle
                                                        with OnwardJourneyLifecycle
                                                        with ConfigAgentLifecycle
                                                        with DfpAgentLifecycle
