import app.{FrontendComponents, FrontendApplicationLoader}
import com.softwaremill.macwire._
import common._
import common.Logback.LogstashLifecycle
import common.dfp.DfpAgentLifecycle
import conf.switches.SwitchboardLifecycle
import conf.{CachedHealthCheckLifeCycle, CommonGzipFilter}
import controllers.admin.commercial.{TakeoverWithEmptyMPUsController, SlotController, DfpDataController}
import controllers.cache.{PageDecacheController, ImageDecacheController}
import controllers.{FrontPressController, HealthCheck}
import _root_.dfp.DfpDataCacheLifecycle
import _root_.http.AdminHttpErrorHandler
import controllers.admin._
import dev.DevAssetsController
import model.{ApplicationIdentity, AdminLifecycle}
import ophan.SurgingContentAgentLifecycle
import play.api.ApplicationLoader.Context
import play.api.http.HttpErrorHandler
import play.api.mvc.EssentialFilter
import play.api.routing.Router
import play.api._
import services.ConfigAgentLifecycle
import router.Routes

class AppLoader extends FrontendApplicationLoader {
  override def buildComponents(context: Context): FrontendComponents = new BuiltInComponentsFromContext(context) with AppComponents
}

trait Controllers {
  lazy val healthCheck = wire[HealthCheck]
  lazy val oAuthLoginController = wire[OAuthLoginController]
  lazy val uncachedWebAssets = wire[UncachedWebAssets]
  lazy val uncachedAssets = wire[UncachedAssets]
  lazy val devAssetsController = wire[DevAssetsController]
  lazy val adminIndexController = wire[AdminIndexController]
  lazy val frontPressController = wire[FrontPressController]
  lazy val r2PressController = wire[R2PressController]
  lazy val apiController = wire[Api]
  lazy val imageDecacheController = wire[ImageDecacheController]
  lazy val pageDecacheController = wire[PageDecacheController]
  lazy val ophanApiController = wire[OphanApiController]
  lazy val switchboardController = wire[SwitchboardController]
  lazy val switchboardPlistaController = wire[SwitchboardPlistaController]
  lazy val analyticsController = wire[AnalyticsController]
  lazy val analyticsConfidenceController = wire[AnalyticsConfidenceController]
  lazy val contentPerformanceController = wire[ContentPerformanceController]
  lazy val metricsController = wire[MetricsController]
  lazy val whatIsDeduped = wire[WhatIsDeduped]
  lazy val commercialController = wire[CommercialController]
  lazy val dfpDataController = wire[DfpDataController]
  lazy val slotController = wire[SlotController]
  lazy val takeoverWithEmptyMPUsController = wire[TakeoverWithEmptyMPUsController]
  lazy val fastlyController = wire[FastlyController]
  lazy val radiatorController = wire[RadiatorController]
  lazy val deploysRadiatorController = wire[DeploysRadiatorControllerImpl]
  lazy val deploysNotifyController = wire[DeploysNotifyControllerImpl]
  lazy val redirectController = wire[RedirectController]
  lazy val sportTroubleShooterController = wire[SportTroubleshooterController]
  lazy val troubleshooterController = wire[TroubleshooterController]
  lazy val siteController = wire[SiteController]
  lazy val paBrowserController = wire[PaBrowserController]
  lazy val playerController = wire[PlayerController]
  lazy val tablesController = wire[TablesController]
  lazy val frontsController = wire[FrontsController]
  lazy val cssReportController = wire[CssReportController]
}

trait AdminLifecycleComponents {
  self: AppComponents with Controllers =>

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

trait AppComponents extends FrontendComponents with AdminLifecycleComponents with Controllers {

  lazy val router: Router = wire[Routes]

  lazy val appIdentity = ApplicationIdentity("frontend-admin")

  override lazy val httpErrorHandler: HttpErrorHandler = wire[AdminHttpErrorHandler]
  override lazy val httpFilters: Seq[EssentialFilter] = wire[CommonGzipFilter].filters
}
