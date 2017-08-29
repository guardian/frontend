package http

import akka.stream.Materializer
import common.ExecutionContexts
import GoogleAuthFilters.AuthFilterWithExemptions
import controllers.HealthCheck
import googleAuth.FilterExemptions
import model.ApplicationContext
import play.api.http.{HttpConfiguration, HttpFilters}
import play.api.mvc.{Filter, RequestHeader, Result}

import scala.concurrent.Future

class PreviewFilters(httpConfiguration: HttpConfiguration, healthCheck: HealthCheck)(implicit mat: Materializer, context: ApplicationContext) extends HttpFilters {

  private val exemptionsUrls = healthCheck.healthChecks.map(_.path) ++ Seq("/2015-06-24-manifest.json")
  private val filterExemptions = new FilterExemptions(exemptionsUrls:_*)
  val previewAuthFilter = new AuthFilterWithExemptions(
    filterExemptions.loginExemption,
    filterExemptions.exemptions)(mat, context, httpConfiguration)

  val filters = previewAuthFilter :: new NoCacheFilter :: Filters.common
}

// OBVIOUSLY this is only for the preview server
// NOT to be used elsewhere...
class NoCacheFilter(implicit val mat: Materializer) extends Filter with ExecutionContexts {
  override def apply(nextFilter: (RequestHeader) => Future[Result])(request: RequestHeader): Future[Result] =
    nextFilter(request).map(_.withHeaders("Cache-Control" -> "no-cache"))
}
