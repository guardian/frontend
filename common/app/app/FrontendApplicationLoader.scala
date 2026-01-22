package app

import common._
import common.Environment
import model.{ApplicationContext, ApplicationIdentity}
import play.api.ApplicationLoader.Context
import play.api.http.HttpFilters
import play.api.libs.ws.ahc.AhcWSComponents
import play.api.mvc.{ControllerComponents, EssentialFilter}
import play.api.routing.Router
import play.filters.csrf.CSRFComponents
import controllers.AssetsComponents
import play.api.{Application, ApplicationLoader, BuiltInComponents, LoggerConfigurator, OptionalDevContext}
import org.apache.pekko.actor.{ActorSystem => PekkoActorSystem}

trait FrontendApplicationLoader extends ApplicationLoader {

  def buildComponents(context: Context): FrontendComponents

  override def load(context: Context): Application = {
    val stage = Environment.stage
    if (System.getProperty("STAGE") == null) {
      System.setProperty("STAGE", stage)
    }

    val accessLogLevel = if (stage == "CODE") "DEBUG" else "INFO"

    LoggerConfigurator(context.environment.classLoader).foreach {
      _.configure(
        context.environment,
        context.initialConfiguration,
        Map("ACCESS_LOG_LEVEL" -> accessLogLevel),
      )
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

  implicit val pekkoActorSystem: PekkoActorSystem = PekkoActorSystem.create()
  applicationLifecycle.addStopHook(() => {
    pekkoActorSystem.terminate()
  })

  lazy val jobScheduler = new JobScheduler(appContext)
  lazy val pekkoAsync = new PekkoAsync(environment, pekkoActorSystem)
  lazy val appMetrics = ApplicationMetrics()
  lazy val guardianConf = new GuardianConfiguration
  lazy val mode = environment.mode
  lazy val optionalDevContext = new OptionalDevContext(devContext)
  override lazy val sourceMapper = devContext.map(_.sourceMapper)

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
