package http

import org.apache.pekko.stream.Materializer
import play.api.mvc.{Filter, RequestHeader, Result}

import scala.concurrent.{ExecutionContext, Future}

// This should be kept up to date with the prod configured in VCL (fastly-edge-cache repo).
// We don't have fastly or a cache in front of `preview.gutools.co.uk` as it provisioned in CloudFormation in the `platform` repo (private):
// https://github.com/guardian/platform/blob/main/provisioning/cloudformation/frontend.yaml#L824
class PreviewContentSecurityPolicyFilter(implicit val mat: Materializer, executionContext: ExecutionContext)
    extends Filter {
  override def apply(nextFilter: (RequestHeader) => Future[Result])(request: RequestHeader): Future[Result] =
    nextFilter(request).map(
      _.withHeaders(
        "Content-Security-Policy" -> "default-src https:; script-src https: 'unsafe-inline' 'unsafe-eval' blob: 'unsafe-inline'; frame-src https: data:; style-src https: 'unsafe-inline'; img-src https: data: blob:; media-src https: data: blob:; font-src https: https://cdn.braze.eu data:; connect-src https: wss: blob:; child-src https: blob:; object-src 'none'; base-uri https://*.gracenote.com",
      ),
    )
}
