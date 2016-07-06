import app.{FrontendComponents, FrontendApplicationLoader}
import com.softwaremill.macwire._
import commercial.CommercialLifecycle
import common.Logback.LogstashLifecycle
import common.dfp.FaciaDfpAgentLifecycle
import common.{DiagnosticsLifecycle, LifecycleComponent}
import conf.switches.SwitchboardLifecycle
import conf.FootballLifecycle
import contentapi.SectionsLookUpLifecycle
import controllers._
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
import play.api.routing.Router
import router.Routes
import rugby.conf.RugbyLifecycle
import rugby.controllers.MatchesController
import services._
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

trait Controllers
  extends AdminControllers
  with AdminJobsControllers
  with ApplicationsControllers
  with ArticleControllers
  with CommercialControllers
  with DiagnosticsControllers
  with FaciaControllers {
  self: BuiltInComponents with MostPopularComponents =>
  lazy val accessTokenGenerator = wire[AccessTokenGenerator]
  lazy val apiSandbox = wire[ApiSandbox]
  lazy val assets = wire[Assets]
  lazy val cardController = wire[CardController]
  lazy val changeAlphaController = wire[ChangeAlphaController]
  lazy val changeEditionController = wire[ChangeEditionController]
  lazy val commentCountController = wire[CommentCountController]
  lazy val commentsController = wire[CommentsController]
  lazy val competitionListController = wire[CompetitionListController]
  lazy val cricketMatchController = wire[CricketMatchController]
  lazy val ctaController = wire[CtaController]
  lazy val devAssetsController = wire[DevAssetsController]
  lazy val emailSignupController = wire[EmailSignupController]
  lazy val fixturesAndResultsContainerController = wire[FixturesAndResultsContainerController]
  lazy val fixturesController = wire[FixturesController]
  lazy val leagueTableController = wire[LeagueTableController]
  lazy val locationsController = wire[LocationsController]
  lazy val matchController = wire[MatchController]
  lazy val matchDayController = wire[MatchDayController]
  lazy val matchesController = wire[MatchesController]
  lazy val mediaInSectionController = wire[MediaInSectionController]
  lazy val moreOnMatchController = wire[MoreOnMatchController]
  lazy val mostViewedAudioController = wire[MostViewedAudioController]
  lazy val mostViewedGalleryController = wire[MostViewedGalleryController]
  lazy val mostViewedSocialController = wire[MostViewedSocialController]
  lazy val mostViewedVideoController = wire[MostViewedVideoController]
  lazy val profileActivityController = wire[ProfileActivityController]
  lazy val resultsController = wire[ResultsController]
  lazy val richLinkController = wire[RichLinkController]
  lazy val seriesController = wire[SeriesController]
  lazy val stocksController = wire[StocksController]
  lazy val surveyPageController = wire[SurveyPageController]
  lazy val techFeedbackController = wire[TechFeedbackController]
  lazy val topStoriesController = wire[TopStoriesController]
  lazy val videoEndSlateController = wire[VideoEndSlateController]
  lazy val wallchartController = wire[WallchartController]
  lazy val weatherController = wire[WeatherController]
  lazy val witnessActivityController = wire[WitnessActivityControllerImpl]
}

trait AppComponents extends FrontendComponents with Controllers with MostPopularComponents {

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
