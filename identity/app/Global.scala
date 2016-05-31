import common.CloudWatchApplicationMetrics
import common.Logback.Logstash
import conf._
import conf.switches.SwitchboardLifecycle
import play.api._
import play.api.inject.guice._
import utils.SafeLogging

object Global extends SafeLogging
  with CloudWatchApplicationMetrics
  with IdentityLifecycle
  with SwitchboardLifecycle
  with Logstash
  with IdentityHealthCheckLifeCycle {

  override lazy val applicationName = "frontend-identity"
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
