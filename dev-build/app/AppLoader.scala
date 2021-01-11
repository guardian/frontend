import app.{FrontendApplicationLoader, FrontendComponents, LifecycleComponent}
import assets.DiscussionExternalAssetsLifecycle
import business.StocksDataLifecycle
import com.softwaremill.macwire._
import common.DiagnosticsLifecycle
import common.Logback.{LogbackOperationsPool, LogstashLifecycle}
import common.dfp.FaciaDfpAgentLifecycle
import conf.FootballLifecycle
import conf.switches.SwitchboardLifecycle
import contentapi.{CapiHttpClient, ContentApiClient, HttpClient, SectionsLookUpLifecycle}
import controllers._
import _root_.commercial.controllers.CommercialControllers
import _root_.commercial.CommercialLifecycle
import controllers.commercial.magento.{AccessTokenGenerator, ApiSandbox}
import cricket.conf.CricketLifecycle
import cricket.controllers.CricketControllers
import dev.DevAssetsController
import dfp.DfpDataCacheLifecycle
import feed._
import football.controllers._
import http.{CorsHttpErrorHandler, DevFilters}
import model.{AdminLifecycle, ApplicationIdentity}
import services.ophan.SurgingContentAgentLifecycle
import play.api.ApplicationLoader.Context
import play.api._
import play.api.routing.Router
import router.Routes
import rugby.conf.RugbyLifecycle
import rugby.controllers.RugbyControllers
import services._
import _root_.commercial.targeting.TargetingLifecycle
import akka.actor.ActorSystem
import concurrent.BlockingOperations

class AppLoader extends FrontendApplicationLoader {
  override def buildComponents(context: Context): FrontendComponents =
    new BuiltInComponentsFromContext(context) with AppComponents
}

trait Controllers
    extends AdminControllers
    with ApplicationsControllers
    with ArticleControllers
    with CommercialControllers
    with DiagnosticsControllers
    with DiscussionControllers
    with FaciaControllers
    with OnwardControllers
    with FootballControllers
    with RugbyControllers
    with FrontendComponents
    with CricketControllers {
  self: BuiltInComponents =>
  lazy val accessTokenGenerator = wire[AccessTokenGenerator]
  lazy val apiSandbox = wire[ApiSandbox]
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
    with ApplicationsServices {

  //Overriding conflicting members
  override lazy val ophanApi = wire[OphanApi]
  override lazy val capiHttpClient: HttpClient = wire[CapiHttpClient]
  override lazy val contentApiClient = wire[ContentApiClient]
  override lazy val blockingOperations = wire[BlockingOperations]
  lazy val logbackOperationsPool = wire[LogbackOperationsPool]

  lazy val remoteRender = wire[renderers.DotcomRenderingService]

  def actorSystem: ActorSystem
  override def router: Router = wire[Routes]
  override def appIdentity: ApplicationIdentity = ApplicationIdentity("dev-build")

  override def lifecycleComponents: List[LifecycleComponent] =
    List(
      wire[LogstashLifecycle],
      wire[AdminLifecycle],
      wire[DiagnosticsLifecycle],
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
    )

  override lazy val httpFilters = wire[DevFilters].filters
  override lazy val httpErrorHandler = wire[CorsHttpErrorHandler]
}
