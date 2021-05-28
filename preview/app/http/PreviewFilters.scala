package http

import akka.stream.Materializer
import GoogleAuthFilters.AuthFilterWithExemptions
import controllers.HealthCheck
import googleAuth.FilterExemptions
import model.ApplicationContext
import play.api.http.{HttpConfiguration, HttpFilters}
import play.api.mvc.{Filter, RequestHeader, Result}

import scala.concurrent.{ExecutionContext, Future}

class PreviewFilters(
    httpConfiguration: HttpConfiguration,
    healthCheck: HealthCheck,
)(implicit mat: Materializer, applicationContext: ApplicationContext, executionContext: ExecutionContext)
    extends HttpFilters {

  private val exemptionsUrls = healthCheck.healthChecks.map(_.path)
  private val filterExemptions = new FilterExemptions(exemptionsUrls: _*)
  val previewAuthFilter = new AuthFilterWithExemptions(filterExemptions.loginExemption, filterExemptions.exemptions)(
    mat,
    applicationContext,
    httpConfiguration,
  )

  val filters = previewAuthFilter :: new NoCacheFilter :: Filters.common
}

// OBVIOUSLY this is only for the preview server
// NOT to be used elsewhere...
class NoCacheFilter(implicit val mat: Materializer, executionContext: ExecutionContext) extends Filter {
  override def apply(nextFilter: (RequestHeader) => Future[Result])(request: RequestHeader): Future[Result] =
    nextFilter(request).map(_.withHeaders("Cache-Control" -> "no-cache"))
}
