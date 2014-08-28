import com.gu.googleauth.{FilterExemption, GoogleAuthFilters}
import common.ExecutionContexts
import conf.Filters
import dfp.DfpAgentLifecycle
import feed.OnwardJourneyLifecycle
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

object Global extends WithFilters(
  new GoogleAuthFilters.AuthFilterWithExemptions(
    FilterExemptions.loginExemption,
    FilterExemptions.exemptions) :: Filters.common: _*) with CommercialLifecycle
                                                        with OnwardJourneyLifecycle
                                                        with ConfigAgentLifecycle
                                                        with DfpAgentLifecycle
