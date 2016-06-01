package conf

trait DiagnosticsHealthCheckLifeCycle extends CachedHealthCheckLifeCycle {
  override val healthCheckController = controllers.HealthCheck
}
