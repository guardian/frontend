package conf

import controllers.HealthCheck


trait CommercialHealthCheckLifeCycle extends CachedHealthCheckLifeCycle {
  override val healthCheckController = HealthCheck
}
