import common.CloudWatchApplicationMetrics
import conf.{Management, RequestMeasurementMetrics}
import dev.DevParametersLifecycle
import feed.{OnwardJourneyLifecycle, MostReadLifecycle}
import play.api.mvc.WithFilters

object Global extends WithFilters(RequestMeasurementMetrics.asFilters: _*) with OnwardJourneyLifecycle
                                                                           with MostReadLifecycle
                                                                           with DevParametersLifecycle
                                                                           with CloudWatchApplicationMetrics{
  override lazy val applicationName = Management.applicationName
}