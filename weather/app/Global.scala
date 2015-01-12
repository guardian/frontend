import common.{WeatherMetrics, CanonicalLink, CloudWatchApplicationMetrics}
import conf.Filters
import dev.DevParametersLifecycle
import metrics.FrontendMetric
import play.api.mvc.WithFilters

object Global extends WithFilters(Filters.common: _*)
  with DevParametersLifecycle
  with CloudWatchApplicationMetrics
  with CorsErrorHandler {
  override lazy val applicationName = "frontend-weather"

  override def applicationMetrics: List[FrontendMetric] = super.applicationMetrics ++ List(
    WeatherMetrics.whatIsMyCityRequests
  )

  override val allowedParams: Seq[String] =
    CanonicalLink.significantParams ++ commercialParams ++ insignificantParams ++ Seq("query")
}
