import app.{LifecycleComponent, FrontendComponents, FrontendApplicationLoader}
import com.softwaremill.macwire._
import common._
import common.Logback.LogstashLifecycle
import common.dfp.DfpAgentLifecycle
import conf.switches.SwitchboardLifecycle
import conf.{AdminFilters, CachedHealthCheckLifeCycle, CommonGzipFilter}
import controllers.{AdminControllers, HealthCheck}
import _root_.dfp.DfpDataCacheLifecycle
import http.AdminHttpErrorHandler
import dev.DevAssetsController
import football.feed.MatchDayRecorder
import jobs.{FastlyCloudwatchLoadJob, R2PagePressJob, VideoEncodingsJob}
import model.{AdminLifecycle, ApplicationIdentity}
import ophan.SurgingContentAgentLifecycle
import play.api.ApplicationLoader.Context
import play.api.http.HttpErrorHandler
import play.api.mvc.EssentialFilter
import play.api.routing.Router
import play.api._
import play.api.libs.ws.WSClient
import services.{ConfigAgentLifecycle, FastlyStatisticService, EmailService}
import router.Routes

class AppLoader extends FrontendApplicationLoader {
  override def buildComponents(context: Context): FrontendComponents = new BuiltInComponentsFromContext(context) with AppComponents
}

trait AdminServices {
  def wsClient: WSClient
  def akkaAsync: AkkaAsync
  lazy val emailService = wire[EmailService]
  lazy val fastlyStatisticService = wire[FastlyStatisticService]
  lazy val fastlyCloudwatchLoadJob = wire[FastlyCloudwatchLoadJob]
  lazy val r2PagePressJob = wire[R2PagePressJob]
  lazy val videoEncodingsJob = wire[VideoEncodingsJob]
  lazy val matchDayRecorder = wire[MatchDayRecorder]
}

trait Controllers extends AdminControllers {
  def wsClient: WSClient
  lazy val healthCheck = wire[HealthCheck]
  lazy val devAssetsController = wire[DevAssetsController]
}

trait AdminLifecycleComponents {
  self: AppComponents with Controllers with AdminServices =>

  override lazy val lifecycleComponents: List[LifecycleComponent] = List(
    wire[LogstashLifecycle],
    wire[AdminLifecycle],
    wire[ConfigAgentLifecycle],
    wire[SwitchboardLifecycle],
    wire[CloudWatchMetricsLifecycle],
    wire[SurgingContentAgentLifecycle],
    wire[DfpAgentLifecycle],
    wire[DfpDataCacheLifecycle],
    wire[CachedHealthCheckLifeCycle]
  )
}

trait AppComponents extends FrontendComponents with AdminLifecycleComponents with Controllers with AdminServices {

  lazy val router: Router = wire[Routes]

  lazy val appIdentity = ApplicationIdentity("frontend-admin")

  override lazy val httpErrorHandler: HttpErrorHandler = wire[AdminHttpErrorHandler]
  override lazy val httpFilters: Seq[EssentialFilter] = wire[CommonGzipFilter].filters ++ wire[AdminFilters].filters
}
