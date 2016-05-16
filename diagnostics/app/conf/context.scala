package conf

object HealthCheck extends AllGoodCachedHealthCheck(9006, "/robots.txt")

trait DiagnosticsHealthCheckLifeCycle extends CachedHealthCheckLifeCycle {
  override val healthCheckController = HealthCheck
}
