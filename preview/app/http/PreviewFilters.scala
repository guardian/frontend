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

  val filters = previewAuthFilter :: new NoCacheFilter :: new ContentSecurityPolicyFilter :: Filters.common(
    frontend.preview.BuildInfo,
  )
}

// OBVIOUSLY this is only for the preview server
// NOT to be used elsewhere...
class NoCacheFilter(implicit val mat: Materializer, executionContext: ExecutionContext) extends Filter {
  override def apply(nextFilter: (RequestHeader) => Future[Result])(request: RequestHeader): Future[Result] =
    nextFilter(request).map(_.withHeaders("Cache-Control" -> "no-cache"))
}

// This should be kept up to date with the prod configured in VCL (fastly-edge-cache repo).
// We don't have fastly or a cache in front of `preview.gutools.co.uk` as it provisioned in CloudFormation in the `platform` repo (private):
// https://github.com/guardian/platform/blob/main/provisioning/cloudformation/frontend.yaml#L824
class ContentSecurityPolicyFilter(implicit val mat: Materializer, executionContext: ExecutionContext) extends Filter {
  override def apply(nextFilter: (RequestHeader) => Future[Result])(request: RequestHeader): Future[Result] =
    nextFilter(request).map(
      _.withHeaders(
        "Content-Security-Policy" -> "default-src https:; script-src https: 'unsafe-inline' 'unsafe-eval' blob: 'unsafe-inline'; frame-src https: data:; style-src https: 'unsafe-inline'; img-src https: data: blob:; media-src https: data: blob:; font-src https: data:; connect-src https: wss: blob:; child-src https: blob:; object-src 'none'; base-uri https://*.gracenote.com",
      ),
    )
}
