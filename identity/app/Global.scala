import common.{CloudWatchMetricsLifecycle, LifecycleComponent, BackwardCompatibleLifecycleComponents}
import common.Logback.LogstashLifecycle
import conf._
import conf.switches.SwitchboardLifecycle
import controllers.HealthCheck
import model.ApplicationIdentity
import play.api._
import play.api.inject.ApplicationLifecycle
import play.api.inject.guice._

import scala.concurrent.ExecutionContext

object Global extends GlobalSettings with BackwardCompatibleLifecycleComponents {

  override def lifecycleComponents(appLifecycle: ApplicationLifecycle)(implicit ec: ExecutionContext): List[LifecycleComponent] = List(
    new CloudWatchMetricsLifecycle(appLifecycle, ApplicationIdentity("frontend-identity")),
    new IdentityLifecycle(appLifecycle),
    new SwitchboardLifecycle(appLifecycle),
    LogstashLifecycle,
    new CachedHealthCheckLifeCycle(HealthCheck)
  )
}

class IdentityApplicationLoader extends GuiceApplicationLoader() {

  override def builder(context: ApplicationLoader.Context): GuiceApplicationBuilder = {
    val module = context.environment.mode match {
      case Mode.Prod => {
        if (conf.Configuration.environment.isNonProd) new PreProdModule
        else new ProdModule
      }
      case Mode.Dev => new DevModule
      case Mode.Test => new TestModule
    }
    new GuiceApplicationBuilder()
      .in(context.environment)
      .loadConfig(context.initialConfiguration)
      .bindings(module)
  }
}
