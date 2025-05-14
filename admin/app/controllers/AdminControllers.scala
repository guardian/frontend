package controllers
import com.amazonaws.regions.Regions
import com.amazonaws.services.s3.AmazonS3ClientBuilder
import com.softwaremill.macwire._
import common.PekkoAsync
import controllers.admin._
import controllers.admin.commercial._
import controllers.cache.{ImageDecacheController, PageDecacheController}
import dfp._
import http.{GuardianAuthWithExemptions, routes}
import model.ApplicationContext
import play.api.http.HttpConfiguration
import play.api.libs.ws.WSClient
import play.api.mvc.ControllerComponents
import services.{OphanApi, ParameterStoreService, RedirectService}
import conf.Configuration.aws.mandatoryCredentials
import org.apache.pekko.stream.Materializer

trait AdminControllers {
  def pekkoAsync: PekkoAsync
  def wsClient: WSClient
  def ophanApi: OphanApi
  implicit def materializer: Materializer
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

  private lazy val s3Client = AmazonS3ClientBuilder
    .standard()
    .withRegion(Regions.EU_WEST_1)
    .withCredentials(
      mandatoryCredentials,
    )
    .build()

  lazy val auth = new GuardianAuthWithExemptions(
    controllerComponents,
    wsClient,
    toolsDomainPrefix = "frontend",
    oauthCallbackPath = routes.GuardianAuthWithExemptions.oauthCallback.path,
    s3Client,
    system = "frontend-admin",
    extraDoNotAuthenticatePathPrefixes = Seq(
      // Date: 06 July 2021
      // Author: Pascal
      // Added as part of posing the ground for the interactive migration.
      // It should be removed when the Interactives migration is complete, meaning when we no longer need the routes
      // POST /interactive-librarian/live-presser/*path
      // POST /interactive-librarian/read-clean-write/*path
      // in [admin].
      "/interactive-librarian/",
    ),
    requiredEditorialPermissionName = "admin_tool_access",
  )

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
  lazy val takeoverWithEmptyMPUsController = wire[TakeoverWithEmptyMPUsController]
  lazy val fastlyController = wire[FastlyController]
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
