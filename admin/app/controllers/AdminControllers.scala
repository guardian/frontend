package controllers
import com.softwaremill.macwire._
import common.AkkaAsync
import controllers.admin._
import controllers.admin.commercial._
import controllers.cache.{ImageDecacheController, PageDecacheController}
import dfp._
import model.ApplicationContext
import play.api.http.HttpConfiguration
import play.api.libs.ws.WSClient
import play.api.mvc.ControllerComponents
import services.{OphanApi, ParameterStoreService, RedirectService}

trait AdminControllers {
  def akkaAsync: AkkaAsync
  def wsClient: WSClient
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
  def parameterStoreService: ParameterStoreService

  lazy val oAuthLoginController = wire[OAuthLoginAdminController]
  lazy val uncachedWebAssets = wire[UncachedWebAssets]
  lazy val uncachedAssets = wire[UncachedAssets]
  lazy val adminIndexController = wire[AdminIndexController]
  lazy val frontPressController = wire[FrontPressController]
  lazy val r2PressController = wire[R2PressController]
  lazy val interactiveLibrarianController = wire[InteractiveLibrarianController]
  lazy val imageDecacheController = wire[ImageDecacheController]
  lazy val pageDecacheController = wire[PageDecacheController]
  lazy val appConfigController = wire[AppConfigController]
  lazy val switchboardController = wire[SwitchboardController]
  lazy val analyticsController = wire[AnalyticsController]
  lazy val analyticsConfidenceController = wire[AnalyticsConfidenceController]
  lazy val metricsController = wire[MetricsController]
  lazy val commercialController = wire[CommercialController]
  lazy val dfpDataController = wire[DfpDataController]
  lazy val slotController = wire[SlotController]
  lazy val takeoverWithEmptyMPUsController = wire[TakeoverWithEmptyMPUsController]
  lazy val fastlyController = wire[FastlyController]
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
  lazy val commercialKPIController = wire[TeamKPIController]
}
