import _root_.commercial.CommercialLifecycle
import _root_.commercial.controllers.CommercialControllers
import _root_.commercial.targeting.TargetingLifecycle
import org.apache.pekko.actor.{ActorSystem => PekkoActorSystem}
import agents.MostViewedAgent
import app.{FrontendApplicationLoader, FrontendComponents, LifecycleComponent}
import business.StocksDataLifecycle
import com.softwaremill.macwire._
import common.Assets.DiscussionExternalAssetsLifecycle
import common.dfp.FaciaDfpAgentLifecycle
import concurrent.BlockingOperations
import conf.FootballLifecycle
import conf.switches.SwitchboardLifecycle
import contentapi.{CapiHttpClient, ContentApiClient, HttpClient, SectionsLookUpLifecycle}
import controllers._
import cricket.conf.CricketLifecycle
import cricket.controllers.CricketControllers
import dev.DevAssetsController
import dfp.DfpDataCacheLifecycle
import feed._
import football.controllers._
import http.{CorsHttpErrorHandler, DevBuildParametersHttpRequestHandler, DevFilters}
import jobs.{MessageUsLifecycle, TopicLifecycle}
import model.{AdminLifecycle, ApplicationIdentity}
import play.api.ApplicationLoader.Context
import play.api._
import play.api.routing.Router
import router.Routes
import rugby.conf.RugbyLifecycle
import rugby.controllers.RugbyControllers
import services._
import services.newsletters.{NewsletterApi, NewsletterSignupAgent, NewsletterSignupLifecycle}
import services.ophan.SurgingContentAgentLifecycle

class AppLoader extends FrontendApplicationLoader {
  override def buildComponents(context: Context): FrontendComponents =
    new BuiltInComponentsFromContext(context) with AppComponents
}

trait Controllers
    extends AdminControllers
    with ApplicationsControllers
    with ArticleControllers
    with CommercialControllers
    with DiscussionControllers
    with FaciaControllers
    with OnwardControllers
    with FootballControllers
    with RugbyControllers
    with FrontendComponents
    with CricketControllers {
  self: BuiltInComponents =>

  def newsletterSignupAgent: NewsletterSignupAgent

  lazy val devAssetsController = wire[DevAssetsController]
  lazy val emailSignupController = wire[EmailSignupController]
  lazy val surveyPageController = wire[SurveyPageController]
  lazy val signupPageController = wire[SignupPageController]
}

trait AppComponents
    extends FrontendComponents
    with Controllers
    with AdminServices
    with SportServices
    with CommercialServices
    with DiscussionServices
    with OnwardServices
    with FapiServices
    with ApplicationsServices
    with TopicServices
    with MessageUsServices {

  //Overriding conflicting members
  override lazy val ophanApi = wire[OphanApi]
  override lazy val capiHttpClient: HttpClient = wire[CapiHttpClient]
  override lazy val contentApiClient = wire[ContentApiClient]
  override lazy val blockingOperations = wire[BlockingOperations]
  override lazy val newsletterApi = wire[NewsletterApi]
  override lazy val newsletterSignupAgent = wire[NewsletterSignupAgent]
  override lazy val mostViewedAgent = wire[MostViewedAgent]


  override lazy val optionalDevContext = new OptionalDevContext(devContext)
  override lazy val sourceMapper = devContext.map(_.sourceMapper)

  def pekkoActorSystem: PekkoActorSystem
  override def router: Router = wire[Routes]
  override def appIdentity: ApplicationIdentity = ApplicationIdentity("dev-build")

  override def lifecycleComponents: List[LifecycleComponent] =
    List(
      wire[AdminLifecycle],
      wire[OnwardJourneyLifecycle],
      wire[CommercialLifecycle],
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
      wire[TargetingLifecycle],
      wire[DiscussionExternalAssetsLifecycle],
      wire[StocksDataLifecycle],
      wire[NewsletterSignupLifecycle],
      wire[TopicLifecycle],
      wire[MostViewedLifecycle],
      wire[MessageUsLifecycle],
    )

  override lazy val httpFilters = wire[DevFilters].filters
  override lazy val httpRequestHandler = wire[DevBuildParametersHttpRequestHandler]
  override lazy val httpErrorHandler = wire[CorsHttpErrorHandler]
}
