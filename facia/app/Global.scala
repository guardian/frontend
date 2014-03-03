import common.{FaciaMetrics, CloudWatchApplicationMetrics}
import conf.{Management, RequestMeasurementMetrics}
import controllers.front._
import dev.DevParametersLifecycle
import play.api.mvc.WithFilters


object Global extends WithFilters(RequestMeasurementMetrics.asFilters: _*) with FrontLifecycle
                                                        with DevParametersLifecycle with CloudWatchApplicationMetrics {
  override lazy val applicationName = Management.applicationName

  override def applicationMetrics: Map[String, Double] = Map(
    ("s3-authorization-error", FaciaMetrics.S3AuthorizationError.getAndReset.toDouble),
    ("json-parsing-error", FaciaMetrics.JsonParsingErrorCount.getAndReset.toDouble)
  )

}
