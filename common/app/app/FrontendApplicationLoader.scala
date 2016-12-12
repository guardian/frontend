package app

import akka.actor.ActorSystem
import common._
import model.ApplicationIdentity
import play.api.ApplicationLoader.Context
import play.api._
import play.api.http.HttpFilters
import play.api.inject.{NewInstanceInjector, SimpleInjector, Injector}
import play.api.libs.ws.ahc.AhcWSComponents
import play.api.mvc.EssentialFilter
import play.api.routing.Router
import play.filters.csrf.CSRFComponents

import scala.concurrent.ExecutionContext

trait FrontendApplicationLoader extends ApplicationLoader {

  def buildComponents(context: Context): FrontendComponents

  // this is a workaround the lifecycle issue: "There is no started Application"
  // When starting lifecycles, it's possible the code hit a point where we use Play.current, directly or via WS and akka.system.
  // If that happen before the application is actually started by Play (see ProdServerStart.scala), we will get an error at runtime
  // This workaround should be removed when we migrated to Play2.5 or when we got rid of all the deprecated calls to Play.current
  def fakeOnStart(components: FrontendComponents): Unit = Play.maybeApplication match {
    case Some(_) => components.startLifecycleComponents()
    case None => components.akkaAsync.after1s(fakeOnStart(components))
  }

  override def load(context: Context): Application = {
    LoggerConfigurator(context.environment.classLoader).foreach {
      _.configure(context.environment)
    }
    val components = buildComponents(context)
    fakeOnStart(components)
    components.application
  }
}

trait FrontendComponents
  extends LifecycleComponents
  with ExecutionContextComponent
  with HttpFiltersComponent
  with BuiltInComponents
  with AhcWSComponents
  with CSRFComponents {
  self: BuiltInComponents =>

  lazy val prefix = "/"

  implicit lazy val as = actorSystem

  lazy val jobScheduler = new JobScheduler(environment)
  lazy val akkaAsync = new AkkaAsync(environment, actorSystem)
  lazy val appMetrics = ApplicationMetrics()
  lazy val guardianConf = new GuardianConfiguration
  lazy val mode = environment.mode

  // here are the attributes you must provide for your app to start
  def appIdentity: ApplicationIdentity
  def lifecycleComponents: List[LifecycleComponent]
  def router: Router
}

trait LifecycleComponent {
  def start(): Unit
}

trait LifecycleComponents {
  def lifecycleComponents: List[LifecycleComponent]
  def startLifecycleComponents(): Unit = lifecycleComponents.foreach(_.start())
}

trait ExecutionContextComponent {
  self: BuiltInComponents =>
  implicit lazy val executionContext: ExecutionContext = actorSystem.dispatcher
}

trait HttpFiltersComponent {
  self: BuiltInComponents =>
  lazy val playApiHttpFilters = new HttpFilters {
    override def filters: Seq[EssentialFilter] = self.httpFilters
  }
}
