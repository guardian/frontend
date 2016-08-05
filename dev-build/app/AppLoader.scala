import app.{LifecycleComponent, FrontendComponents, FrontendApplicationLoader}
import com.softwaremill.macwire._
import commercial.CommercialLifecycle
import common.Logback.LogstashLifecycle
import common.dfp.FaciaDfpAgentLifecycle
import common.DiagnosticsLifecycle
import conf.switches.SwitchboardLifecycle
import conf.FootballLifecycle
import contentapi.SectionsLookUpLifecycle
import controllers._
import controllers.commercial._
import controllers.commercial.magento.{ApiSandbox, AccessTokenGenerator}
import cricket.conf.CricketLifecycle
import cricket.controllers.CricketControllers
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
import rugby.controllers.RugbyControllers
import services._

class AppLoader extends FrontendApplicationLoader {
  override def buildComponents(context: Context): FrontendComponents = new BuiltInComponentsFromContext(context) with AppComponents
}

trait Controllers
  extends AdminControllers
  with AdminJobsControllers
  with ApplicationsControllers
  with ArticleControllers
  with CommercialControllers
  with DiagnosticsControllers
  with DiscussionControllers
  with FaciaControllers
  with OnwardControllers
  with FootballControllers
  with RugbyControllers
  with CricketControllers {
  self: BuiltInComponents =>
  lazy val accessTokenGenerator = wire[AccessTokenGenerator]
  lazy val apiSandbox = wire[ApiSandbox]
  lazy val assets = wire[Assets]
  lazy val devAssetsController = wire[DevAssetsController]
  lazy val emailSignupController = wire[EmailSignupController]
  lazy val surveyPageController = wire[SurveyPageController]
}

trait AppComponents
  extends FrontendComponents
  with Controllers
  with AdminServices
  with SportServices
  with CommercialServices
  with DiscussionServices
  with FapiServices
  with AdminJobsServices {

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
