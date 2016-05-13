package conf

object HealthCheck extends AllGoodCachedHealthCheck(9007, "/discussion/p/37v3a")

trait DiscussionHealthCheckLifeCycle extends CachedHealthCheckLifeCycle {
  override val healthCheckController = HealthCheck
}
