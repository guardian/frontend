import common._
import conf.Filters
import dev.DevParametersLifecycle
import dfp.DfpAgentLifecycle
import metrics.FrontendMetric
import ophan.SurgingContentAgentLifecycle
import play.Play
import play.api.libs.json.Json
import play.api.mvc.WithFilters
import services.{IndexListingsLifecycle, ConfigAgent, ConfigAgentDefaults, ConfigAgentLifecycle}
import play.api.Application
import liveblogs.LatestBlocks

object Global extends WithFilters(Filters.common: _*)
  with ConfigAgentLifecycle
  with DevParametersLifecycle
  with CloudWatchApplicationMetrics
  with DfpAgentLifecycle
  with SurgingContentAgentLifecycle
  with IndexListingsLifecycle {
  override lazy val applicationName = "frontend-facia"

  override def applicationMetrics: List[FrontendMetric] = super.applicationMetrics ::: List(
    S3Metrics.S3AuthorizationError,
    FaciaMetrics.FaciaToApplicationRedirectMetric,
    ContentApiMetrics.ContentApiCircuitBreakerRequestsMetric
  )

  override def onStart(app: Application) {
    LatestBlocks.start()
    if (Play.isDev) ConfigAgent.refreshWith(Json.parse(ConfigAgentDefaults.contents))
    super.onStart(app)
  }

  override def onStop(app: Application): Unit = {
    LatestBlocks.stop()
    super.onStop(app)
  }
}
