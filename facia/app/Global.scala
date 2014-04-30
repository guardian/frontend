import common.{FaciaToolMetrics, ContentApiMetrics, FaciaMetrics, CloudWatchApplicationMetrics}
import conf.{Management, Filters}
import controllers.front._
import dev.DevParametersLifecycle
import play.api.mvc.WithFilters


object Global extends WithFilters(Filters.common: _*) with FrontLifecycle
                                                        with DevParametersLifecycle with CloudWatchApplicationMetrics {
  override lazy val applicationName = Management.applicationName

  override def applicationMetrics: Map[String, Double] = super.applicationMetrics ++ Map(
    ("s3-authorization-error", FaciaMetrics.S3AuthorizationError.getAndReset.toDouble),
    ("json-parsing-error", FaciaMetrics.JsonParsingErrorCount.getAndReset.toDouble),
    ("elastic-content-api-calls", ContentApiMetrics.ElasticHttpTimingMetric.getAndReset.toDouble),
    ("solr-content-api-calls", ContentApiMetrics.HttpTimingMetric.getAndReset.toDouble),
    ("elastic-content-api-timeouts", ContentApiMetrics.ElasticHttpTimeoutCountMetric.getAndReset.toDouble),
    ("solr-content-api-timeouts", ContentApiMetrics.HttpTimeoutCountMetric.getAndReset.toDouble),
    ("content-api-client-parse-exceptions", ContentApiMetrics.ContentApiJsonParseExceptionMetric.getAndReset.toDouble),
    ("content-api-client-mapping-exceptions", ContentApiMetrics.ContentApiJsonMappingExceptionMetric.getAndReset.toDouble),
    ("content-api-invalid-content-exceptions", FaciaToolMetrics.InvalidContentExceptionMetric.getAndReset.toDouble)
  )

}
