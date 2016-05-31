package conf

import controllers.HealthCheck


trait FaciaHealthCheckLifeCycle extends CachedHealthCheckLifeCycle {
  override val healthCheckController = HealthCheck
}
