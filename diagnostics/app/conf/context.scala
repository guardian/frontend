package conf

import controllers.HealthCheck


trait DiagnosticsHealthCheckLifeCycle extends CachedHealthCheckLifeCycle {
  override val healthCheckController = HealthCheck
}
