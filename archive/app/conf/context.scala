package conf

import controllers.HealthCheck

trait ArchiveHealthCheckLifeCycle extends CachedHealthCheckLifeCycle {
  override val healthCheckController = HealthCheck
}
