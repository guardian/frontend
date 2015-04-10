import ab_headlines.ABTestHeadlines
import common._
import conf.Filters
import crosswords.TodaysCrosswordGridLifecycle
import dev.DevParametersLifecycle
import dfp.DfpAgentLifecycle
import metrics.FrontendMetric
import ophan.SurgingContentAgentLifecycle
import play.api.mvc.WithFilters
import services.{IndexListingsLifecycle, ConfigAgentLifecycle}
import play.api.Application

import scala.util.{Failure, Success}

object Global extends WithFilters(Filters.common: _*)
  with ConfigAgentLifecycle
  with DevParametersLifecycle
  with CloudWatchApplicationMetrics
  with DfpAgentLifecycle
  with SurgingContentAgentLifecycle
  with IndexListingsLifecycle
  with TodaysCrosswordGridLifecycle {
  override lazy val applicationName = "frontend-facia"

  override def applicationMetrics: List[FrontendMetric] = super.applicationMetrics ::: List(
    S3Metrics.S3AuthorizationError,
    FaciaMetrics.FaciaToApplicationRedirectMetric,
    FaciaMetrics.FaciaToRssRedirectMetric,
    ContentApiMetrics.ContentApiCircuitBreakerRequestsMetric
  )

  override def onStart(app: Application): Unit = {
    ab_headlines.ABTestHeadlines.getOrRefresh onComplete {
      case Success(x) => println(x)
      case Failure(er) => println(er)
        er.printStackTrace()
    }

    super.onStart(app)
  }
}
