package app

import common.{ApplicationMetrics, AkkaAsync, JobScheduler, LifecycleComponent}
import model.ApplicationIdentity
import play.api.ApplicationLoader.Context
import play.api._
import play.api.http.HttpFilters
import play.api.inject.{NewInstanceInjector, SimpleInjector, Injector}
import play.api.libs.ws.ning.NingWSComponents
import play.api.mvc.EssentialFilter
import play.api.routing.Router

import scala.concurrent.ExecutionContext

trait FrontendApplicationLoader extends ApplicationLoader {

  def buildComponents(context: Context): FrontendComponents

  override def load(context: Context): Application = {
    Logger.configure(context.environment)
    val components = buildComponents(context)
    components.startLifecycleComponents()
    components.application
  }
}

trait FrontendComponents
  extends LifecycleComponents
  with ExecutionContextComponent
  with HttpFiltersComponent
  with BuiltInComponents
  with NingWSComponents {

  lazy val prefix = "/"

  lazy val jobScheduler = new JobScheduler(environment)
  lazy val akkaAsync = new AkkaAsync(environment, actorSystem)
  lazy val appMetrics = ApplicationMetrics()

  // this is a workaround to make wsapi and the actorsystem available to the injector.
  // I'm forced to do that as we still use Ws.url and Akka.system(app) *everywhere*, and both directly get the reference from the injector
  override lazy val injector: Injector = new SimpleInjector(NewInstanceInjector) + router + crypto + httpConfiguration + wsApi + actorSystem

  // here are the attributes you must provide for your app to start
  def appIdentity: ApplicationIdentity
  def lifecycleComponents: List[LifecycleComponent]
  def router: Router
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
