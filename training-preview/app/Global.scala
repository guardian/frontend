import common.LifecycleComponent
import conf.CachedHealthCheckLifeCycle
import controllers.HealthCheck
import play.api.inject.ApplicationLifecycle

import scala.concurrent.ExecutionContext

object Global extends StandaloneGlobal {
  override def lifecycleComponents(appLifecycle: ApplicationLifecycle)(implicit ec: ExecutionContext): List[LifecycleComponent] = {
    super.lifecycleComponents(appLifecycle) :+ new CachedHealthCheckLifeCycle(HealthCheck)
  }
}
