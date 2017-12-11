package controllers
import com.softwaremill.macwire._
import common.AkkaAsync
import controllers.admin._
import controllers.admin.commercial._
import controllers.cache.{ImageDecacheController, PageDecacheController}
import dfp._
import jobs.VideoEncodingsJob
import model.ApplicationContext
import play.api.http.HttpConfiguration
import play.api.libs.ws.WSClient
import play.api.mvc.ControllerComponents
import services.{OphanApi, RedirectService}

trait AdminControllers {
  def akkaAsync: AkkaAsync
  def wsClient: WSClient
  def videoEncodingsJob: VideoEncodingsJob
  def ophanApi: OphanApi
  implicit def appContext: ApplicationContext
  def redirects: RedirectService
  def httpConfiguration: HttpConfiguration
  def controllerComponents: ControllerComponents
  def assets: Assets
  def adUnitAgent: AdUnitAgent
  def adUnitService: AdUnitService
  def advertiserAgent: AdvertiserAgent
  def creativeTemplateAgent: CreativeTemplateAgent
  def customFieldAgent: CustomFieldAgent
  def customFieldService: CustomFieldService
  def customTargetingAgent: CustomTargetingAgent
  def customTargetingService: CustomTargetingService
  def customTargetingKeyValueJob: CustomTargetingKeyValueJob
  def dataMapper: DataMapper
  def dataValidation: DataValidation
  def dfpDataCacheJob: DfpDataCacheJob
  def orderAgent: OrderAgent
  def placementAgent: PlacementAgent
  def placementService: PlacementService
  def dfpApi: DfpApi

  lazy val oAuthLoginController = wire[OAuthLoginAdminController]
  lazy val uncachedWebAssets = wire[UncachedWebAssets]
  lazy val uncachedAssets = wire[UncachedAssets]
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
  lazy val commercialController = wire[CommercialController]
  lazy val dfpDataController = wire[DfpDataController]
  lazy val slotController = wire[SlotController]
  lazy val takeoverWithEmptyMPUsController = wire[TakeoverWithEmptyMPUsController]
  lazy val fastlyController = wire[FastlyController]
  lazy val radiatorController = wire[RadiatorController]
  lazy val deploysController = wire[DeploysControllerImpl]
  lazy val redirectController = wire[RedirectController]
  lazy val sportTroubleShooterController = wire[SportTroubleshooterController]
  lazy val troubleshooterController = wire[TroubleshooterController]
  lazy val siteController = wire[SiteController]
  lazy val paBrowserController = wire[PaBrowserController]
  lazy val playerController = wire[PlayerController]
  lazy val tablesController = wire[TablesController]
  lazy val frontsController = wire[FrontsController]
  lazy val adsDotTextController = wire[AdsDotTextEditController]
}
