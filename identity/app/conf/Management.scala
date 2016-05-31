package conf

import controllers.HealthCheck


trait IdentityHealthCheckLifeCycle extends CachedHealthCheckLifeCycle {
  override val healthCheckController = HealthCheck
}
