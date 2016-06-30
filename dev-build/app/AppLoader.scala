import app.{FrontendComponents, FrontendApplicationLoader}
import com.softwaremill.macwire._
import commercial.CommercialLifecycle
import common.Logback.LogstashLifecycle
import common.dfp.FaciaDfpAgentLifecycle
import common.{DiagnosticsLifecycle, LifecycleComponent}
import conf.switches.SwitchboardLifecycle
import conf.FootballLifecycle
import contentapi.SectionsLookUpLifecycle
import controllers.admin._
import controllers._
import controllers.admin.commercial.{TakeoverWithEmptyMPUsController, SlotController, DfpDataController}
import controllers.commercial._
import controllers.commercial.magento.{ApiSandbox, AccessTokenGenerator}
import cricket.conf.CricketLifecycle
import dev.DevAssetsController
import dfp.DfpDataCacheLifecycle
import feed._
import football.controllers._
import headlines.ABHeadlinesLifecycle
import http.{CorsHttpErrorHandler, DevBuildParametersHttpRequestHandler, DevFilters}
import model.{AdminLifecycle, ApplicationIdentity}
import ophan.SurgingContentAgentLifecycle
import play.api.ApplicationLoader.Context
import play.api._
import play.api.libs.ws.ning.NingWSComponents
import play.api.routing.Router
import router.Routes
import rugby.conf.RugbyLifecycle
import rugby.controllers.MatchesController
import services.{OphanApi, NewspaperBookSectionTagAgent, NewspaperBookTagAgent, ConfigAgentLifecycle}
import weather.controllers.{WeatherController, LocationsController}

class AppLoader extends FrontendApplicationLoader {
  override def buildComponents(context: Context): FrontendComponents = new BuiltInComponentsFromContext(context) with AppComponents
}

trait MostPopularComponents {
  self: BuiltInComponents =>
  lazy val mostPopularController = wire[MostPopularController]
  lazy val popularInTag = wire[PopularInTag]
  lazy val relatedController = wire[RelatedController]
  lazy val taggedContentController = wire[TaggedContentController]
}

trait PublicationComponents {
  self: BuiltInComponents =>
  lazy val bookAgent: NewspaperBookTagAgent = wire[NewspaperBookTagAgent]
  lazy val bookSectionAgent: NewspaperBookSectionTagAgent = wire[NewspaperBookSectionTagAgent]
  lazy val publicationController = wire[PublicationController]
}

trait Controllers {
  self: BuiltInComponents with PublicationComponents with MostPopularComponents =>
  lazy val accessTokenGenerator = wire[AccessTokenGenerator]
  lazy val adminIndexController = wire[AdminIndexController]
  lazy val allIndexController = wire[AllIndexController]
  lazy val analyticsConfidenceController = wire[AnalyticsConfidenceController]
  lazy val analyticsController = wire[AnalyticsController]
  lazy val api = wire[Api]
  lazy val apiSandbox = wire[ApiSandbox]
  lazy val articleController = wire[ArticleController]
  lazy val assets = wire[Assets]
  lazy val bookOffersController = wire[BookOffersController]
  lazy val cardController = wire[CardController]
  lazy val changeAlphaController = wire[ChangeAlphaController]
  lazy val changeEditionController = wire[ChangeEditionController]
  lazy val commentCountController = wire[CommentCountController]
  lazy val commentsController = wire[CommentsController]
  lazy val commercialController = wire[CommercialController]
  lazy val competitionListController = wire[CompetitionListController]
  lazy val contentApiOffersController = wire[ContentApiOffersController]
  lazy val contentPerformanceController = wire[ContentPerformanceController]
  lazy val creativeTestPage = wire[CreativeTestPage]
  lazy val cricketMatchController = wire[CricketMatchController]
  lazy val crosswordPageController = wire[CrosswordPageController]
  lazy val crosswordSearchController = wire[CrosswordSearchController]
  lazy val cssReportController = wire[CssReportController]
  lazy val ctaController = wire[CtaController]
  lazy val dedupedController = wire[DedupedController]
  lazy val deploysRadiatorController = wire[DeploysRadiatorControllerImpl]
  lazy val devAssetsController = wire[DevAssetsController]
  lazy val dfpDataController = wire[DfpDataController]
  lazy val diagnosticsController = wire[DiagnosticsController]
  lazy val emailSignupController = wire[EmailSignupController]
  lazy val embedController = wire[EmbedController]
  lazy val faciaController = wire[FaciaControllerImpl]
  lazy val fastlyController = wire[FastlyController]
  lazy val fixturesAndResultsContainerController = wire[FixturesAndResultsContainerController]
  lazy val fixturesController = wire[FixturesController]
  lazy val frontsController = wire[FrontsController]
  lazy val galleryController = wire[GalleryController]
  lazy val hostedContentController = wire[HostedContentController]
  lazy val imageContentController = wire[ImageContentController]
  lazy val indexController = wire[IndexController]
  lazy val interactiveController = wire[InteractiveController]
  lazy val jobsController = wire[JobsController]
  lazy val latestIndexController = wire[LatestIndexController]
  lazy val leagueTableController = wire[LeagueTableController]
  lazy val liveEventsController = wire[LiveEventsController]
  lazy val locationsController = wire[LocationsController]
  lazy val masterclassesController = wire[MasterclassesController]
  lazy val matchController = wire[MatchController]
  lazy val matchDayController = wire[MatchDayController]
  lazy val matchesController = wire[MatchesController]
  lazy val mediaController = wire[MediaController]
  lazy val mediaInSectionController = wire[MediaInSectionController]
  lazy val metricsController = wire[MetricsController]
  lazy val moneyOffers = wire[MoneyOffers]
  lazy val moreOnMatchController = wire[MoreOnMatchController]
  lazy val mostViewedAudioController = wire[MostViewedAudioController]
  lazy val mostViewedGalleryController = wire[MostViewedGalleryController]
  lazy val mostViewedSocialController = wire[MostViewedSocialController]
  lazy val mostViewedVideoController = wire[MostViewedVideoController]
  lazy val multi = wire[Multi]
  lazy val newsAlertController = wire[NewsAlertControllerImpl]
  lazy val newspaperController = wire[NewspaperController]
  lazy val notificationsController = wire[NotificationsController]
  lazy val oAuthLoginController = wire[OAuthLoginController]
  lazy val ophanApiController = wire[OphanApiController]
  lazy val paBrowserController = wire[PaBrowserController]
  lazy val paidContentCardController = wire[PaidContentCardController]
  lazy val playerController = wire[PlayerController]
  lazy val preferencesController = wire[PreferencesController]
  lazy val profileActivityController = wire[ProfileActivityController]
  lazy val quizController = wire[QuizController]
  lazy val r2PressController = wire[R2PressController]
  lazy val radiatorController = wire[RadiatorController]
  lazy val redirectController = wire[RedirectController]
  lazy val resultsController = wire[ResultsController]
  lazy val richLinkController = wire[RichLinkController]
  lazy val seriesController = wire[SeriesController]
  lazy val shortUrlsController = wire[ShortUrlsController]
  lazy val siteController = wire[SiteController]
  lazy val siteMapController = wire[SiteMapController]
  lazy val slotController = wire[SlotController]
  lazy val soulmatesController = wire[SoulmatesController]
  lazy val sportTroubleshooterController = wire[SportTroubleshooterController]
  lazy val stocksController = wire[StocksController]
  lazy val switchboardController = wire[SwitchboardController]
  lazy val switchboardPlistaController = wire[SwitchboardPlistaController]
  lazy val tablesController = wire[TablesController]
  lazy val tagIndexController = wire[TagIndexController]
  lazy val takeoverWithEmptyMPUsController = wire[TakeoverWithEmptyMPUsController]
  lazy val techFeedbackController = wire[TechFeedbackController]
  lazy val topStoriesController = wire[TopStoriesController]
  lazy val travelOffersController = wire[TravelOffersController]
  lazy val troubleshooterController = wire[TroubleshooterController]
  lazy val uncachedAssets = wire[UncachedAssets]
  lazy val uncachedWebAssets = wire[UncachedWebAssets]
  lazy val videoEndSlateController = wire[VideoEndSlateController]
  lazy val wallchartController = wire[WallchartController]
  lazy val weatherController = wire[WeatherController]
  lazy val webAppController = wire[WebAppController]
  lazy val whatIsDeduped = wire[WhatIsDeduped]
  lazy val witnessActivityController = wire[WitnessActivityControllerImpl]
}

trait AppComponents extends FrontendComponents with Controllers with PublicationComponents with MostPopularComponents {

  override def router: Router = wire[Routes]
  override def appIdentity: ApplicationIdentity = ApplicationIdentity("dev-build")

  override def lifecycleComponents: List[LifecycleComponent] = List(
    wire[LogstashLifecycle],
    wire[AdminLifecycle],
    wire[DiagnosticsLifecycle],
    wire[OnwardJourneyLifecycle],
    wire[CommercialLifecycle],
    wire[MostReadLifecycle],
    wire[DfpDataCacheLifecycle],
    wire[FaciaDfpAgentLifecycle],
    wire[ConfigAgentLifecycle],
    wire[SurgingContentAgentLifecycle],
    wire[SectionsLookUpLifecycle],
    wire[MostPopularFacebookAutoRefreshLifecycle],
    wire[SwitchboardLifecycle],
    wire[FootballLifecycle],
    wire[CricketLifecycle],
    wire[RugbyLifecycle],
    wire[ABHeadlinesLifecycle]
  )

  override lazy val httpFilters = wire[DevFilters].filters
  override lazy val httpRequestHandler = wire[DevBuildParametersHttpRequestHandler]
  override lazy val httpErrorHandler = wire[CorsHttpErrorHandler]
}
