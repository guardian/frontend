package conf

object HealthCheck extends AllGoodCachedHealthCheck(9008, "/uk/business")

trait FaciaHealthCheckLifeCycle extends CachedHealthCheckLifeCycle {
  override val healthCheckController = HealthCheck
}
