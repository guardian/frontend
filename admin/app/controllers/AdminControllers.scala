package controllers
import com.softwaremill.macwire._
import common.PekkoAsync
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
  def pekkoAsync: PekkoAsync
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

  lazy val oAuthLoginController: OAuthLoginAdminController = wire[OAuthLoginAdminController]
  lazy val uncachedWebAssets: UncachedWebAssets = wire[UncachedWebAssets]
  lazy val uncachedAssets: UncachedAssets = wire[UncachedAssets]
  lazy val adminIndexController: AdminIndexController = wire[AdminIndexController]
  lazy val frontPressController: FrontPressController = wire[FrontPressController]
  lazy val r2PressController: R2PressController = wire[R2PressController]
  lazy val interactiveLibrarianController: InteractiveLibrarianController = wire[InteractiveLibrarianController]
  lazy val imageDecacheController: ImageDecacheController = wire[ImageDecacheController]
  lazy val pageDecacheController: PageDecacheController = wire[PageDecacheController]
  lazy val appConfigController: AppConfigController = wire[AppConfigController]
  lazy val switchboardController: SwitchboardController = wire[SwitchboardController]
  lazy val analyticsController: AnalyticsController = wire[AnalyticsController]
  lazy val analyticsConfidenceController: AnalyticsConfidenceController = wire[AnalyticsConfidenceController]
  lazy val metricsController: MetricsController = wire[MetricsController]
  lazy val commercialController: CommercialController = wire[CommercialController]
  lazy val dfpDataController: DfpDataController = wire[DfpDataController]
  lazy val slotController: SlotController = wire[SlotController]
  lazy val takeoverWithEmptyMPUsController: TakeoverWithEmptyMPUsController = wire[TakeoverWithEmptyMPUsController]
  lazy val fastlyController: FastlyController = wire[FastlyController]
  lazy val deploysController: DeploysControllerImpl = wire[DeploysControllerImpl]
  lazy val redirectController: RedirectController = wire[RedirectController]
  lazy val sportTroubleShooterController: SportTroubleshooterController = wire[SportTroubleshooterController]
  lazy val troubleshooterController: TroubleshooterController = wire[TroubleshooterController]
  lazy val siteController: SiteController = wire[SiteController]
  lazy val paBrowserController: PaBrowserController = wire[PaBrowserController]
  lazy val playerController: PlayerController = wire[PlayerController]
  lazy val tablesController: TablesController = wire[TablesController]
  lazy val frontsController: FrontsController = wire[FrontsController]
  lazy val adsDotTextController: AdsDotTextEditController = wire[AdsDotTextEditController]
  lazy val commercialKPIController: TeamKPIController = wire[TeamKPIController]
}
