import common.{LifecycleComponent, BackwardCompatibleLifecycleComponents, CloudWatchApplicationMetrics}
import common.Logback.Logstash
import conf._
import conf.switches.SwitchboardLifecycle
import controllers.HealthCheck
import play.api._
import play.api.inject.ApplicationLifecycle
import play.api.inject.guice._
import utils.SafeLogging

import scala.concurrent.ExecutionContext

object Global extends GlobalSettings with BackwardCompatibleLifecycleComponents
  with SafeLogging
  with CloudWatchApplicationMetrics
  with SwitchboardLifecycle
  with Logstash {

  override lazy val applicationName = "frontend-identity"

  override def lifecycleComponents(appLifecycle: ApplicationLifecycle)(implicit ec: ExecutionContext): List[LifecycleComponent] = List(
    new InjectedCachedHealthCheckLifeCycle(HealthCheck),
    new IdentityLifecycle(appLifecycle)
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
