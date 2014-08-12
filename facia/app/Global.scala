import common._
import conf.{Configuration, Filters}
import dev.DevParametersLifecycle
import dfp.DfpAgentLifecycle
import metrics.FrontendMetric
import ophan.SurgingContentAgentLifecycle
import play.api.mvc.WithFilters
import services.ConfigAgentLifecycle


object Global extends WithFilters(Filters.common: _*)
with ConfigAgentLifecycle
with DevParametersLifecycle
with CloudWatchApplicationMetrics
with DfpAgentLifecycle
with SurgingContentAgentLifecycle {
  override lazy val applicationName = "frontend-facia"

  override def applicationMetrics: List[FrontendMetric] = super.applicationMetrics ::: List(
    S3Metrics.S3AuthorizationError,
    ContentApiMetrics.ContentApiJsonParseExceptionMetric,
    ContentApiMetrics.ContentApiJsonMappingExceptionMetric,
    FaciaToolMetrics.InvalidContentExceptionMetric,
    FaciaMetrics.FaciaToApplicationRedirectMetric
  )

}
