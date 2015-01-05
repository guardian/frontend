import common.{CanonicalLink, CloudWatchApplicationMetrics}
import conf.Filters
import dev.DevParametersLifecycle
import play.api.mvc.WithFilters

object Global extends WithFilters(Filters.common: _*)
  with DevParametersLifecycle
  with CloudWatchApplicationMetrics {
  override lazy val applicationName = "frontend-weather"

  override val allowedParams: Seq[String] =
    CanonicalLink.significantParams ++ commercialParams ++ insignificantParams ++ Seq("query")
}
