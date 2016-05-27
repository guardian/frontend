package conf

import controllers.HealthCheck

trait OnwardHealthCheckLifeCycle extends CachedHealthCheckLifeCycle {
  override val healthCheckController = HealthCheck
}
