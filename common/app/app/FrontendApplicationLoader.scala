package app

import common._
import model.{ApplicationContext, ApplicationIdentity}
import play.api.ApplicationLoader.Context
import play.api.http.HttpFilters
import play.api.libs.ws.ahc.AhcWSComponents
import play.api.mvc.{ControllerComponents, EssentialFilter}
import play.api.routing.Router
import play.filters.csrf.CSRFComponents
import controllers.AssetsComponents
import play.api.{Application, ApplicationLoader, BuiltInComponents, LoggerConfigurator}

trait FrontendApplicationLoader extends ApplicationLoader {

  def buildComponents(context: Context): FrontendComponents

  override def load(context: Context): Application = {
    LoggerConfigurator(context.environment.classLoader).foreach {
      _.configure(context.environment, context.initialConfiguration, Map.empty)
    }
    val components = buildComponents(context)
    components.startLifecycleComponents()
    components.application
  }
}

trait FrontendComponents
    extends LifecycleComponents
    with HttpFiltersComponent
    with BuiltInComponents
    with AhcWSComponents
    with CSRFComponents
    with AssetsComponents {
  self: BuiltInComponents =>

  lazy val prefix = "/"

  implicit lazy val as = actorSystem

  lazy val jobScheduler = new JobScheduler(appContext)
  lazy val akkaAsync = new AkkaAsync(environment, actorSystem)
  lazy val appMetrics = ApplicationMetrics()
  lazy val guardianConf = new GuardianConfiguration
  lazy val mode = environment.mode

  // here are the attributes you must provide for your app to start
  def appIdentity: ApplicationIdentity
  implicit def appContext: ApplicationContext = ApplicationContext(environment, appIdentity)
  def lifecycleComponents: List[LifecycleComponent]
  def router: Router
  def controllerComponents: ControllerComponents
}

trait LifecycleComponent {
  def start(): Unit
}

trait LifecycleComponents {
  def lifecycleComponents: List[LifecycleComponent]
  def startLifecycleComponents(): Unit = lifecycleComponents.foreach(_.start())
}

trait HttpFiltersComponent {
  self: BuiltInComponents =>
  lazy val playApiHttpFilters = new HttpFilters {
    override def filters: Seq[EssentialFilter] = self.httpFilters
  }
}
