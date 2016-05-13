package conf

import com.gu.googleauth.FilterExemption
import common.ExecutionContexts
import googleAuth.GoogleAuthFilters
import play.api.Environment
import play.api.http.HttpFilters
import play.api.mvc.{Filter, RequestHeader, Result}
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

class StandaloneFilters(
  mat: Materializer,
  env: Environment
) extends HttpFilters {

  val previewAuthFilter = new GoogleAuthFilters.AuthFilterWithExemptions(
    FilterExemptions.loginExemption,
    FilterExemptions.exemptions)(mat, env)

  val filters = previewAuthFilter :: new NoCacheFilter()(mat) :: Filters.common(mat)
}
