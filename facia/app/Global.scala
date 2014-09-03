import common._
import conf.Filters
import dev.DevParametersLifecycle
import dfp.DfpAgentLifecycle
import metrics.FrontendMetric
import ophan.SurgingContentAgentLifecycle
import play.Play
import play.api.libs.json.Json
import play.api.mvc.WithFilters
import services.{ConfigAgent, ConfigAgentDefaults, ConfigAgentLifecycle}
import play.api.Application


object Global extends WithFilters(Filters.common: _*)
with ConfigAgentLifecycle
with DevParametersLifecycle
with CloudWatchApplicationMetrics
with DfpAgentLifecycle
with SurgingContentAgentLifecycle {
  override lazy val applicationName = "frontend-facia"

  override def applicationMetrics: List[FrontendMetric] = super.applicationMetrics ::: List(
    S3Metrics.S3AuthorizationError,
    FaciaMetrics.FaciaToApplicationRedirectMetric,
    ContentApiMetrics.ContentApiCircuitBreakerRequestsMetric
  )

  override def onStart(app: Application) {
    if (Play.isDev) ConfigAgent.refreshWith(Json.parse(ConfigAgentDefaults.contents))
    super.onStart(app)
  }
}
