package conf

import controllers.HealthCheck

trait ApplicationsHealthCheckLifeCycle extends CachedHealthCheckLifeCycle {
  override val healthCheckController = HealthCheck
}
