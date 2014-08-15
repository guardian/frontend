import common._
import conf.{Configuration, Filters}
import dev.DevParametersLifecycle
import dfp.DfpAgentLifecycle
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

  override def applicationMetrics: Map[String, Double] = super.applicationMetrics ++ Map(
    ("s3-authorization-error", S3Metrics.S3AuthorizationError.getAndReset.toDouble),
    ("json-parsing-error", FaciaMetrics.JsonParsingErrorCount.getAndReset.toDouble),
    ("elastic-content-api-calls", ContentApiMetrics.ElasticHttpTimingMetric.getAndReset.toDouble),
    ("elastic-content-api-timeouts", ContentApiMetrics.ElasticHttpTimeoutCountMetric.getAndReset.toDouble),
    ("content-api-client-parse-exceptions", ContentApiMetrics.ContentApiJsonParseExceptionMetric.getAndReset.toDouble),
    ("content-api-client-mapping-exceptions", ContentApiMetrics.ContentApiJsonMappingExceptionMetric.getAndReset.toDouble),
    ("content-api-invalid-content-exceptions", FaciaToolMetrics.InvalidContentExceptionMetric.getAndReset.toDouble),
    ("redirects-to-applications", FaciaMetrics.FaciaToApplicationRedirectMetric.getAndReset.toDouble)
  )

}
