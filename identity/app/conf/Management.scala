package conf

object HealthCheck extends AllGoodCachedHealthCheck(9010, "/signin")

trait IdentityHealthCheckLifeCycle extends CachedHealthCheckLifeCycle {
  override val healthCheckController = HealthCheck
}
