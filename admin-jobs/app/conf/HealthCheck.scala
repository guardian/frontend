package conf

import controllers.HealthCheck


trait AdminJobsHealthCheckLifeCycle extends CachedHealthCheckLifeCycle {
  override val healthCheckController = HealthCheck
}
